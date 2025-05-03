import { useEffect, useState } from "react";
import { fetchConversationByContactId, Message } from "@/api/messages";

// Por ahora, contactId simulado. Luego se conectará con la selección real.
const SIMULATED_CONTACT_ID = 1;

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversationByContactId(SIMULATED_CONTACT_ID)
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-center">Cargando conversación...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Conversación</h2>
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
      </div>
      <div className="p-4 border-t">
        {/* Aquí irá el input para enviar mensajes */}
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Escribe un mensaje..."
          disabled
        />
      </div>
    </div>
  );
} 