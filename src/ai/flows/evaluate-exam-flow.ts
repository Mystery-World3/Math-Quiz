
'use server';
/**
 * @fileOverview AI Flow to evaluate student's exam answers with semantic understanding.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  text: z.string(),
  type: z.enum(['multiple-choice', 'numeric', 'short-answer']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
});

const EvaluateExamInputSchema = z.object({
  questions: z.array(QuestionSchema),
  answers: z.array(z.string()),
});

const EvaluateExamOutputSchema = z.object({
  gradingResults: z.array(z.boolean()),
  totalScore: z.number(),
});

export type EvaluateExamInput = z.infer<typeof EvaluateExamInputSchema>;
export type EvaluateExamOutput = z.infer<typeof EvaluateExamOutputSchema>;

export async function evaluateExamAI(input: EvaluateExamInput): Promise<EvaluateExamOutput> {
  try {
    return await evaluateExamFlow(input);
  } catch (error) {
    console.error("AI Evaluation failed, using fallback logic", error);
    // Fallback logic if AI fails
    const results = input.questions.map((q, i) => {
      const studentAns = (input.answers[i] || "").toLowerCase().trim();
      const teacherKey = q.correctAnswer.toLowerCase().trim();
      
      if (q.type === 'multiple-choice') return studentAns === teacherKey;
      
      // Basic normalization for fallback
      const clean = (s: string) => s.replace(/[^0-9a-z]/g, '');
      return clean(studentAns).includes(clean(teacherKey)) || clean(teacherKey).includes(clean(studentAns));
    });
    
    const correctCount = results.filter(r => r === true).length;
    return {
      gradingResults: results,
      totalScore: Math.round((correctCount / input.questions.length) * 100)
    };
  }
}

const prompt = ai.definePrompt({
  name: 'evaluateExamPrompt',
  input: { schema: EvaluateExamInputSchema },
  output: { schema: EvaluateExamOutputSchema },
  prompt: `You are an expert Indonesian teacher. Evaluate a student's exam answers against the teacher's key.
  
  QUESTIONS AND ANSWERS:
  {{#each questions}}
  ---
  Question {{add @index 1}}: {{{text}}}
  Type: {{type}}
  {{#if options}}Options: {{#each options}}[{{@index}}] {{this}} {{/each}}{{/if}}
  Teacher's Correct Key: {{{correctAnswer}}}
  Student's Answer: {{{lookup ../answers @index}}}
  {{/each}}

  EVALUATION RULES:
  1. Multiple-choice: Student answer must match the Teacher's Key (which is the index string).
  2. Numeric/Short-answer: BE SMART AND SEMANTIC.
     - Accept answers with units (e.g., "5 m" or "5 meter" is correct if key is "5").
     - Accept answers with prefixes (e.g., "x = 4" is correct if key is "4").
     - Accept answers that show calculation steps as long as the final answer matches.
     - Ignore capitalization and extra spaces.
     - If the student's answer is logically equivalent, mark as true.
  
  OUTPUT: Provide an array of booleans (gradingResults) and a totalScore (0-100).`,
});

const evaluateExamFlow = ai.defineFlow(
  {
    name: 'evaluateExamFlow',
    inputSchema: EvaluateExamInputSchema,
    outputSchema: EvaluateExamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI returned no output');
    return output;
  }
);
