
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteSubmission, updateSubmission } from '@/lib/storage';
import { Submission } from '@/lib/types';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Settings, 
  Users, 
  Trash2, 
  Edit2, 
  Loader2, 
  Printer, 
  Search,
  Menu
} from 'lucide-react';
import { format } from 'date-fns';
import { useFirestore, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { collection, query, orderBy } from 'firebase/firestore';
import { ModeToggle } from '@/components/ModeToggle';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function TeacherResults() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const submissionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: submissions, loading } = useCollection<Submission>(submissionsQuery);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Submission | null>(null);
  const [editName, setEditName] = useState('');
  const [editScore, setEditScore] = useState(0);

  const handleDelete = async (id: string, studentName: string) => {
    if (!db || !id) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus data pengerjaan "${studentName}"?`)) {
      try {
        await deleteSubmission(db, id);
        toast({ title: "Berhasil", description: `Data "${studentName}" telah dihapus.` });
      } catch (err) {
        toast({ title: "Gagal", description: "Terjadi kesalahan saat menghapus data.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (s: Submission) => {
    setEditingResult(s);
    setEditName(s.studentName);
    setEditScore(s.score);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!db || !editingResult || !editingResult.id) return;
    try {
      await updateSubmission(db, editingResult.id, {
        studentName: editName,
        score: editScore
      });
      setIsEditModalOpen(false);
      toast({ title: "Berhasil", description: "Perubahan telah disimpan." });
    } catch (err) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan perubahan.", variant: "destructive" });
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter(s => 
      (s.studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.classLevel?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const NavContent = () => (
    <nav className="flex-1 p-4 space-y-2">
      <Link href="/teacher/dashboard">
        <Button variant="ghost" className="w-full justify-start">
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
        <Button variant="secondary" className="w-full justify-start font-bold">
          <Users className="mr-2 h-4 w-4" /> Kelola Nilai
        </Button>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col no-print">
        <div className="p-6">
          <Logo />
        </div>
        <NavContent />
        <div className="p-4 border-t space-y-4">
          <div className="px-4 py-2 flex justify-between items-center bg-muted/50 rounded-lg">
            <span className="text-xs font-bold text-muted-foreground">Tema</span>
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
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-8 no-print">
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
              </SheetContent>
            </Sheet>
            <h1 className="text-lg md:text-xl font-bold text-primary truncate">Manajemen Nilai</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Cetak Laporan
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="hidden print-only mb-8">
            <h1 className="text-2xl font-bold text-center">LAPORAN HASIL UJIAN SISWA</h1>
            <p className="text-center text-muted-foreground">Dicetak pada: {format(new Date(), 'dd MMMM yyyy, HH:mm')}</p>
          </div>

          <Card className="card shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-7 no-print">
              <CardTitle className="text-lg">Database Hasil Ujian</CardTitle>
              <div className="relative w-full max-w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama atau kelas..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-20 no-print">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap px-4">Waktu</TableHead>
                        <TableHead className="px-4">Nama Siswa</TableHead>
                        <TableHead className="px-4">Kelas</TableHead>
                        <TableHead className="px-4">Skor</TableHead>
                        <TableHead className="text-right px-4 no-print">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((s) => (
                        <TableRow key={s.id} className="animate-in fade-in duration-300">
                          <TableCell className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap px-4">
                            {s.timestamp ? format(new Date(s.timestamp), 'dd/MM, HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="font-bold px-4 text-sm md:text-base">{s.studentName}</TableCell>
                          <TableCell className="px-4"><Badge variant="outline" className="whitespace-nowrap">{s.classLevel}</Badge></TableCell>
                          <TableCell className="px-4">
                            <span className={`text-base md:text-lg font-bold ${s.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {s.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-right px-4 no-print">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <Button variant="ghost" size="icon" className="text-blue-500 h-8 w-8" onClick={() => handleEdit(s)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleDelete(s.id || '', s.studentName)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredSubmissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 italic text-muted-foreground text-sm">
                            Tidak ada data pengerjaan ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Hasil Ujian</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Siswa</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Skor Akhir (0-100)</Label>
              <Input type="number" min="0" max="100" value={editScore} onChange={(e) => setEditScore(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
