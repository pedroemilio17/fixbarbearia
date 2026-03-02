export function Footer() {
  return (
    <footer className="py-8">
      <div className="container mx-auto px-4 flex flex-col items-center gap-2 text-center">
        <a href="#hero" className="font-display text-xl font-bold tracking-wider text-foreground">
          FIX<span className="text-primary">BARBEARIA</span>
        </a>
        <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} FixBarbearia. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
