import React from 'react';
import { AppProvider } from '@/app/context/AppContext';
import { AppRouterProvider } from '@/app/navigation';
import RootLayout from '@/app/layout';
import { AppRouter } from '@/app/AppRouter';

export default function App() {
  return (
    <AppProvider>
      <AppRouterProvider>
        <RootLayout>
          <AppRouter />
        </RootLayout>
      </AppRouterProvider>
    </AppProvider>
  );
}
