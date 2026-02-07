"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Submission, ClassLevelData } from '@/lib/types';
import { 
  Users, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, 
  Settings, 
  Loader2, 
  BarChart3, 
  Menu,
  Filter
} from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { collection, query, orderBy } from 'firebase/firestore';
import { ModeToggle } from '@/components/ModeToggle';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getClasses } from '@/lib/storage';

export default function TeacherDashboard() {
  const db = useFirestore();
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [classes, setClasses] = useState<ClassLevelData[]>([]);
  
  const submissionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: submissions, loading } = useCollection<Submission>(submissionsQuery);

  useEffect(() => {
    async function loadClasses() {
      if (db) {
        const data = await getClasses(db);
        setClasses(data);
      }
    }
    loadClasses();
  }, [db]);

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (selectedClass === 'all') return submissions;
    return submissions.filter(s => s.classLevel === selectedClass);
  }, [submissions, selectedClass]);

  const chartData = useMemo(() => {
    const ranges = [
      { name: '0-50', count: 0, color: 'hsl(var(--destructive))' },
      { name: '51-70', count: 0, color: 'hsl(var(--accent))' },
      { name: '71-85', count: 0, color: 'hsl(var(--primary))' },
      { name: '86-100', count: 0, color: '#10b981' },
    ];
    
    filteredSubmissions.forEach(s => {
      if (s.score <= 50) ranges[0].count++;
      else if (s.score <= 70) ranges[1].count++;
      else if (s.score <= 85) ranges[2].count++;
      else ranges[3].count++;
    });
    
    return ranges;
  }, [filteredSubmissions]);

  const averageScore = useMemo(() => {
    if (filteredSubmissions.length === 0) return 0;
    const total = filteredSubmissions.reduce((acc, s) => acc + s.score, 0);
    return Math.round(total / filteredSubmissions.length);
  }, [filteredSubmissions]);

  const NavContent = () => (
    <nav className="flex-1 p-4 space-y-2">
      <Link href="/teacher/dashboard">
        <Button variant="secondary" className="w-full justify-start font-bold">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </Button>
      </Link>
      <Link href="/teacher/questions">
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" /> Kelola Soal
        </Button>
      </Link>
      <Link href="/teacher/classes">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" /> Kelola Kelas
        </Button>
      </Link>
      <Link href="/teacher/results">
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" /> Kelola Nilai
        </Button>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background transition-colors duration-300">
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
        <NavContent />
        <div className="p-4 border-t space-y-4">
          <div className="px-4 py-2 flex justify-between items-center bg-muted/50 rounded-lg">
            <span className="text-xs font-bold text-muted-foreground">Mode Tema</span>
            <ModeToggle />
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <div className="p-6 border-b">
                  <Logo />
                </div>
                <NavContent />
                <div className="p-4 border-t mt-auto">
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start text-red-500">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg md:text-xl font-bold text-primary truncate">Overview Nilai</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-muted/30 p-1 rounded-lg border">
              <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px] h-8 border-none bg-transparent focus:ring-0">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Mobile Filter */}
          <div className="sm:hidden w-full">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="h-4 w-4 animate-spin" /> Memperbarui data...
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-primary text-primary-foreground shadow-md">
              <CardContent className="p-5 md:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-80">Total Peserta</p>
                  <p className="text-3xl md:text-4xl font-bold">{filteredSubmissions.length}</p>
                </div>
                <Users className="h-8 w-8 md:h-10 md:w-10 opacity-30" />
              </CardContent>
            </Card>
            
            <Card className="bg-card shadow-md">
              <CardContent className="p-5 md:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Rata-rata Skor</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary">{averageScore}</p>
                </div>
                <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-accent opacity-50" />
              </CardContent>
            </Card>

            <Card className="bg-card shadow-md hidden sm:block lg:flex">
              <CardContent className="p-5 md:p-6 flex items-center justify-between w-full">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Peserta Terakhir</p>
                  <p className="text-base md:text-lg font-bold truncate max-w-[120px] md:max-w-[150px]">{filteredSubmissions[0]?.studentName || '-'}</p>
                </div>
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card shadow-md">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Distribusi Nilai {selectedClass !== 'all' ? `- ${selectedClass}` : ''}</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] md:h-[300px] w-full">
                <ChartContainer config={{ count: { label: "Jumlah Siswa", color: "hsl(var(--primary))" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base md:text-lg">Nilai Terbaru</CardTitle>
                <Link href="/teacher/results">
                  <Button variant="link" size="sm" className="h-auto p-0">Lihat Semua</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Nama</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="pr-4">Skor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.slice(0, 5).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold pl-4 text-sm truncate max-w-[100px]">{s.studentName}</TableCell>
                        <TableCell className="text-sm"><Badge variant="outline" className="whitespace-nowrap">{s.classLevel}</Badge></TableCell>
                        <TableCell className={`font-bold pr-4 text-sm ${s.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{s.score}</TableCell>
                      </TableRow>
                    ))}
                    {filteredSubmissions.length === 0 && !loading && (
                      <TableRow><TableCell colSpan={3} className="text-center py-4 italic text-muted-foreground text-sm">Belum ada data untuk filter ini</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}