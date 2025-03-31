
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-center py-6">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          © {currentYear} Track4Health. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
