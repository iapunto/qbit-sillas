import { useEffect, useRef, useState } from "react";
import { fetchConversationByContactId, sendMessage, Message } from "../../api/messages";
import { Contact } from "../../api/contacts";

interface ChatPanelProps {
  contact: Contact | null;
}

export default function ChatPanel({ contact }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Polling automático cada 2 segundos o cuando reloadTrigger cambia
  useEffect(() => {
    if (!contact) return;
    setLoading(true);
    setMessages([]);
    setError(null);

    const loadConversation = async () => {
      try {
        const data = await fetchConversationByContactId(contact.id);
        setMessages(data);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al cargar la conversación");
        }
        setLoading(false);
      }
    };

    loadConversation();
    const interval = setInterval(loadConversation, 2000);
    return () => clearInterval(interval);
  }, [contact, reloadTrigger]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !contact) return;
    setSending(true);
    try {
      await sendMessage(contact.phone_number, input.trim());
      setInput("");
      setTimeout(() => setReloadTrigger(t => t + 1), 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al enviar el mensaje");
      }
    } finally {
      setSending(false);
    }
  };

  if (!contact) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecciona un contacto para ver la conversación</div>;
  }

  if (loading) return <div className="p-4 text-center">Cargando conversación...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Conversación con {contact.name || contact.phone_number}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-white space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground">No hay mensajes</div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[70%] rounded-lg px-4 py-2 shadow text-sm whitespace-pre-line ${
              msg.direction === "inbound"
                ? "bg-gray-100 text-left self-start"
                : "bg-blue-100 text-right self-end"
            }`}
          >
            {msg.message}
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="p-4 border-t flex gap-2" onSubmit={handleSend}>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={sending || !input.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  );
} 