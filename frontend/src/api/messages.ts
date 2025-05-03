export interface Message {
  id: number;
  contact_id: number;
  direction: "inbound" | "outbound";
  message: string;
  media_url: string | null;
  created_at: string;
}

export async function fetchConversationByContactId(contactId: number): Promise<Message[]> {
  const res = await fetch(`http://localhost:3000/api/contacts/${contactId}/conversation`);
  if (!res.ok) throw new Error("Error al obtener la conversación");
  return res.json();
} 