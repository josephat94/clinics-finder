export default function SearchClinicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // El <html>/<body> los provee el layout raíz; aquí solo se pasa el contenido.
  return <>{children}</>;
}
