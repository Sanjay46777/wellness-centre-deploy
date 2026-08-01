import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="container-tight section-padding flex min-h-[calc(100vh-64px)] flex-col items-center justify-center text-center">
      <h1 className="font-playfair-display text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <Link to="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
