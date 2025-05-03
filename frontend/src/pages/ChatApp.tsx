import ContactList from "@/components/ContactList/ContactList";
import ChatPanel from "@/components/ChatPanel/ChatPanel";
import ContactDetail from "@/components/ContactDetail/ContactDetail";

export default function ChatApp() {
  return (
    <div className="flex h-screen">
      {/* Panel de contactos */}
      <aside className="w-1/4 bg-muted border-r overflow-y-auto">
        <ContactList />
      </aside>
      {/* Panel de conversación */}
      <main className="flex-1 flex flex-col bg-background">
        <ChatPanel />
      </main>
      {/* Panel de detalles */}
      <aside className="w-1/4 bg-muted border-l p-4 overflow-y-auto">
        <ContactDetail />
      </aside>
    </div>
  );
} 