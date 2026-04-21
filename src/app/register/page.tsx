"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setError(data.message || "Une erreur est survenue");
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
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/20 mb-6">
              <span className="text-white font-black text-3xl">D</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-surface-900">Dnosp<span className="text-brand-primary">PF</span></h1>
            <p className="text-surface-500 mt-2 font-medium text-center">Rejoignez notre plateforme collaborative</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-6 text-center font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 text-sm p-4 rounded-xl mb-6 text-center font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Nom complet</label>
              <input
                type="text"
                placeholder="Jean Dupont"
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">E-mail professionnel</label>
              <input
                type="email"
                placeholder="nom@entreprise.com"
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Mot de passe</label>
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
              className="w-full py-4 bg-surface-900 text-white rounded-xl font-bold text-sm hover:bg-surface-800 disabled:opacity-50 transition-all shadow-lg shadow-surface-900/10 mt-4 active:scale-[0.98]"
            >
              {loading ? "Création..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-surface-400 text-[10px] text-center mt-8 leading-relaxed">
            En vous inscrivant, vous acceptez nos <span className="text-surface-900 font-bold">Conditions</span> et notre <span className="text-surface-900 font-bold">Politique de confidentialité</span>.
          </p>
        </div>

        <div className="bg-white border border-surface-200 p-6 mt-6 rounded-2xl shadow-sm text-center">
          <p className="text-sm font-medium text-surface-500">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-brand-primary font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
