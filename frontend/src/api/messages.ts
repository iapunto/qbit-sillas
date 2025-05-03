export interface Message {
  id: number;
  contact_id: number;
  direction: "inbound" | "outbound";
  message: string;
  media_url: string | null;
  created_at: string;
}

export async function fetchConversationByContactId(contactId: number): Promise<Message[]> {
  const res = await fetch(`http://localhost:3300/v1/contacts/${contactId}/conversation`);
  if (!res.ok) throw new Error("Error al obtener la conversación");
  return res.json();
}

export async function sendMessage(number: string, message: string, urlMedia?: string): Promise<void> {
  const res = await fetch("http://localhost:3300/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, message, urlMedia }),
  });
  if (!res.ok) throw new Error("Error al enviar el mensaje");
} 