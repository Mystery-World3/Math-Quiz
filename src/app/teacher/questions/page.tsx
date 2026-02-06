
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getQuestions, saveQuestion, deleteQuestion, getClasses } from '@/lib/storage';
import { Question, ClassLevelData, QuestionType } from '@/lib/types';
import { LayoutDashboard, FileText, LogOut, Plus, Trash2, Edit2, CheckCircle2, Settings, Hash, ListTodo, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [classes, setClasses] = useState<ClassLevelData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  // Form state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('multiple-choice');
  const [qClass, setQClass] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qCorrectValue, setQCorrectValue] = useState('');

  useEffect(() => {
    const loadedQuestions = getQuestions();
    const loadedClasses = getClasses();
    setQuestions(loadedQuestions);
    setClasses(loadedClasses);
    if (loadedClasses.length > 0) {
      setQClass(loadedClasses[0].name);
    }
  }, []);

  const resetForm = () => {
    setQText('');
    setQType('multiple-choice');
    setQClass(classes[0]?.name || '');
    setQOptions(['', '', '', '']);
    setQCorrectIndex(0);
    setQCorrectValue('');
    setEditingQuestion(null);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQType(q.type);
    setQClass(q.classLevel);
    if (q.type === 'multiple-choice') {
      setQOptions([...(q.options || ['', '', '', ''])]);
      setQCorrectIndex(parseInt(q.correctAnswer));
    } else {
      setQCorrectValue(q.correctAnswer);
    }
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
    if (!qText || !qClass) {
      toast({ title: "Error", description: "Harap isi pertanyaan dan kelas.", variant: "destructive" });
      return;
    }

    if (qType === 'multiple-choice' && (qOptions.some(o => !o))) {
      toast({ title: "Error", description: "Harap isi semua opsi jawaban.", variant: "destructive" });
      return;
    }

    if ((qType === 'numeric' || qType === 'short-answer') && !qCorrectValue) {
      toast({ title: "Error", description: "Harap isi jawaban yang benar.", variant: "destructive" });
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion?.id || Math.random().toString(36).substr(2, 9),
      text: qText,
      type: qType,
      classLevel: qClass,
      options: qType === 'multiple-choice' ? qOptions : undefined,
      correctAnswer: qType === 'multiple-choice' ? qCorrectIndex.toString() : qCorrectValue
    };

    saveQuestion(newQuestion);
    setQuestions(getQuestions());
    setIsModalOpen(false);
    resetForm();
    toast({ title: "Berhasil", description: "Soal telah disimpan." });
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
            <Button variant="secondary" className="w-full justify-start font-bold">
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
                    <Select value={qClass} onValueChange={(val) => setQClass(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipe Soal</Label>
                    <Tabs value={qType} onValueChange={(val) => setQType(val as QuestionType)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="multiple-choice" className="gap-1 text-xs px-1">
                          <ListTodo className="h-3 w-3" /> Pilihan
                        </TabsTrigger>
                        <TabsTrigger value="numeric" className="gap-1 text-xs px-1">
                          <Hash className="h-3 w-3" /> Angka
                        </TabsTrigger>
                        <TabsTrigger value="short-answer" className="gap-1 text-xs px-1">
                          <Type className="h-3 w-3" /> Isian
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pertanyaan</Label>
                  <Input 
                    value={qText} 
                    onChange={(e) => setQText(e.target.value)} 
                    placeholder="Tuliskan pertanyaan di sini... Gunakan simbol jika perlu (√, π, ±)" 
                  />
                </div>
                
                {qType === 'multiple-choice' ? (
                  <div className="space-y-3">
                    <Label>Opsi Jawaban (Tandai jawaban yang benar)</Label>
                    {qOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={qCorrectIndex === idx ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setQCorrectIndex(idx)}
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
                ) : (
                  <div className="space-y-2">
                    <Label>Jawaban Benar</Label>
                    <Input 
                      type={qType === 'numeric' ? 'number' : 'text'}
                      value={qCorrectValue}
                      onChange={(e) => setQCorrectValue(e.target.value)}
                      placeholder={qType === 'numeric' ? "Masukkan angka..." : "Masukkan jawaban teks/simbol..."}
                    />
                    <p className="text-xs text-muted-foreground italic">
                      {qType === 'short-answer' ? 'Siswa harus mengetikkan jawaban yang sama persis (case-sensitive).' : 'Hanya menerima input angka.'}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button onClick={handleSave}>Simpan Soal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 gap-8">
            {classes.map((cls) => {
              const classQuestions = questions.filter(q => q.classLevel === cls.name);
              return (
                <div key={cls.id} className="space-y-4">
                  <h2 className="text-lg font-bold text-muted-foreground border-b pb-2 flex items-center gap-2">
                    {cls.name} <Badge className="bg-primary/10 text-primary border-none">{classQuestions.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {classQuestions.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground p-4 bg-white rounded-lg border border-dashed">
                        Belum ada soal untuk {cls.name}.
                      </p>
                    ) : (
                      classQuestions.map((q) => (
                        <Card key={q.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1">
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                              {q.type === 'numeric' ? 'Angka' : q.type === 'multiple-choice' ? 'Pilihan' : 'Isian'}
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="font-bold">{q.text}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(q)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(q.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {q.type === 'multiple-choice' ? (
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                {q.options?.map((opt, i) => (
                                  <div key={i} className={`text-xs p-2 rounded border ${i.toString() === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-4">
                                <div className="text-xs p-2 rounded border bg-green-50 border-green-200 text-green-700 font-bold inline-block">
                                  Kunci: {q.correctAnswer}
                                </div>
                              </div>
                            )}
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
