import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 py-6 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        {/* Copyright - Left */}
        <p className="text-muted-foreground text-sm flex items-center gap-2">
          &copy; {new Date().getFullYear()} CyberGuard. All rights reserved.
        </p>

        {/* Social Icons - Right */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/NareenAsad/cyberguard-platform"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:border-border/80 transition-all duration-200 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /><path d="M9 18c-4.5 1.6-5-2.5-7-3" /></svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
          </a>
          <a
            href="mailto:nareenasad07@gmail.com"
            aria-label="Email"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 hover:scale-110"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

