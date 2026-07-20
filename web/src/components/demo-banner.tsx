export function DemoBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 w-full border-b border-demo-border bg-demo-bg"
    >
      <p className="mx-auto w-full max-w-[640px] px-4 py-1.5 text-center text-[13px] font-semibold leading-tight text-demo-foreground">
        En pruebas · Estamos aprendiendo con usted
      </p>
    </div>
  );
}
