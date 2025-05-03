import { useState } from "react";
import ContactList from "../components/ContactList/ContactList";
import ChatPanel from "../components/ChatPanel/ChatPanel";
import ContactDetail from "../components/ContactDetail/ContactDetail";
import { Contact } from "../api/contacts";

export default function ChatApp() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="flex h-screen">
      {/* Panel de contactos */}
      <aside className="w-1/4 bg-muted border-r overflow-y-auto">
        <ContactList onSelect={setSelectedContact} selectedContact={selectedContact} />
      </aside>
      {/* Panel de conversación */}
      <main className="flex-1 flex flex-col bg-background">
        <ChatPanel contact={selectedContact} />
      </main>
      {/* Panel de detalles */}
      <aside className="w-1/4 bg-muted border-l p-4 overflow-y-auto">
        <ContactDetail contact={selectedContact} />
      </aside>
    </div>
  );
} 