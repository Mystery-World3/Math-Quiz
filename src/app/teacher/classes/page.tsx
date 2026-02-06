
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getClasses, saveClass, deleteClass } from '@/lib/storage';
import { ClassLevelData } from '@/lib/types';
import { LayoutDashboard, FileText, LogOut, Plus, Trash2, Edit2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

export default function ManageClasses() {
  const [classes, setClasses] = useState<ClassLevelData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassLevelData | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  const handleEdit = (c: ClassLevelData) => {
    setEditingClass(c);
    setClassNameInput(c.name);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Menghapus kelas akan berdampak pada soal dan nilai yang menggunakan kelas ini. Lanjutkan?')) {
      deleteClass(id);
      setClasses(getClasses());
      toast({ title: "Berhasil", description: "Kelas telah dihapus." });
    }
  };

  const handleSave = () => {
    if (!classNameInput.trim()) {
      toast({ title: "Error", description: "Nama kelas tidak boleh kosong.", variant: "destructive" });
      return;
    }

    const newClass: ClassLevelData = {
      id: editingClass?.id || Math.random().toString(36).substr(2, 9),
      name: classNameInput.trim()
    };

    saveClass(newClass);
    setClasses(getClasses());
    setIsModalOpen(false);
    setEditingClass(null);
    setClassNameInput('');
    toast({ title: "Berhasil", description: "Kelas telah disimpan." });
  };

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
            <Button variant="secondary" className="w-full justify-start font-bold">
              <Settings className="mr-2 h-4 w-4" /> Kelola Kelas
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
                    placeholder="Contoh: Kelas 7, Kelas 8, Alumni..." 
                  />
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
                {classes.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">Belum ada jenjang kelas yang ditambahkan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                            {cls.name.charAt(0)}
                          </div>
                          <span className="font-bold text-lg">{cls.name}</span>
                        </div>
                        <div className="flex gap-2">
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
