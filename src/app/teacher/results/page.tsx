"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSubmissions, deleteSubmission, updateSubmission } from '@/lib/storage';
import { Submission } from '@/lib/types';
import { LayoutDashboard, FileText, LogOut, Settings, Users, Trash2, Edit2, Loader2, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function TeacherResults() {
  const db = useFirestore();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Submission | null>(null);
  const [editName, setEditName] = useState('');
  const [editScore, setEditScore] = useState(0);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [db]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('Apakah Anda yakin ingin menghapus data pengerjaan ini? Data ini akan hilang dari laporan dan dashboard.')) {
      try {
        await deleteSubmission(db, id);
        await loadData();
        toast({ title: "Berhasil", description: "Data pengerjaan siswa telah dihapus." });
      } catch (error) {
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
    if (!db || !editingResult) return;
    try {
      await updateSubmission(db, editingResult.id, {
        studentName: editName,
        score: editScore
      });
      await loadData();
      setIsEditModalOpen(false);
      toast({ title: "Berhasil", description: "Data pengerjaan siswa telah diperbarui." });
    } catch (error) {
      toast({ title: "Gagal", description: "Gagal memperbarui data.", variant: "destructive" });
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.classLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
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
          <h1 className="text-xl font-bold text-primary">Manajemen Nilai Siswa</h1>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Cetak Laporan
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Database Hasil Ujian</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama atau kelas..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                      <TableHead>Waktu Pengerjaan</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.timestamp ? format(new Date(s.timestamp), 'dd MMM yyyy, HH:mm') : '-'}
                        </TableCell>
                        <TableCell className="font-bold">{s.studentName}</TableCell>
                        <TableCell><Badge variant="outline">{s.classLevel}</Badge></TableCell>
                        <TableCell>
                          <span className={`text-lg font-bold ${s.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                            {s.score}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => handleEdit(s)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(s.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 italic text-muted-foreground">
                          Tidak ada data pengerjaan ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
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
              <Input type="number" min="0" max="100" value={editScore} onChange={(e) => setEditScore(parseInt(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
