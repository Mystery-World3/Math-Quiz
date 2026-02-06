
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const router = useRouter();

  const handleStart = () => {
    if (selectedClass) {
      router.push(`/student/setup?class=${encodeURIComponent(selectedClass)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Logo />
        <div className="text-sm text-muted-foreground italic hidden sm:block">
          Interactive Digital Learning Platform
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-12">
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary leading-tight">
            Belajar Jadi Lebih <span className="text-accent">Menyenangkan</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Akses Lembar Kerja Peserta Didik (LKPD) digital interaktif untuk menunjang proses pembelajaranmu di mana saja dan kapan saja.
          </p>
        </div>

        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex items-center gap-3 text-primary mb-2">
              <GraduationCap className="h-6 w-6" />
              <h2 className="text-xl font-bold">Pilih Kelas Kamu</h2>
            </div>
            
            <div className="space-y-4">
              <Select onValueChange={setSelectedClass} value={selectedClass}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Pilih jenjang kelas..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kelas 7">Kelas 7</SelectItem>
                  <SelectItem value="Kelas 8">Kelas 8</SelectItem>
                  <SelectItem value="Kelas 9">Kelas 9</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="w-full h-12 text-lg font-bold group" 
                disabled={!selectedClass}
                onClick={handleStart}
              >
                Mulai Belajar
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <Image 
            src="https://picsum.photos/seed/learn1/1200/600" 
            alt="Students Learning" 
            fill
            className="object-cover opacity-90"
            data-ai-hint="education students"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        </div>
      </main>

      <footer className="p-8 text-center text-sm text-muted-foreground bg-white/50">
        &copy; {new Date().getFullYear()} LearnScape - LKPD DIGITAL INTERAKTIF. All rights reserved.
      </footer>
    </div>
  );
}
