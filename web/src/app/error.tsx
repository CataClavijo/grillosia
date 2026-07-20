"use client";

import Link from "next/link";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[520px] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-[1.5rem] font-bold leading-tight">
        Hubo un problema
      </h1>
      <p className="max-w-[30ch] text-[16px] leading-relaxed text-foreground/85">
        Puede intentar de nuevo. Si le sigue pasando, entre a{" "}
        <Link
          href="/reset"
          className="font-semibold text-primary underline underline-offset-2"
        >
          restablecer la aplicación
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 text-[16px] font-bold text-primary-foreground"
      >
        Intentar de nuevo
      </button>
    </main>
  );
}
