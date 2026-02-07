
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getClasses, saveClass, deleteClass } from '@/lib/storage';
import { ClassLevelData } from '@/lib/types';
import { LayoutDashboard, FileText, LogOut, Plus, Trash2, Edit2, Settings, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';

export default function ManageClasses() {
  const db = useFirestore();
  const [classes, setClasses] = useState<ClassLevelData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassLevelData | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadClasses = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const data = await getClasses(db);
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [db]);

  const handleEdit = (c: ClassLevelData) => {
    setEditingClass(c);
    setClassNameInput(c.name);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (cls: ClassLevelData) => {
    if (!db) return;
    const updated = { ...cls, isActive: !cls.isActive };
    try {
      await saveClass(db, updated);
      await loadClasses();
      toast({ 
        title: updated.isActive ? "Kelas Diaktifkan" : "Kelas Dinonaktifkan", 
        description: `Status ${cls.name} berhasil diubah.` 
      });
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan sistem.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('Menghapus kelas akan berdampak pada soal dan nilai yang menggunakan kelas ini. Lanjutkan?')) {
      try {
        await deleteClass(db, id);
        await loadClasses();
        toast({ title: "Berhasil", description: "Kelas telah dihapus." });
      } catch (error) {
        toast({ title: "Gagal", description: "Terjadi kesalahan saat menghapus kelas.", variant: "destructive" });
      }
    }
  };

  const handleSave = async () => {
    if (!db) return;
    if (!classNameInput.trim()) {
      toast({ title: "Error", description: "Nama kelas tidak boleh kosong.", variant: "destructive" });
      return;
    }

    const newClass: ClassLevelData = {
      id: editingClass?.id || '',
      name: classNameInput.trim(),
      isActive: editingClass ? editingClass.isActive : true
    };

    try {
      await saveClass(db, newClass, editingClass?.name);
      await loadClasses();
      setIsModalOpen(false);
      setEditingClass(null);
      setClassNameInput('');
      toast({ title: "Berhasil", description: "Kelas telah disimpan dan disinkronkan." });
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan kelas.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
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
            <Button variant="secondary" className="w-full justify-start font-bold">
              <Settings className="mr-2 h-4 w-4" /> Kelola Kelas
            </Button>
          </Link>
          <Link href="/teacher/results">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" /> Kelola Nilai
            </Button>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-primary">Manajemen Jenjang Kelas</h1>
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingClass(null);
              setClassNameInput('');
            }
          }}>
            <DialogTrigger asChild>
              <Button className="font-bold gap-2">
                <Plus className="h-4 w-4" /> Tambah Kelas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Edit Nama Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Kelas</Label>
                  <Input 
                    value={classNameInput} 
                    onChange={(e) => setClassNameInput(e.target.value)} 
                    placeholder="Contoh: Kelas 7, Kelas 8..." 
                  />
                  {editingClass && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      *Mengubah nama akan otomatis memperbarui nama kelas pada semua soal terkait.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button onClick={handleSave}>Simpan Kelas</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daftar Jenjang Kelas Aktif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">Belum ada jenjang kelas yang ditambahkan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                      <div key={cls.id} className={`flex items-center justify-between p-4 bg-card rounded-xl border transition-all ${!cls.isActive ? 'opacity-60 bg-muted/50' : 'hover:shadow-sm'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${cls.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {cls.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg">{cls.name}</span>
                            <span className={`text-[10px] font-medium ${cls.isActive ? 'text-green-500' : 'text-red-400'}`}>
                              {cls.isActive ? 'Muncul di Siswa' : 'Disembunyikan'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 mr-2">
                            <Switch 
                              checked={cls.isActive} 
                              onCheckedChange={() => handleToggleActive(cls)}
                            />
                          </div>
                          <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => handleEdit(cls)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(cls.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
