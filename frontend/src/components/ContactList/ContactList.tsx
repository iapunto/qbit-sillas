import { useEffect, useState } from "react";
import { fetchContacts, Contact } from "../../api/contacts";

interface ContactListProps {
  onSelect: (contact: Contact) => void;
  selectedContact: Contact | null;
}

export default function ContactList({ onSelect, selectedContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts()
      .then((data: Contact[]) => {
        setContacts(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al cargar los contactos");
        }
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
            className={`bg-white rounded shadow p-2 cursor-pointer hover:bg-gray-100 transition ${selectedContact?.id === contact.id ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => onSelect(contact)}
          >
            <div className="font-semibold">{contact.name || contact.phone_number}</div>
            <div className="text-xs text-muted-foreground">{contact.phone_number}</div>
            {contact.last_activity && (
              <div className="text-xs text-muted-foreground">Última actividad: {new Date(contact.last_activity).toLocaleString()}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 