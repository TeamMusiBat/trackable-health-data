
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-sm text-muted-foreground">
            © {currentYear} Track4Health. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
