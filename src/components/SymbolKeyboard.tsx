"use client";

import { Button } from "@/components/ui/button";
import { Sigma } from "lucide-react";

export const MATH_SYMBOLS = [
  '+', '-', '×', '÷', '=', '≠', '≈', '±', '√', 'π', 'x₁', 'x₂', 'y₁', 'y₂', '²', '³', 'ⁿ', '°', '<', '>', '≤', '≥', '(', ')', '[', ']', '{', '}'
];

interface SymbolKeyboardProps {
  onInsert: (symbol: string) => void;
  className?: string;
  label?: string;
}

export function SymbolKeyboard({ onInsert, className, label = "Panel Simbol" }: SymbolKeyboardProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <Sigma className="h-3 w-3" /> {label}
      </div>
      <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-lg border shadow-inner">
        {MATH_SYMBOLS.map(symbol => (
          <Button
            key={symbol}
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-10 font-bold text-lg hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
            onClick={() => onInsert(symbol)}
          >
            {symbol}
          </Button>
        ))}
      </div>
    </div>
  );
}
