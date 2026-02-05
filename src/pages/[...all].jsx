import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
      <p className="text-sm text-gray-400">
        The page you are looking for does not exist.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-foreground"
        >
          Go Home
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-divider/10 px-4 py-2 text-sm font-semibold text-foreground"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
