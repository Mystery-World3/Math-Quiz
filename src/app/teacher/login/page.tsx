
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TeacherLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple demo auth
    setTimeout(() => {
      if (password === 'admin123') {
        router.push('/teacher/dashboard');
      } else {
        toast({
          title: "Login Gagal",
          description: "Kata sandi yang Anda masukkan salah.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Dashboard Guru</CardTitle>
            <CardDescription>Masukkan kata sandi untuk mengakses area manajemen.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Password demo: admin123" 
                  className="h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              form="login-form" 
              className="w-full h-12 text-lg font-bold"
              disabled={isLoading}
            >
              {isLoading ? 'Sedang Masuk...' : (
                <><LogIn className="mr-2 h-5 w-5" /> Masuk Sekarang</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
