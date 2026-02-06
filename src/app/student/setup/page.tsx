
"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { User, ClipboardCheck } from 'lucide-react';

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classLevel = searchParams.get('class') || 'Kelas 7';
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      router.push(`/student/exam?name=${encodeURIComponent(name)}&class=${encodeURIComponent(classLevel)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-6 max-w-7xl mx-auto w-full">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-accent">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Hampir Siap!</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="setup-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="class" className="text-muted-foreground">Kelas Terpilih</Label>
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-primary font-bold border border-primary/20">
                  <ClipboardCheck className="h-5 w-5" />
                  {classLevel}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  placeholder="Masukkan nama kamu..." 
                  className="h-12"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              form="setup-form" 
              className="w-full h-12 text-lg font-bold"
              disabled={!name.trim()}
            >
              Mulai Kerjakan Soal
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function StudentSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
