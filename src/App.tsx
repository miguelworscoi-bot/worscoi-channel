import React from 'react';
import { AppProvider } from '@/app/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppRouterProvider } from '@/app/navigation';
import RootLayout from '@/app/layout';
import { AppRouter } from '@/app/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouterProvider>
          <RootLayout>
            <AppRouter />
          </RootLayout>
        </AppRouterProvider>
      </AppProvider>
    </AuthProvider>
  );
}
