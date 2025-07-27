'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, tokens } = useAuthStore();

  useEffect(() => {
    // Auth store hydrate olduğunda auth check yap
    if (!isLoading) {
      // Eğer authenticated değilse veya user/token yoksa login'e yönlendir
      if (!isAuthenticated || !user || !tokens?.accessToken) {
        router.push('/login');
        return;
      }

      // localStorage'da token var mı kontrol et
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          router.push('/login');
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, tokens, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !tokens?.accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
