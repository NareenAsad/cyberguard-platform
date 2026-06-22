import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 py-4 md:py-6 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Copyright - Left */}
        <p className="text-muted-foreground text-xs md:text-sm flex items-center gap-2 text-center sm:text-left">
          &copy; {new Date().getFullYear()} CyberGuard. All rights reserved.
        </p>

        {/* Social Icons - Right */}
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="https://github.com/NareenAsad/cyberguard-platform"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex items-center justify-center w-8 md:w-9 h-8 md:h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:border-border/80 transition-all duration-200 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 md:w-5 h-4 md:h-5">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c2.6-.4 5.6-2 5.6-7 0-1.25-.45-2.4-1.2-3.3.15-.375.2-.822.05-1.254a3.46 3.46 0 0 0-.9-1.416c-.4-.04-.78-.04-1.17 0-.5.84-1.3 1.54-2.15 2.05C13.02 2.5 12.05 2 11 2 9.22 2 7.5 2.88 6.5 4.3c-.9.75-1.35 1.82-1.35 2.95 0 .85.15 1.67.4 2.45-.75.9-1.2 2.05-1.2 3.3 0 5 3 6.6 5.6 7-.35.36-.6.85-.65 1.4-.2.1-.4.2-.65.2-1 0-1.8-.3-2.4-.8-.6-.5-1-1.2-1.2-2s-.4-1-.9-1.3c-.5-.3-1-.3-1.2 0l-.2.2c-.3.3-.2 1 0 1.2.6.8 1.6 1.6 2.5 1.8l.5.1v1.6c-1 .3-2.5.5-4 .5h-4v1h4c1.5 0 3-.2 4-.5v-1.6l.5-.1c.9-.2 1.9-1 2.5-1.8.2-.2.3-.9 0-1.2l-.2-.2z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex items-center justify-center w-8 md:w-9 h-8 md:h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 md:w-5 h-4 md:h-5">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a
            href="mailto:nareenasad07@gmail.com"
            aria-label="Email"
            className="flex items-center justify-center w-8 md:w-9 h-8 md:h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 flex-shrink-0"
          >
            <Mail className="w-4 md:w-5 h-4 md:h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}