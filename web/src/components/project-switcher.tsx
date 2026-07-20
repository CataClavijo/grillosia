"use client";

import { useState } from "react";
import { Check, ChevronDown, FolderOpen, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/lib/projects-store";
import { cn } from "@/lib/utils";

/**
 * Selector de la consulta activa. Usa DropdownMenu de shadcn (portal + focus
 * trap + cierre por Escape) en vez del panel absoluto hecho a mano que se
 * quedaba clipeado dentro de cabeceras con overflow.
 */
export function ProjectSwitcher({ className }: { className?: string }) {
  const { projects, active, activeId, create, setActive } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const finishCreate = () => {
    const clean = name.trim() || `Consulta ${projects.length + 1}`;
    create(clean);
    setName("");
    setDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn("h-11 max-w-[200px] rounded-full", className)}
          >
            <FolderOpen data-icon="inline-start" className="text-primary" />
            <span className="truncate">
              {active ? active.name : "Sin consulta"}
            </span>
            <ChevronDown data-icon="inline-end" className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Sus consultas</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {projects.length === 0 && (
              <DropdownMenuItem disabled>
                Aún no ha guardado consultas
              </DropdownMenuItem>
            )}
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onSelect={() => setActive(p.id)}
                className="min-h-11"
              >
                <span className="flex-1 truncate font-medium">{p.name}</span>
                {p.id === activeId && (
                  <Check data-icon="inline-end" className="text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e: Event) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
            className="min-h-11 font-semibold text-primary"
          >
            <Plus data-icon="inline-start" />
            Guardar consulta nueva
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Guardar una consulta nueva</DialogTitle>
            <DialogDescription>
              Le ponemos un nombre para que la reconozca después.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-consulta-name">Nombre</Label>
            <Input
              id="new-consulta-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishCreate();
              }}
              placeholder="Ej: Tilapia del patio"
              autoFocus
              className="h-12 text-base"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-11">
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={finishCreate} className="h-11">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
