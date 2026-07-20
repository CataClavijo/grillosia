/**
 * Layout aislado para /reset: sin banner, sin footer, sin nada del proyecto.
 * La página de rescate tiene que sobrevivir aunque el resto de la app falle.
 */
export default function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
