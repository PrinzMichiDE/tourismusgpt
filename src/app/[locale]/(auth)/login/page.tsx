'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'de';
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const labels = {
    de: {
      title: 'Anmelden',
      description: 'Geben Sie Ihre Anmeldedaten ein',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      loading: 'Wird angemeldet...',
      forgotPassword: 'Passwort vergessen?',
      success: 'Erfolgreich angemeldet',
      error: 'Anmeldung fehlgeschlagen',
    },
    en: {
      title: 'Login',
      description: 'Enter your credentials to login',
      email: 'Email',
      password: 'Password',
      submit: 'Login',
      loading: 'Logging in...',
      forgotPassword: 'Forgot password?',
      success: 'Successfully logged in',
      error: 'Login failed',
    },
  };

  const t = labels[locale as 'de' | 'en'];

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // In production, use NextAuth signIn
      // await signIn('credentials', { ...data, redirect: false });
      
      // Simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(t.success);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              LDB
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ldb-dataguard.de"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.password}</Label>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                >
                  {t.forgotPassword}
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.loading}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
