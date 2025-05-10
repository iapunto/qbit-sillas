export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:3300/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Credenciales inválidas");
  return res.json(); // { token, user }
}
