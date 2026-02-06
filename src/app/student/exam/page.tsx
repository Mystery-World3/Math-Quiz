
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getQuestions, saveSubmission } from '@/lib/storage';
import { Question, ClassLevel } from '@/lib/types';
import { CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react';

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentName = searchParams.get('name') || 'Student';
  const classLevel = (searchParams.get('class') as ClassLevel) || 'Kelas 7';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const allQuestions = getQuestions();
    const filtered = allQuestions.filter(q => q.classLevel === classLevel);
    setQuestions(filtered);
    setAnswers(new Array(filtered.length).fill(-1));
  }, [classLevel]);

  const handleAnswerChange = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = parseInt(val);
    setAnswers(newAnswers);
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

  const handleSubmit = () => {
    setIsSubmitting(true);
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const finalScore = Math.round((score / questions.length) * 100);

    const submission = {
      id: Math.random().toString(36).substr(2, 9),
      studentName,
      classLevel,
      score: finalScore,
      totalQuestions: questions.length,
      answers,
      timestamp: new Date().toISOString()
    };

    saveSubmission(submission);

    // Short delay for effect
    setTimeout(() => {
      localStorage.setItem('last_submission', JSON.stringify({
        submission,
        questions
      }));
      router.push('/student/finish');
    }, 1000);
  };

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
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={answers[currentIdx].toString()} 
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="peer sr-only" />
                  <Label
                    htmlFor={`opt-${idx}`}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      answers[currentIdx] === idx 
                        ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                        : 'border-border bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentIdx] === idx ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {answers[currentIdx] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 mt-4">
            <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
            
            {currentIdx === questions.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8"
                disabled={answers.some(a => a === -1) || isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : (
                  <>Selesai & Kumpulkan <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={answers[currentIdx] === -1}>
                Berikutnya <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {answers.some(a => a === -1) && (
          <p className="text-center text-sm text-muted-foreground italic">
            Harap isi semua jawaban sebelum mengumpulkan.
          </p>
        )}
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
