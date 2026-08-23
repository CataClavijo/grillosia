"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { StepFooter } from "@/components/step-footer";
import { ANIMALS } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";
import { clearWizardDraft } from "@/lib/wizard-draft";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return `hace ${Math.floor(days / 30)} m`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, activeId, setActive, remove } = useProjects();

  const abrir = (id: string) => {
    setActive(id);
    router.push("/consulta");
  };

  /**
   * Soltar la consulta activa antes de ir al asistente. Si no, el asistente
   * se hidrata con la consulta anterior y salta directo a su resultado, y el
   * usuario nunca puede hacer una segunda.
   */
  const nuevaConsulta = () => {
    setActive(null);
    clearWizardDraft();
    router.push("/consulta");
  };

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-col gap-8 px-6 pb-16 pt-5">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>

      <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em]">
        Mis consultas
      </h1>

      {projects.length === 0 ? (
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Todavía no tiene consultas guardadas. Cuando use el asistente,
          quedan anotadas aquí para que pueda volver.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
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
                className={`flex items-center gap-2 rounded-2xl transition-colors ${
                  isActive ? "bg-primary/10" : "bg-card hover:bg-muted"
                }`}
              >
                {/* La fila entera es el destino */}
                <button
                  type="button"
                  onClick={() => abrir(p.id)}
                  className="flex min-h-20 flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left"
                >
                  <span className="flex-1">
                    <span className="block text-[17px] font-bold leading-tight">
                      {animal
                        ? `${animal.name}${stage ? ` · ${stage.name}` : ""}`
                        : p.name}
                    </span>
                    <span className="mt-1 block text-[13px] text-muted-foreground">
                      {p.selection.temp !== undefined &&
                        `${p.selection.temp} °C · `}
                      {p.selection.humidity !== undefined &&
                        `${p.selection.humidity} % · `}
                      {relativeTime(p.updatedAt)}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Borrar ${p.name}`}
                      className="mr-2 size-11 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Borrar esta consulta?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Se perderán sus respuestas y las conversaciones
                        guardadas. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-12 text-base">
                        No, dejarla
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void remove(p.id)}
                        className="h-12 bg-destructive text-base text-white hover:bg-destructive/90"
                      >
                        Sí, borrarla
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            );
          })}
        </ul>
      )}

      <StepFooter
        primary={{ label: "Hacer una consulta nueva", onClick: nuevaConsulta }}
      />
    </main>
  );
}
