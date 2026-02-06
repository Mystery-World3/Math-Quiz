
"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Submission } from '@/lib/types';
import { Users, FileText, LayoutDashboard, LogOut, ChevronRight, Settings, Loader2, BarChart3 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { collection, query, orderBy } from 'firebase/firestore';

export default function TeacherDashboard() {
  const db = useFirestore();
  
  const submissionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: submissions, loading } = useCollection<Submission>(submissionsQuery);

  const safeSubmissions = submissions || [];

  const chartData = useMemo(() => {
    const ranges = [
      { name: '0-50', count: 0, color: 'hsl(var(--destructive))' },
      { name: '51-70', count: 0, color: 'hsl(var(--accent))' },
      { name: '71-85', count: 0, color: 'hsl(var(--primary))' },
      { name: '86-100', count: 0, color: '#10b981' },
    ];
    
    safeSubmissions.forEach(s => {
      if (s.score <= 50) ranges[0].count++;
      else if (s.score <= 70) ranges[1].count++;
      else if (s.score <= 85) ranges[2].count++;
      else ranges[3].count++;
    });
    
    return ranges;
  }, [safeSubmissions]);

  const averageScore = useMemo(() => {
    if (safeSubmissions.length === 0) return 0;
    const total = safeSubmissions.reduce((acc, s) => acc + s.score, 0);
    return Math.round(total / safeSubmissions.length);
  }, [safeSubmissions]);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
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
        <div className="p-4 border-t">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-primary">Overview Nilai Siswa (Real-time)</h1>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          {loading && (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="h-4 w-4 animate-spin" /> Memperbarui data...
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Peserta</p>
                  <p className="text-4xl font-bold">{safeSubmissions.length}</p>
                </div>
                <Users className="h-10 w-10 opacity-30" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata Skor</p>
                  <p className="text-4xl font-bold text-primary">{averageScore}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-accent opacity-50" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Peserta Terakhir</p>
                  <p className="text-lg font-bold truncate max-w-[150px]">{safeSubmissions[0]?.studentName || '-'}</p>
                </div>
                <ChevronRight className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Distribusi Nilai</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={{ count: { label: "Jumlah Siswa", color: "hsl(var(--primary))" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Daftar Nilai Terbaru</CardTitle>
                <Link href="/teacher/results">
                  <Button variant="link" size="sm">Kelola Semua</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Skor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeSubmissions.slice(0, 5).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold">{s.studentName}</TableCell>
                        <TableCell><Badge variant="outline">{s.classLevel}</Badge></TableCell>
                        <TableCell className={`font-bold ${s.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{s.score}</TableCell>
                      </TableRow>
                    ))}
                    {safeSubmissions.length === 0 && !loading && (
                      <TableRow><TableCell colSpan={3} className="text-center py-4 italic text-muted-foreground">Belum ada data</TableCell></TableRow>
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
