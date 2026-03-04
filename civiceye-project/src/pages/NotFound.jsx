import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-4xl font-bold text-slate-900">404 - Page Not Found</h1>
        <p className="text-slate-600">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button variant="default">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
