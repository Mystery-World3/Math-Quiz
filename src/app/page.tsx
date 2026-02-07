
"use client";

import { useState, useEffect } from 'react';
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
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { getClasses } from '@/lib/storage';
import { ClassLevelData } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { ModeToggle } from '@/components/ModeToggle';

export default function LandingPage() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<ClassLevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const db = useFirestore();

  useEffect(() => {
    async function loadClasses() {
      if (db) {
        try {
          const data = await getClasses(db);
          setClasses(data);
        } catch (error) {
          console.error("Error loading classes:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadClasses();
  }, [db]);

  const handleStart = () => {
    if (selectedClass) {
      router.push(`/student/setup?class=${encodeURIComponent(selectedClass)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground italic hidden sm:block">
            Interactive Digital Learning Platform
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
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
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Pilih jenjang kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Belum ada kelas</div>
                    ) : (
                      classes.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}

              <Button 
                className="w-full h-12 text-lg font-bold group" 
                disabled={!selectedClass || loading}
                onClick={handleStart}
              >
                Mulai Belajar
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="p-8 text-center text-sm text-muted-foreground bg-white/5 dark:bg-black/20">
        &copy; {new Date().getFullYear()} LearnScape - LKPD DIGITAL INTERAKTIF. All rights reserved.
      </footer>
    </div>
  );
}
