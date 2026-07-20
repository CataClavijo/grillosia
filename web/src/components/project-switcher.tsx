"use client";

import { useState } from "react";
import { Check, ChevronDown, FolderOpen, Plus } from "lucide-react";

import { useProjects } from "@/lib/projects-store";
import { cn } from "@/lib/utils";

/**
 * Selector compacto del proyecto activo, con opción de crear uno nuevo.
 * Pensado para pegarse en cabeceras de rutas que dependen de un proyecto
 * (wizard, chat, resultados). Si no hay proyectos, ofrece crear el primero.
 */
export function ProjectSwitcher({ className }: { className?: string }) {
  const { projects, active, activeId, create, setActive } = useProjects();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const finishCreate = () => {
    const clean = name.trim() || `Proyecto ${projects.length + 1}`;
    create(clean);
    setName("");
    setCreating(false);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex max-w-[220px] items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[13px] font-semibold text-foreground/85 transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <FolderOpen className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
        <span className="truncate">
          {active ? active.name : "Sin consulta"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-40 mt-2 w-[260px] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl"
        >
          <ul className="max-h-[240px] overflow-y-auto">
            {projects.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-foreground/60">
                Aún no ha guardado consultas.
              </li>
            )}
            {projects.map((p) => {
              const isActive = p.id === activeId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(p.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-muted",
                      isActive && "bg-primary/10 text-foreground",
                    )}
                  >
                    <span className="truncate font-semibold">{p.name}</span>
                    {isActive && (
                      <Check
                        className="h-4 w-4 shrink-0 text-primary"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border">
            {creating ? (
              <div className="flex items-center gap-2 p-2">
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
                  placeholder="Nombre de la consulta"
                  className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-[14px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={finishCreate}
                  className="h-9 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Guardar consulta nueva
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
