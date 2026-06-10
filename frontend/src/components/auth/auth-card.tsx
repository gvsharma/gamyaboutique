import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className={cn("container-premium flex min-h-[70vh] items-center justify-center py-16 sm:py-20", className)}>
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-2xl bg-pearl p-8 shadow-soft sm:p-10">
          <h1 className="font-display text-section-title text-charcoal">{title}</h1>
          {subtitle && <div className="mt-3 text-body">{subtitle}</div>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 border-t border-charcoal/5 pt-6 text-center text-sm text-stone">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-maroon transition-colors hover:text-maroon-hover">
      {children}
    </Link>
  );
}
