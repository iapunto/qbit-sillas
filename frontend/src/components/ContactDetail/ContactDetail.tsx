import { Contact } from "../../api/contacts";

interface ContactDetailProps {
  contact: Contact | null;
}

export default function ContactDetail({ contact }: ContactDetailProps) {
  if (!contact) {
    return (
      <div>
        <h2 className="text-lg font-bold mb-4">Detalle del contacto</h2>
        <div className="bg-white rounded shadow p-4 text-muted-foreground">
          Selecciona un contacto para ver los detalles
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Detalle del contacto</h2>
      <div className="bg-white rounded shadow p-4">
        <div className="font-semibold text-lg mb-2">{contact.name || contact.phone_number}</div>
        <div className="text-sm text-muted-foreground mb-1">Número: {contact.phone_number}</div>
        {contact.last_activity && (
          <div className="text-xs text-muted-foreground mb-1">Última actividad: {new Date(contact.last_activity).toLocaleString()}</div>
        )}
        <div className="text-xs text-muted-foreground">ID: {contact.id}</div>
      </div>
    </div>
  );
} 