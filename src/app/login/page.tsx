"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-surface-200 p-10 rounded-3xl shadow-premium">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/20 mb-6">
              <span className="text-white font-black text-3xl">D</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-surface-900">Dnosp<span className="text-brand-primary">PF</span></h1>
            <p className="text-surface-500 mt-2 font-medium">Bon retour parmi nous</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">E-mail</label>
              <input
                type="email"
                placeholder="nom@exemple.com"
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Mot de passe</label>
                <Link href="/register" className="text-brand-primary text-[11px] font-bold hover:underline">
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-surface-900 text-white rounded-xl font-bold text-sm hover:bg-surface-800 disabled:opacity-50 transition-all shadow-lg shadow-surface-900/10 mt-2 active:scale-[0.98]"
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-surface-100 flex-1"></div>
            <span className="text-surface-300 text-[10px] font-bold uppercase tracking-widest">ou continuer avec</span>
            <div className="h-px bg-surface-100 flex-1"></div>
          </div>
        </div>

        <div className="bg-white border border-surface-200 p-6 mt-6 rounded-2xl shadow-sm text-center">
          <p className="text-sm font-medium text-surface-500">
            Nouveau ici ?{" "}
            <Link href="/register" className="text-brand-primary font-bold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
