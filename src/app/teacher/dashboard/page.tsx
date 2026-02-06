"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSubmissions } from '@/lib/storage';
import { Submission } from '@/lib/types';
import { Users, FileText, LayoutDashboard, LogOut, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useFirestore } from '@/firebase';

export default function TeacherDashboard() {
  const db = useFirestore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      setLoading(true);
      try {
        const data = await getSubmissions(db);
        setSubmissions(data);
      } catch (error) {
        console.error("Error loading submissions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [db]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
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
        </nav>
        <div className="p-4 border-t">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-primary">Overview Nilai Siswa</h1>
          <div className="flex items-center gap-4">
            <Link href="/teacher/questions">
              <Button size="sm" className="font-bold">
                Tambah Soal Baru
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">Total Peserta</p>
                    <p className="text-4xl font-bold">{submissions.length}</p>
                  </div>
                  <Users className="h-10 w-10 opacity-30" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata Skor</p>
                    <p className="text-4xl font-bold text-primary">
                      {submissions.length > 0 
                        ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)
                        : 0}
                    </p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground font-bold">TOP</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Submit Terakhir</p>
                    <p className="text-lg font-bold truncate max-w-[150px]">
                      {submissions[0]?.studentName || '-'}
                    </p>
                  </div>
                  <ChevronRight className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Nilai Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Benar/Total</TableHead>
                      <TableHead>Waktu Pengerjaan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                          Belum ada data pengerjaan siswa.
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-bold">{s.studentName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{s.classLevel}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold text-lg ${s.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {s.score}
                            </span>
                          </TableCell>
                          <TableCell>
                            {Math.round((s.score / 100) * s.totalQuestions)} / {s.totalQuestions}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {s.timestamp ? format(new Date(s.timestamp), 'dd MMM yyyy, HH:mm') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
