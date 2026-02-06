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
import { LayoutDashboard, FileText, LogOut, Plus, Trash2, Edit2, CheckCircle2, Settings, Hash, ListTodo, Type, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore } from '@/firebase';
import { SymbolKeyboard } from '@/components/SymbolKeyboard';

export default function ManageQuestions() {
  const db = useFirestore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [classes, setClasses] = useState<ClassLevelData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('multiple-choice');
  const [qClass, setQClass] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qCorrectValue, setQCorrectValue] = useState('');

  const loadData = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const loadedQuestions = await getQuestions(db);
      const loadedClasses = await getClasses(db);
      setQuestions(loadedQuestions);
      setClasses(loadedClasses);
      if (loadedClasses.length > 0 && !qClass) {
        setQClass(loadedClasses[0].name);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [db]);

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

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        await deleteQuestion(db, id);
        await loadData();
        toast({ title: "Berhasil", description: "Soal telah dihapus." });
      } catch (error) {
        toast({ title: "Gagal", description: "Terjadi kesalahan saat menghapus soal.", variant: "destructive" });
      }
    }
  };

  const handleSave = async () => {
    if (!db) return;
    if (!qText || !qClass) {
      toast({ title: "Error", description: "Harap isi pertanyaan dan kelas.", variant: "destructive" });
      return;
    }

    const isMC = qType === 'multiple-choice';
    const newQuestion: Question = {
      id: editingQuestion?.id || '',
      text: qText,
      type: qType,
      classLevel: qClass,
      options: isMC ? qOptions : undefined,
      correctAnswer: isMC ? qCorrectIndex.toString() : qCorrectValue
    };

    try {
      await saveQuestion(db, newQuestion);
      await loadData();
      setIsModalOpen(false);
      resetForm();
      toast({ title: "Berhasil", description: "Soal telah disimpan." });
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan soal.", variant: "destructive" });
    }
  };

  const insertSymbolToText = (symbol: string) => setQText(prev => prev + symbol);
  const insertSymbolToAnswer = (symbol: string) => setQCorrectValue(prev => prev + symbol);
  const insertSymbolToOption = (symbol: string, idx: number) => {
    const n = [...qOptions];
    n[idx] = n[idx] + symbol;
    setQOptions(n);
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
          <h1 className="text-xl font-bold text-primary">Manajemen Soal LKPD</h1>
          <div className="flex gap-2">
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="font-bold gap-2">
                  <Plus className="h-4 w-4" /> Tambah Soal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jenjang Kelas</Label>
                      <Select value={qClass} onValueChange={setQClass}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipe Soal</Label>
                      <Tabs value={qType} onValueChange={(val) => setQType(val as QuestionType)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="multiple-choice" title="Pilihan Ganda"><ListTodo className="h-3 w-3" /></TabsTrigger>
                          <TabsTrigger value="numeric" title="Isian Angka"><Hash className="h-3 w-3" /></TabsTrigger>
                          <TabsTrigger value="short-answer" title="Isian Singkat"><Type className="h-3 w-3" /></TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Isi Pertanyaan</Label>
                    <SymbolKeyboard onInsert={insertSymbolToText} label="Simbol untuk Pertanyaan" />
                    <Input 
                      value={qText} 
                      onChange={e => setQText(e.target.value)} 
                      placeholder="Contoh: Jika x₁ = 4 dan x₂ = 6, maka..." 
                      className="text-lg font-medium p-6"
                    />
                  </div>

                  {qType === 'multiple-choice' ? (
                    <div className="space-y-6 bg-muted/20 p-4 rounded-xl border">
                      <Label className="font-bold">Opsi Jawaban (Klik lingkaran untuk jawaban benar)</Label>
                      <div className="space-y-4">
                        {qOptions.map((opt, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant={qCorrectIndex === idx ? 'default' : 'outline'} 
                                size="icon" 
                                className="shrink-0"
                                onClick={() => setQCorrectIndex(idx)}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </Button>
                              <Input 
                                value={opt} 
                                onChange={e => { const n = [...qOptions]; n[idx] = e.target.value; setQOptions(n); }} 
                                placeholder={`Opsi ${idx + 1}`} 
                                className="font-medium"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 pl-12">
                               {['x₁', 'x₂', '²', '³', '√', 'π'].map(s => (
                                 <Button key={s} variant="ghost" size="sm" className="h-7 text-xs" onClick={() => insertSymbolToOption(s, idx)}>{s}</Button>
                               ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <Label className="text-lg font-bold text-primary">Kunci Jawaban Benar</Label>
                      <SymbolKeyboard onInsert={insertSymbolToAnswer} label="Simbol untuk Jawaban" />
                      <Input 
                        value={qCorrectValue} 
                        onChange={e => setQCorrectValue(e.target.value)} 
                        placeholder="Masukkan nilai atau simbol yang tepat..." 
                        className="text-xl font-bold text-center h-14 border-2 border-primary/30"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleSave} className="px-8 font-bold">Simpan Soal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {classes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                  <p className="text-muted-foreground italic">Belum ada kelas. Silakan buat kelas terlebih dahulu di menu Kelola Kelas.</p>
                </div>
              ) : (
                classes.map((cls) => {
                  const classQuestions = questions.filter(q => q.classLevel === cls.name);
                  return (
                    <div key={cls.id} className="space-y-4">
                      <h2 className="text-lg font-bold text-muted-foreground border-b pb-2 flex items-center gap-2">
                        {cls.name} <Badge className="bg-primary/10 text-primary border-none">{classQuestions.length}</Badge>
                      </h2>
                      {classQuestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic px-2">Belum ada soal untuk kelas ini.</p>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {classQuestions.map((q) => (
                            <Card key={q.id} className="hover:shadow-md transition-shadow relative overflow-hidden group">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1"><p className="font-bold leading-relaxed">{q.text}</p></div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(q)}><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight">
                                    {q.type === 'numeric' ? 'Angka' : q.type === 'multiple-choice' ? 'Pilihan' : 'Isian'}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] border-green-200 bg-green-50 text-green-700">
                                    Ans: {q.type === 'multiple-choice' ? (q.options ? q.options[parseInt(q.correctAnswer)] : '-') : q.correctAnswer}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
