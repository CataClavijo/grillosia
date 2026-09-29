"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Plus, Trash2 } from "lucide-react";

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
import { Barra } from "@/components/barra";
import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Estado } from "@/components/ds/estado";
import { animalPorId, etapaPorId } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";
import { cn } from "@/lib/utils";
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
    <>
      <Barra />
      <main className="mx-auto flex w-full max-w-[880px] flex-col px-5 pt-14 pb-24 lg:px-8 lg:pt-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <EncabezadoSeccion
            as="h1"
            tamano="h1"
            rotulo="Biblioteca"
            titulo="Mis consultas"
            entrada="Sus consultas quedan guardadas aquí para que pueda volver a su resultado o seguir preguntando."
          />
          {projects.length > 0 && (
            <Button onClick={nuevaConsulta} className="shrink-0 self-start sm:self-auto">
              <Plus />
              Nueva consulta
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <Estado
            tipo="vacio"
            titulo="Todavía no tiene consultas guardadas"
            className="mt-12"
            accion={
              <Button onClick={nuevaConsulta}>
                Hacer mi primera consulta
                <ArrowRight />
              </Button>
            }
          >
            Cuando haga una consulta, queda anotada aquí con su animal, su
            etapa y su clima.
          </Estado>
        ) : (
          <ul className="mt-12 flex flex-col divide-y divide-border border-y border-border">
            {projects.map((p) => {
              const animal = animalPorId(p.selection.animalId);
              const stage = etapaPorId(animal, p.selection.stageId);
              const isActive = p.id === activeId;
              return (
                <li key={p.id} className="group flex items-center gap-2">
                  {/* La fila entera es el destino */}
                  <button
                    type="button"
                    onClick={() => abrir(p.id)}
                    className="flex min-h-[76px] flex-1 items-center gap-4 rounded-md py-4 pr-2 text-left transition-colors duration-150"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        isActive ? "bg-primary" : "bg-transparent",
                      )}
                    />
                    <span className="flex-1">
                      <span className="t-h4 block transition-colors duration-150 group-hover:text-primary">
                        {animal ? `${animal.name}${stage ? ` · ${stage.name}` : ""}` : p.name}
                        {isActive && <span className="sr-only"> (consulta activa)</span>}
                      </span>
                      <span className="t-small mt-1 block text-subtle tabular-nums">
                        {p.selection.temp !== undefined && `${p.selection.temp}\u00a0°C · `}
                        {p.selection.humidity !== undefined &&
                          `${p.selection.humidity}\u00a0% HR · `}
                        {relativeTime(p.updatedAt)}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-5 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Borrar ${p.name}`}
                        className="shrink-0 text-faint hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Borrar esta consulta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se perderán sus respuestas y las conversaciones
                          guardadas. No se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="h-11 text-[15px]">
                          No, dejarla
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void remove(p.id)}
                          className="h-11 bg-destructive text-[15px] text-white hover:bg-destructive/90"
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
      </main>
    </>
  );
}
