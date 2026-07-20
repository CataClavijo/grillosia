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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
          Sus consultas guardadas
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/75">
          Aquí quedan anotadas sus consultas. Guardamos el animal, el clima
          que indicó y las preguntas del chat. Puede tener varias y cambiarse
          entre ellas cuando quiera.
        </p>
      </section>

      {/* Crear proyecto */}
      <section className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        {creating ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
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
              placeholder="Nombre para reconocerla (ej: Tilapia del patio)"
              aria-label="Nombre de la consulta"
              className="h-12 flex-1 text-base"
            />
            <Button size="lg" onClick={finishCreate} className="h-12 px-5">
              Crear e ir al asistente
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={() => setCreating(true)}
            className="h-auto w-full justify-between px-5 py-4 text-base"
          >
            <span className="flex items-center gap-3">
              <Plus data-icon="inline-start" />
              Empezar una consulta nueva
            </span>
            <ChevronRight data-icon="inline-end" />
          </Button>
        )}
        <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/65">
          Al empezar la consulta, la abrimos en el asistente guiado para que
          responda las preguntas y guarde su elección.
        </p>
      </section>

      {/* Lista */}
      <section className="mt-10">
        <h2 className="text-[18px] font-bold tracking-tight">
          {projects.length === 0
            ? "Aún no ha guardado consultas"
            : `${projects.length} consulta${projects.length === 1 ? "" : "s"}`}
        </h2>

        {projects.length === 0 && (
          <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/65">
            Cuando guarde su primera consulta verá aquí su lista y podrá abrirla
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
                      {isActive && <Badge>Activo</Badge>}
                    </div>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Actualizado {relativeTime(p.updatedAt)}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Borrar ${p.name}`}
                        className="size-11 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Borrar la consulta &ldquo;{p.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Se perderán sus respuestas y las conversaciones
                          guardadas en esta consulta. No se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-12 text-base">
                          No, dejarla
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => remove(p.id)}
                          className="h-12 bg-destructive text-base text-white hover:bg-destructive/90"
                        >
                          Sí, borrarla
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
