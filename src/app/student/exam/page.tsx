
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
import { ChevronRight, ChevronLeft, Send, Hash, Type, ListTodo, Loader2 } from 'lucide-react';
import { getQuestions, saveSubmission } from '@/lib/storage';
import { Question } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { SymbolKeyboard } from '@/components/SymbolKeyboard';
import { evaluateExamAI } from '@/ai/flows/evaluate-exam-flow';
import { useToast } from '@/hooks/use-toast';
import { ModeToggle } from '@/components/ModeToggle';

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground text-center">Menyiapkan Lembar Kerja...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 gap-6">
        <Logo />
        <Card className="max-w-md w-full p-6 md:p-8 text-center space-y-4">
          <p className="text-lg md:text-xl font-medium text-muted-foreground">Belum ada soal untuk {classLevel}.</p>
          <Button onClick={() => router.push('/')} className="w-full">Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressValue = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-3 md:p-4 bg-card shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-end">
              <span className="font-bold text-primary text-sm md:text-base truncate max-w-[80px] md:max-w-none">{studentName}</span>
              <span className="text-[10px] md:text-xs text-muted-foreground">{classLevel}</span>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] md:text-sm font-medium">
            <span>Progress Pengerjaan</span>
            <span>{currentIdx + 1} dari {questions.length}</span>
          </div>
          <Progress value={progressValue} className="h-1.5 md:h-2" />
        </div>

        <Card className="shadow-lg border-l-4 border-l-primary animate-in fade-in slide-in-from-right-4 duration-300">
          <CardHeader className="p-4 md:p-6">
            <div className="flex justify-between items-start gap-3 md:gap-4">
              <CardTitle className="text-lg md:text-xl leading-relaxed flex-1">
                {currentQuestion.text}
              </CardTitle>
              <Badge variant="outline" className="gap-1 text-[10px] md:text-xs py-1 shrink-0 whitespace-nowrap">
                {currentQuestion.type === 'multiple-choice' ? <ListTodo className="h-3 w-3" /> : currentQuestion.type === 'numeric' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                {currentQuestion.type === 'multiple-choice' ? 'Pilihan' : currentQuestion.type === 'numeric' ? 'Angka' : 'Isian'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {currentQuestion.type === 'multiple-choice' ? (
              <RadioGroup 
                value={answers[currentIdx]} 
                onValueChange={handleAnswerChange}
                className="space-y-2 md:space-y-3"
              >
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="peer sr-only" />
                    <Label
                      htmlFor={`opt-${idx}`}
                      className={`flex-1 p-3 md:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 text-sm md:text-base ${
                        answers[currentIdx] === idx.toString() 
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        answers[currentIdx] === idx.toString() ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {answers[currentIdx] === idx.toString() && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />}
                      </div>
                      <span className="flex-1">{option}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-4 md:space-y-6 pt-2">
                <SymbolKeyboard onInsert={insertSymbol} />

                <div className="space-y-2">
                  <Label htmlFor="text-answer" className="text-base md:text-lg font-bold">Jawaban Kamu:</Label>
                  <Input 
                    id="text-answer"
                    placeholder={currentQuestion.type === 'numeric' ? "Ketik angka..." : "Ketik jawaban..."}
                    className="h-14 md:h-16 text-xl md:text-2xl text-center font-bold border-2 focus-visible:ring-primary shadow-inner bg-card"
                    value={answers[currentIdx]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between border-t p-4 md:p-6 mt-2">
            <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0} className="w-full sm:w-auto h-10 md:h-11">
              <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
            
            {currentIdx === questions.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-10 md:h-12 px-8"
                disabled={answers[currentIdx] === '' || isSubmitting}
              >
                {isSubmitting ? (
                  <>Mengkoreksi... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>Selesai & Kumpulkan <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={answers[currentIdx] === ''} className="w-full sm:w-auto h-10 md:h-12">
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
