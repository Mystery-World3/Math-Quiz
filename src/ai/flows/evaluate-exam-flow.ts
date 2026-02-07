
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
  return evaluateExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateExamPrompt',
  input: { schema: EvaluateExamInputSchema },
  output: { schema: EvaluateExamOutputSchema },
  prompt: `You are an expert Indonesian teacher. Evaluate a student's exam.
  
  Questions and Answers:
  {{#each questions}}
  Question {{add @index 1}}: {{{text}}}
  Type: {{type}}
  {{#if options}}Options: {{#each options}}[{{@index}}] {{this}} {{/each}}{{/if}}
  Teacher's Correct Key: {{{correctAnswer}}}
  Student's Answer: {{{lookup ../answers @index}}}
  ---
  {{/each}}

  Evaluation Rules:
  1. For 'multiple-choice': The answer is an index string (e.g., "0", "1"). It must match exactly with the Teacher's Key.
  2. For 'numeric' and 'short-answer': BE FLEXIBLE AND SEMANTIC.
     - Accept answers even if they include units (e.g., "5 kg" is correct if key is "5").
     - Accept answers even if they include variables or prefixes (e.g., "x = 2" is correct if key is "2").
     - Accept answers that include the calculation steps/logic as long as the final result matches the key.
     - For multiple values (e.g., "4 dan 8"), order doesn't matter ("8 dan 4" is also correct).
     - If the student's answer is logically equivalent to the teacher's key, mark it as CORRECT (true).
  
  Output the results as an array of booleans corresponding to each question, and calculate the total score (0-100 based on percentage of correct answers).`,
});

const evaluateExamFlow = ai.defineFlow(
  {
    name: 'evaluateExamFlow',
    inputSchema: EvaluateExamInputSchema,
    outputSchema: EvaluateExamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to evaluate exam');
    return output;
  }
);
