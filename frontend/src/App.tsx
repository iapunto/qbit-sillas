import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ChatApp from "./pages/ChatApp";

function AppRouter() {
  const { token, login } = useAuth();
  if (!token) return <LoginPage onLogin={login} />;
  return <ChatApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
