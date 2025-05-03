export interface Contact {
  id: number;
  phone_number: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  last_activity?: string;
}

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch("http://localhost:3300/v1/contacts");
  if (!res.ok) throw new Error("Error al obtener contactos");
  return res.json();
}

export async function fetchContactById(id: number): Promise<Contact> {
  const res = await fetch(`http://localhost:3300/v1/contacts/${id}`);
  if (!res.ok) throw new Error("Error al obtener el contacto");
  return res.json();
} 