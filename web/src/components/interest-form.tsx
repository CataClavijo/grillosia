"use client";

import { useEffect, useState } from "react";
import { Check, Mail, Send } from "lucide-react";

interface Interest {
  email: string;
  role: string;
  region?: string;
  createdAt: number;
}

const ROLES = [
  { id: "piscicultor", label: "Piscicultura" },
  { id: "avicultor", label: "Avicultura" },
  { id: "porcicultor", label: "Porcicultura" },
  { id: "investigador", label: "Investigación" },
  { id: "otro", label: "Otro" },
];

const STORAGE_KEY = "grillia-interest";

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function InterestForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("piscicultor");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"idle" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  // Detecta si ya se registró antes en este dispositivo.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Interest = JSON.parse(raw);
        if (parsed?.email) setStatus("saved");
      }
    } catch {
      /* noop */
    }
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!isEmail(email)) {
      setError("Escriba un correo electrónico válido.");
      return;
    }
    const entry: Interest = {
      email: email.trim(),
      role,
      region: region.trim() || undefined,
      createdAt: Date.now(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      setStatus("saved");
    } catch {
      setError("No pudimos guardar su registro en este dispositivo.");
    }
  };

  if (status === "saved") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <p className="mt-3 text-[15.5px] font-bold">Gracias por su interés</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/70">
          Tenemos su registro en este dispositivo. Le avisaremos cuando la
          plataforma tenga novedades.
        </p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setEmail("");
            setRegion("");
            setStatus("idle");
          }}
          className="mt-4 text-[12px] font-semibold text-primary underline underline-offset-2"
        >
          Editar mi registro
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border/70 bg-card/70 p-5"
      noValidate
    >
      <div className="flex items-center gap-2 text-primary">
        <Mail className="h-4 w-4" strokeWidth={2} />
        <span className="text-[12px] font-bold uppercase tracking-wider">
          Manténgame informado
        </span>
      </div>
      <p className="mt-2 text-[15px] font-bold leading-tight">
        Le avisamos cuando el modelo esté validado.
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-foreground/65">
        Sus datos quedan solo en este dispositivo mientras se habilita el
        registro en la nube. No los compartimos.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-wider text-foreground/60">
            Correo electrónico
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usted@correo.com"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-wider text-foreground/60">
            ¿A qué se dedica?
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-wider text-foreground/60">
            Región (opcional)
          </span>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ej: Villavicencio, Meta"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 text-[13px] font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-between gap-2 rounded-xl bg-primary px-4 py-3 text-[14.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Guardar mi interés
        <Send className="h-4 w-4" strokeWidth={2} />
      </button>
    </form>
  );
}
