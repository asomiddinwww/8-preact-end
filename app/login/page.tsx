"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ModeToggle } from "@/components/mode";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email yoki parol xato!");
      }

      const user = data.data;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));

        if (user.role) {
          Cookies.set("role", user.role, { expires: 7 });
        }
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[90vh] flex items-center justify-center p-0! relative transition-colors duration-300">
      <div className="absolute top-5 left-5">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl transition-all">
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">
          Xush kelibsiz 👋
        </h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          Tizimga kirish uchun ma'lumotlarni kiriting
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2.5 rounded-lg bg-secondary border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="admin@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Parol
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2.5 rounded-lg bg-secondary border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground/50"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive text-xs p-3 rounded-lg animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center shadow-md"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Tizimga kirish"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
