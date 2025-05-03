import { useEffect, useState } from "react";
import { fetchContacts, Contact } from "@/api/contacts";

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts()
      .then((data) => {
        setContacts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-center">Cargando contactos...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Contactos</h2>
      <div className="space-y-2">
        {contacts.length === 0 && (
          <div className="bg-white rounded shadow p-2 text-center text-muted-foreground">No hay contactos</div>
        )}
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded shadow p-2 cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="font-semibold">{contact.name || contact.phone_number}</div>
            <div className="text-xs text-muted-foreground">{contact.phone_number}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 