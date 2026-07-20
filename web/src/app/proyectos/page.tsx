"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { ANIMALS } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  const months = Math.floor(days / 30);
  return `hace ${months} m`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, activeId, create, setActive, remove } = useProjects();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const finishCreate = () => {
    const clean = name.trim() || `Proyecto ${projects.length + 1}`;
    const id = create(clean);
    setName("");
    setCreating(false);
    setActive(id);
    router.push("/wizard");
  };

  return (
    <main className="relative mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>

      <section className="mt-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FolderOpen className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          Sus proyectos de cría
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/75">
          Un proyecto guarda su animal destino, el clima que indicó y la
          conversación con el asistente. Puede tener varios y cambiarse entre
          ellos cuando quiera.
        </p>
      </section>

      {/* Crear proyecto */}
      <section className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        {creating ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishCreate();
                if (e.key === "Escape") {
                  setCreating(false);
                  setName("");
                }
              }}
              autoFocus
              placeholder="Nombre del proyecto (ej: Tilapia patio)"
              aria-label="Nombre del proyecto"
              className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <Button
              size="lg"
              onClick={finishCreate}
              className="h-12 rounded-xl px-5 font-semibold"
            >
              Crear e ir al asistente
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-primary px-5 py-4 text-left text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span className="flex items-center gap-3">
              <Plus className="h-5 w-5" strokeWidth={2.25} />
              Crear un proyecto nuevo
            </span>
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
        <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/65">
          Al crear el proyecto, lo abrimos automáticamente en el asistente
          guiado para que responda las preguntas y guarde su elección.
        </p>
      </section>

      {/* Lista */}
      <section className="mt-10">
        <h2 className="text-[18px] font-bold tracking-tight">
          {projects.length === 0
            ? "Aún no tiene proyectos"
            : `${projects.length} proyecto${projects.length === 1 ? "" : "s"}`}
        </h2>

        {projects.length === 0 && (
          <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/65">
            Cuando cree su primer proyecto verá aquí su lista y podrá abrirlo
            desde cualquier momento.
          </p>
        )}

        <ul className="mt-5 space-y-3">
          {projects.map((p) => {
            const animal = p.selection.animalId
              ? ANIMALS.find((a) => a.id === p.selection.animalId)
              : null;
            const stage = animal?.stages.find(
              (s) => s.id === p.selection.stageId,
            );
            const isActive = p.id === activeId;
            return (
              <li
                key={p.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card/70"
                }`}
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-[17px] font-bold leading-tight">
                        {p.name}
                      </h3>
                      {isActive && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-primary-foreground">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12.5px] text-foreground/55">
                      Actualizado {relativeTime(p.updatedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Seguro que quiere eliminar "${p.name}"? Esta acción no se puede deshacer.`,
                        )
                      ) {
                        remove(p.id);
                      }
                    }}
                    aria-label={`Eliminar ${p.name}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </header>

                <div className="mt-3 flex flex-wrap gap-2 text-[12.5px] font-semibold">
                  {animal ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/75">
                      {animal.name}
                      {stage ? ` · ${stage.name}` : ""}
                    </span>
                  ) : (
                    <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-foreground/50">
                      Sin animal seleccionado aún
                    </span>
                  )}
                  {p.selection.temp !== undefined && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/75">
                      {p.selection.temp} °C
                    </span>
                  )}
                  {p.selection.humidity !== undefined && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/75">
                      {p.selection.humidity} % HR
                    </span>
                  )}
                  {p.chat.length > 0 && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/75">
                      {p.chat.filter((m) => m.role !== "system").length} mensajes
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(p.id);
                      router.push("/wizard");
                    }}
                    className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" strokeWidth={2} />
                      Abrir asistente
                    </span>
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(p.id);
                      router.push("/chat");
                    }}
                    className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare
                        className="h-4 w-4 text-primary"
                        strokeWidth={2}
                      />
                      Continuar chat
                    </span>
                    <ChevronRight
                      className="h-4 w-4 text-primary"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
