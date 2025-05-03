export interface Contact {
  id: number;
  phone_number: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch("http://localhost:3300/api/contacts");
  if (!res.ok) throw new Error("Error al obtener contactos");
  return res.json();
}

export async function fetchContactById(id: number): Promise<Contact> {
  const res = await fetch(`http://localhost:3300/api/contacts/${id}`);
  if (!res.ok) throw new Error("Error al obtener el contacto");
  return res.json();
} 