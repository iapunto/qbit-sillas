import { createBot, createFlow } from "@builderbot/bot";
import { provider } from "~/provider";
import { adapterDB } from "~/database";
import welcomeFlow from "~/flows/welcomeFlow";
import { config } from "~/config";
import sellerFlow from "~/flows/sellerFlow";
import { logger } from "~/utils/logger";
import { saveBotMessageToDB } from "~/utils/handledHistory";
import { getConversationByContact } from "~/database/messageRepository";
import { getAllContacts } from "~/database/contactRepository";
import {
  getAllTags,
  getTagsByContact,
  addTagToContact,
  removeTagFromContact,
  createTag,
} from "./database/tagRepository";
import { getCompany, updateCompany } from "./database/companyRepository";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById, createUser, updateUser, deleteUser, getAllUsers } from "./database/userRepository";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const PORT = config.port;

// Middleware de autenticación y autorización
function auth(requiredRole?: "admin" | "agent" | "viewer") {
  return (handler: any) => async (bot: any, req: any, res: any) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).end(JSON.stringify({ error: "No autenticado" }));
    }
    const token = authHeader.replace("Bearer ", "");
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).end(JSON.stringify({ error: "No autorizado" }));
      }
      return handler(bot, req, res);
    } catch (err) {
      return res.status(401).end(JSON.stringify({ error: "Token inválido" }));
    }
  };
}

function setupRoutes(handleCtx: any) {
  provider.server.post(
    "/v1/messages",
    handleCtx(async (bot: any, req: any, res: any) => {
      const { number, message, urlMedia } = req.body;
      await bot?.sendMessage(number, message, { media: urlMedia ?? null });
      await saveBotMessageToDB(number, message, urlMedia);
      return res.end("sended");
    })
  );
  
  // NUEVO ENDPOINT PARA OBTENER LA CONVERSACIÓN DE UN CONTACTO
  provider.server.get(
    "/v1/contacts/:contactId/conversation",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { contactId } = req.params;
      try {
        const messages = await getConversationByContact(Number(contactId));
        res.end(JSON.stringify(messages));
      } catch (error) {
        logger.error("Error al obtener la conversación:", error);
        res.status(500).json({ error: "Error al obtener la conversación" });
      }
    })
  );

  provider.server.get(
    "/v1/contacts",
    handleCtx(async (_bot: any, _req: any, res: any) => {
      try {
        const contacts = await getAllContacts();
        res.end(JSON.stringify(contacts));
      } catch (error) {
        logger.error("Error al obtener los contactos:", error);
        res.status(500).end(JSON.stringify({ error: "Error al obtener los contactos" }));
      }
    })
  );

  // ENDPOINTS DE TAGS
  provider.server.get(
    "/v1/tags",
    handleCtx(async (_bot: any, _req: any, res: any) => {
      try {
        const tags = await getAllTags();
        res.end(JSON.stringify(tags));
      } catch (error) {
        logger.error("Error al obtener tags:", error);
        res.status(500).end(JSON.stringify({ error: "Error al obtener tags" }));
      }
    })
  );

  provider.server.get(
    "/v1/contacts/:contactId/tags",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { contactId } = req.params;
      try {
        const tags = await getTagsByContact(Number(contactId));
        res.end(JSON.stringify(tags));
      } catch (error) {
        logger.error("Error al obtener tags del contacto:", error);
        res.status(500).end(JSON.stringify({ error: "Error al obtener tags del contacto" }));
      }
    })
  );

  provider.server.post(
    "/v1/contacts/:contactId/tags",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { contactId } = req.params;
      const { tagId } = req.body;
      try {
        await addTagToContact(Number(contactId), Number(tagId));
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        logger.error("Error al agregar tag al contacto:", error);
        res.status(500).end(JSON.stringify({ error: "Error al agregar tag al contacto" }));
      }
    })
  );

  provider.server.delete(
    "/v1/contacts/:contactId/tags/:tagId",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { contactId, tagId } = req.params;
      try {
        await removeTagFromContact(Number(contactId), Number(tagId));
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        logger.error("Error al eliminar tag del contacto:", error);
        res.status(500).end(JSON.stringify({ error: "Error al eliminar tag del contacto" }));
      }
    })
  );

  provider.server.post(
    "/v1/tags",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { name, color } = req.body;
      try {
        const tag = await createTag(name, color);
        res.end(JSON.stringify(tag));
      } catch (error) {
        logger.error("Error al crear tag:", error);
        res.status(500).end(JSON.stringify({ error: "Error al crear tag" }));
      }
    })
  );

  // ENDPOINTS DE AUTENTICACIÓN Y USUARIOS
  provider.server.post(
    "/v1/auth/login",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { email, password } = req.body;
      const user = await getUserByEmail(email);
      if (!user) return res.status(401).end(JSON.stringify({ error: "Credenciales inválidas" }));
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).end(JSON.stringify({ error: "Credenciales inválidas" }));
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      res.end(JSON.stringify({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url } }));
    })
  );

  provider.server.get(
    "/v1/users/me",
    handleCtx(auth()(async (_bot: any, req: any, res: any) => {
      const user = await getUserById(req.user.id);
      if (!user) return res.status(404).end(JSON.stringify({ error: "Usuario no encontrado" }));
      res.end(JSON.stringify(user));
    }))
  );

  provider.server.put(
    "/v1/users/me",
    handleCtx(auth()(async (_bot: any, req: any, res: any) => {
      const user = await updateUser(req.user.id, req.body);
      res.end(JSON.stringify(user));
    }))
  );

  provider.server.get(
    "/v1/users",
    handleCtx(auth("admin")(async (_bot: any, _req: any, res: any) => {
      const users = await getAllUsers();
      res.end(JSON.stringify(users));
    }))
  );

  provider.server.post(
    "/v1/users",
    handleCtx(auth("admin")(async (_bot: any, req: any, res: any) => {
      const { name, email, password, role, avatar_url } = req.body;
      const password_hash = await bcrypt.hash(password, 10);
      const user = await createUser({ name, email, password_hash, role, avatar_url });
      res.end(JSON.stringify(user));
    }))
  );

  provider.server.put(
    "/v1/users/:id",
    handleCtx(auth("admin")(async (_bot: any, req: any, res: any) => {
      const user = await updateUser(Number(req.params.id), req.body);
      res.end(JSON.stringify(user));
    }))
  );

  provider.server.delete(
    "/v1/users/:id",
    handleCtx(auth("admin")(async (_bot: any, req: any, res: any) => {
      await deleteUser(Number(req.params.id));
      res.end(JSON.stringify({ success: true }));
    }))
  );

  // ENDPOINTS DE EMPRESA (solo admin puede editar)
  provider.server.get(
    "/v1/company",
    handleCtx(auth()(async (_bot: any, _req: any, res: any) => {
      try {
        const company = await getCompany();
        res.end(JSON.stringify(company));
      } catch (error) {
        logger.error("Error al obtener la empresa:", error);
        res.status(500).end(JSON.stringify({ error: "Error al obtener la empresa" }));
      }
    }))
  );

  provider.server.put(
    "/v1/company",
    handleCtx(auth("admin")(async (_bot: any, req: any, res: any) => {
      try {
        const company = await updateCompany(req.body);
        res.end(JSON.stringify(company));
      } catch (error) {
        logger.error("Error al actualizar la empresa:", error);
        res.status(500).end(JSON.stringify({ error: "Error al actualizar la empresa" }));
      }
    }))
  );
}

async function initializeBot() {
  logger.info("Iniciando la aplicación...");
  const adapterFlow = createFlow([welcomeFlow, sellerFlow]);
  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: provider,
    database: adapterDB,
  });
  setupRoutes(handleCtx);
  return httpServer;
}

async function startServer() {
  try {
    const httpServer = await initializeBot();
    httpServer(+PORT);
    logger.info(`Servidor escuchando en el puerto ${PORT}`);
  } catch (error) {
    logger.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
}

startServer();
