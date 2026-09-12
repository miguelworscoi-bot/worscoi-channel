import React from 'react';
import { usePathname } from '@/app/navigation';
import HomePage from '@/app/page';
import GratisPage from '@/app/gratis/page';
import ComparadorPage from '@/app/comparador/page';
import DesejosPage from '@/app/desejos/page';
import NotFoundPage from '@/app/not-found';

export function AppRouter() {
  const pathname = usePathname();

  // Normalize path
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

  switch (cleanPath) {
    case '/':
      return <HomePage />;
    case '/gratis':
      return <GratisPage />;
    case '/comparador':
      return <ComparadorPage />;
    case '/desejos':
      return <DesejosPage />;
    default:
      return <NotFoundPage />;
  }
}
