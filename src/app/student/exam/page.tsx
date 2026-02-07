
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Hash, Type, ListTodo, Loader2 } from 'lucide-react';
import { getQuestions, saveSubmission } from '@/lib/storage';
import { Question } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { SymbolKeyboard } from '@/components/SymbolKeyboard';
import { evaluateExamAI } from '@/ai/flows/evaluate-exam-flow';
import { useToast } from '@/hooks/use-toast';

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { toast } = useToast();
  const studentName = searchParams.get('name') || 'Student';
  const classLevel = searchParams.get('class') || 'Kelas 7';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      try {
        const filtered = await getQuestions(db, classLevel);
        setQuestions(filtered);
        setAnswers(new Array(filtered.length).fill(''));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classLevel, db]);

  const handleAnswerChange = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = val;
    setAnswers(newAnswers);
  };

  const insertSymbol = (symbol: string) => {
    const currentAnswer = answers[currentIdx] || '';
    handleAnswerChange(currentAnswer + symbol);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!db) return;
    setIsSubmitting(true);
    
    try {
      // Panggil AI Evaluator untuk koreksi cerdas
      const evaluation = await evaluateExamAI({
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        answers
      });

      const submissionData = {
        studentName,
        classLevel,
        score: evaluation.totalScore,
        totalQuestions: questions.length,
        answers,
        gradingResults: evaluation.gradingResults,
        timestamp: new Date().toISOString()
      };

      await saveSubmission(db, submissionData);

      localStorage.setItem('last_submission', JSON.stringify({
        submission: submissionData,
        questions
      }));
      router.push('/student/finish');
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Gagal Mengumpulkan",
        description: "Terjadi kesalahan saat mengoreksi jawaban. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Menyiapkan Lembar Kerja...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <Logo />
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <p className="text-xl font-medium text-muted-foreground">Belum ada soal untuk {classLevel}.</p>
          <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressValue = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Logo />
          <div className="flex flex-col items-end">
            <span className="font-bold text-primary">{studentName}</span>
            <span className="text-xs text-muted-foreground">{classLevel}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Progress Pengerjaan</span>
            <span>{currentIdx + 1} dari {questions.length}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <Card className="shadow-lg border-l-4 border-l-primary animate-in fade-in slide-in-from-right-4 duration-300">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-xl leading-relaxed flex-1">
                {currentQuestion.text}
              </CardTitle>
              <Badge variant="outline" className="gap-1 text-xs py-1 shrink-0">
                {currentQuestion.type === 'multiple-choice' ? <ListTodo className="h-3 w-3" /> : currentQuestion.type === 'numeric' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                {currentQuestion.type === 'multiple-choice' ? 'Pilihan' : currentQuestion.type === 'numeric' ? 'Angka' : 'Isian'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === 'multiple-choice' ? (
              <RadioGroup 
                value={answers[currentIdx]} 
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="peer sr-only" />
                    <Label
                      htmlFor={`opt-${idx}`}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        answers[currentIdx] === idx.toString() 
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                          : 'border-border bg-white hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentIdx] === idx.toString() ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {answers[currentIdx] === idx.toString() && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-6 pt-4">
                <SymbolKeyboard onInsert={insertSymbol} />

                <div className="space-y-2">
                  <Label htmlFor="text-answer" className="text-lg font-bold">Jawaban Kamu:</Label>
                  <Input 
                    id="text-answer"
                    placeholder={currentQuestion.type === 'numeric' ? "Ketik angka..." : "Ketik jawaban (bisa menyertakan langkah pengerjaan)..."}
                    className="h-16 text-2xl text-center font-bold border-2 focus-visible:ring-primary shadow-inner"
                    value={answers[currentIdx]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 mt-4">
            <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
            
            {currentIdx === questions.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 h-12"
                disabled={answers[currentIdx] === '' || isSubmitting}
              >
                {isSubmitting ? (
                  <>Mengkoreksi dengan AI... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>Selesai & Kumpulkan <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={answers[currentIdx] === ''} className="h-12">
                Berikutnya <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExamContent />
    </Suspense>
  );
}
