'use server';
/**
 * @fileOverview AI Flow to generate LKPD questions based on a topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  topic: z.string().describe('The subject or topic for the questions (e.g., "Algebra", "Biology Cells")'),
  classLevel: z.string().describe('The grade or class level'),
  count: z.number().min(1).max(10).describe('Number of questions to generate'),
});

const QuestionOutputSchema = z.object({
  text: z.string(),
  type: z.enum(['multiple-choice', 'numeric', 'short-answer']),
  options: z.array(z.string()).optional().describe('Required if type is multiple-choice. Exactly 4 options.'),
  correctAnswer: z.string().describe('Index (0-3) for MC, or string value for others'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionOutputSchema),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateAIQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `You are an expert educator. Generate {{count}} educational questions about "{{topic}}" for {{classLevel}} students.
  
  Requirements:
  1. Mix question types: some multiple-choice, some numeric, and some short-answer.
  2. For multiple-choice, provide exactly 4 options.
  3. For numeric, the answer must be a number.
  4. For short-answer, use common mathematical symbols if applicable.
  5. Ensure questions are challenging but appropriate for the grade level.
  6. Languages: Respond in Indonesian (Bahasa Indonesia).`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate questions');
    return output;
  }
);
