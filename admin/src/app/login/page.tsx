'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';
import { UserSession, AuthTokens } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading, isLoading, isAuthenticated, user, tokens } = useAuthStore();
  const [error, setError] = useState<string>('');

  // Eğer zaten authenticated ise dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated && user && tokens?.accessToken) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, tokens, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);

    try {
      const loginData = await apiClient.post<{
        user: Record<string, unknown>;
        accessToken: string;
      }>("/auth/login", data);

      // Backend'den gelen user objesini UserSession formatına çevir
      const userResponse = loginData.user as {
        _id?: string;
        id?: string;
        email: string;
        firstName: string;
        lastName: string;
        role: 'admin' | 'member' | 'guest';
        groups?: string[];
        status?: string;
        lastLoginAt?: string;
        createdAt?: string;
      };

      const userSession: UserSession = {
        id: userResponse._id || userResponse.id || '',
        email: userResponse.email,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
        role: userResponse.role,
        groups: userResponse.groups || [],
        isActive: userResponse.status === 'active',
        lastLoginAt: new Date(userResponse.lastLoginAt || Date.now()),
        createdAt: new Date(userResponse.createdAt || Date.now()),
      };

      // AuthTokens objesi oluştur (refresh token yoksa boş string)
      const authTokens: AuthTokens = {
        accessToken: loginData.accessToken,
        refreshToken: '', // Backend'de refresh token yok şimdilik
        expiresIn: 86400, // 24 saat (varsayılan)
      };

      login(userSession, authTokens);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <LogIn className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Admin Girişi</CardTitle>
            <CardDescription>
              homeTeam Admin Dashboard&apos;a giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hometeam.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Ana sayfaya dön
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-4 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Demo Hesapları:</h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>
                Email: admin@hometeam.com<br />
                Şifre: Admin123!
              </p>
              <p>
                Email: admin@hometeam.app<br />
                Şifre: admin123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
