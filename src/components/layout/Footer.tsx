import { WELLNESS_CENTRE_LOGO_URL } from '@/lib/assets';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-tight section-padding flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <div className="flex items-center gap-2">
          <img
            src={WELLNESS_CENTRE_LOGO_URL}
            alt="Wellness Centre"
            className="h-8 w-auto object-contain"
          />
          <span className="font-playfair-display text-lg font-semibold">Wellness Centre</span>
        </div>
      </div>
    </footer>
  );
}
