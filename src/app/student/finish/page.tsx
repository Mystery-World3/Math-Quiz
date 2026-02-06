
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Trophy, RefreshCcw, Hash, ListTodo, Type } from 'lucide-react';
import { Submission, Question } from '@/lib/types';

export default function StudentFinishPage() {
  const router = useRouter();
  const [data, setData] = useState<{ submission: Submission, questions: Question[] } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('last_submission');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!data) return null;

  const { submission, questions } = data;

  const getDisplayAnswer = (q: Question, answer: string) => {
    if (q.type === 'multiple-choice') {
      const idx = parseInt(answer);
      return q.options?.[idx] || 'Tidak Dijawab';
    }
    return answer || 'Tidak Dijawab';
  };

  const getDisplayCorrectAnswer = (q: Question) => {
    if (q.type === 'multiple-choice') {
      const idx = parseInt(q.correctAnswer);
      return q.options?.[idx] || '';
    }
    return q.correctAnswer;
  };

  const checkIsCorrect = (q: Question, answer: string) => {
    if (!answer) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-6 max-w-5xl mx-auto w-full">
        <Logo />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8">
        <div className="text-center space-y-4 animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg border-2 border-primary mb-2">
            <Trophy className="h-12 w-12 text-accent" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary">Selamat, {submission.studentName}!</h1>
          <p className="text-muted-foreground">Kamu telah menyelesaikan pengerjaan LKPD digital.</p>
          
          <div className="flex justify-center gap-8 py-6">
            <div className="text-center">
              <span className="block text-5xl font-bold text-primary">{submission.score}</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Skor Akhir</span>
            </div>
            <div className="w-px bg-border h-16 self-center" />
            <div className="text-center">
              <span className="block text-5xl font-bold text-primary">
                {submission.answers.filter((a, i) => checkIsCorrect(questions[i], a)).length}
                <span className="text-2xl text-muted-foreground">/{questions.length}</span>
              </span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Jawaban Benar</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              Review Koreksi Jawaban
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {questions.map((q, idx) => {
                  const isCorrect = checkIsCorrect(q, submission.answers[idx]);
                  return (
                    <div key={q.id || idx} className="p-6 space-y-3">
                      <div className="flex justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground">Soal {idx + 1}</span>
                          <Badge variant="outline" className="text-[10px] uppercase h-5">
                            {q.type === 'multiple-choice' ? <><ListTodo className="h-3 w-3 mr-1" /> Pilihan</> : q.type === 'numeric' ? <><Hash className="h-3 w-3 mr-1" /> Angka</> : <><Type className="h-3 w-3 mr-1" /> Isian</>}
                          </Badge>
                        </div>
                        {isCorrect ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Benar
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" /> Salah
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-lg">{q.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className={`p-3 rounded-lg border text-sm ${
                          isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <span className="block text-xs uppercase font-bold text-muted-foreground mb-1">Jawaban Kamu:</span>
                          <span className="font-bold">{getDisplayAnswer(q, submission.answers[idx])}</span>
                        </div>
                        {!isCorrect && (
                          <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-sm">
                            <span className="block text-xs uppercase font-bold text-muted-foreground mb-1">Jawaban Benar:</span>
                            <span className="font-bold text-green-700">{getDisplayCorrectAnswer(q)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 py-8 items-center">
          <p className="text-muted-foreground text-sm font-medium">Klik tombol di bawah jika kamu sudah selesai mereview hasilmu.</p>
          <Button 
            className="w-full max-w-sm h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl"
            onClick={() => {
              localStorage.removeItem('last_submission');
              router.push('/');
            }}
          >
            Selesai & Keluar
          </Button>
          <Button variant="ghost" className="text-muted-foreground" onClick={() => router.push('/')}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Ulangi Materi
          </Button>
        </div>
      </main>
    </div>
  );
}
