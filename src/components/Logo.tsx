
"use client";

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-default select-none">
      <Link href="/teacher/login" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <div className="bg-primary p-2 rounded-lg shadow-md group-hover:bg-accent transition-colors">
          <BookOpen className="text-primary-foreground h-6 w-6" />
        </div>
        <span className="font-headline font-bold text-xl text-primary tracking-tight">
          Learn<span className="text-accent">Scape</span>
        </span>
      </Link>
    </div>
  );
}
