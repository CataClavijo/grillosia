"use client";

import { useEffect, useState } from "react";
import { Check, Send } from "lucide-react";

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

  const claseCampo =
    "mt-1.5 h-11 w-full rounded-md border border-input bg-surface px-3 text-[15px] text-foreground outline-none transition-colors duration-150 placeholder:text-faint focus:border-primary focus-visible:outline-none focus:ring-2 focus:ring-primary/20";
  const claseEtiqueta = "text-[14px] font-medium text-foreground/85";

  if (status === "saved") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-lg bg-success-soft p-5">
        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <Check className="size-4" strokeWidth={2.5} aria-hidden />
        </span>
        <div>
          <p className="t-h4">Gracias por su interés</p>
          <p className="t-small mt-1 text-subtle">
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
            className="mt-3 text-[14px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Editar mi registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={claseEtiqueta}>Correo electrónico</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usted@correo.com"
            aria-invalid={error ? true : undefined}
            className={claseCampo}
          />
        </label>

        <label className="block">
          <span className={claseEtiqueta}>¿A qué se dedica?</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={claseCampo}>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={claseEtiqueta}>
            Región <span className="font-normal text-subtle">(opcional)</span>
          </span>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ej.: Granada, Meta"
            className={claseCampo}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-[14px] font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-caption max-w-[42ch]">
          Sus datos quedan solo en este dispositivo mientras se habilita el
          registro en la nube. No los compartimos.
        </p>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          Avísenme
          <Send className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
