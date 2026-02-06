
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getQuestions, saveQuestion, deleteQuestion } from '@/lib/storage';
import { Question, ClassLevel } from '@/lib/types';
import { LayoutDashboard, FileText, LogOut, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  // Form state
  const [qText, setQText] = useState('');
  const [qClass, setQClass] = useState<ClassLevel>('Kelas 7');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  useEffect(() => {
    setQuestions(getQuestions());
  }, []);

  const resetForm = () => {
    setQText('');
    setQClass('Kelas 7');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setEditingQuestion(null);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQClass(q.classLevel);
    setQOptions([...q.options]);
    setQCorrect(q.correctAnswer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      deleteQuestion(id);
      setQuestions(getQuestions());
      toast({ title: "Berhasil", description: "Soal telah dihapus." });
    }
  };

  const handleSave = () => {
    if (!qText || qOptions.some(o => !o)) {
      toast({ title: "Error", description: "Harap isi semua bidang.", variant: "destructive" });
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion?.id || Math.random().toString(36).substr(2, 9),
      text: qText,
      classLevel: qClass,
      options: qOptions,
      correctAnswer: qCorrect
    };

    saveQuestion(newQuestion);
    setQuestions(getQuestions());
    setIsModalOpen(false);
    resetForm();
    toast({ title: "Berhasil", description: "Soal telah disimpan." });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Shared Component Logic could be extracted but keeping it simple */}
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
            <Button variant="secondary" className="w-full justify-start font-bold">
              <FileText className="mr-2 h-4 w-4" /> Kelola Soal
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
          <h1 className="text-xl font-bold text-primary">Manajemen Soal LKPD</h1>
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="font-bold gap-2">
                <Plus className="h-4 w-4" /> Tambah Soal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenjang Kelas</Label>
                    <Select value={qClass} onValueChange={(val: ClassLevel) => setQClass(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kelas 7">Kelas 7</SelectItem>
                        <SelectItem value="Kelas 8">Kelas 8</SelectItem>
                        <SelectItem value="Kelas 9">Kelas 9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pertanyaan</Label>
                  <Input 
                    value={qText} 
                    onChange={(e) => setQText(e.target.value)} 
                    placeholder="Tuliskan pertanyaan di sini..." 
                  />
                </div>
                <div className="space-y-3">
                  <Label>Opsi Jawaban (Tandai jawaban yang benar)</Label>
                  {qOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={qCorrect === idx ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setQCorrect(idx)}
                        className="shrink-0"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Input 
                        value={opt} 
                        onChange={(e) => {
                          const newOpts = [...qOptions];
                          newOpts[idx] = e.target.value;
                          setQOptions(newOpts);
                        }}
                        placeholder={`Opsi ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button onClick={handleSave}>Simpan Soal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 gap-4">
            {['Kelas 7', 'Kelas 8', 'Kelas 9'].map((level) => {
              const classQuestions = questions.filter(q => q.classLevel === level);
              return (
                <div key={level} className="space-y-4">
                  <h2 className="text-lg font-bold text-muted-foreground border-b pb-2 flex items-center gap-2">
                    {level} <Badge className="bg-primary/10 text-primary border-none">{classQuestions.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {classQuestions.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground p-4 bg-white rounded-lg border border-dashed">
                        Belum ada soal untuk {level}.
                      </p>
                    ) : (
                      classQuestions.map((q) => (
                        <Card key={q.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <p className="font-bold flex-1">{q.text}</p>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(q)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(q.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              {q.options.map((opt, i) => (
                                <div key={i} className={`text-xs p-2 rounded border ${i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
