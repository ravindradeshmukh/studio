'use server';

/**
 * @fileOverview AI flow for generating a positive business review.
 *
 * - generatePositiveReview - A function that generates a positive review based on business details.
 * - GeneratePositiveReviewInput - The input type for the generatePositiveReview function.
 * - GeneratePositiveReviewOutput - The return type for the generatePositiveReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePositiveReviewInputSchema = z.object({
  businessName: z.string().describe('The name of the business to review.'),
  productOrService: z.string().describe('The specific product or service experienced.'),
});
export type GeneratePositiveReviewInput = z.infer<typeof GeneratePositiveReviewInputSchema>;

const GeneratePositiveReviewOutputSchema = z.object({
  reviewText: z.string().describe('The generated positive review text.'),
});
export type GeneratePositiveReviewOutput = z.infer<typeof GeneratePositiveReviewOutputSchema>;

export async function generatePositiveReview(input: GeneratePositiveReviewInput): Promise<GeneratePositiveReviewOutput> {
  return generatePositiveReviewFlow(input);
}

const generateReviewPrompt = ai.definePrompt({
  name: 'generateReviewPrompt',
  input: {schema: GeneratePositiveReviewInputSchema},
  output: {schema: GeneratePositiveReviewOutputSchema},
  prompt: `You are an expert review writer, capable of crafting at least 1000 unique, positive business reviews. Your primary goal is to generate a completely original review every single time. Do not repeat phrases or sentence structures from any previous review.

  To ensure uniqueness, adopt a different persona or focus for each review. Consider the following angles:
  - A first-time customer who is blown away.
  - A loyal, long-time customer.
  - Someone who was initially skeptical but is now a huge fan.
  - A customer focused on the exceptional customer service.
  - A customer highlighting the quality of the product.
  - A professional in a related field who is impressed by the expertise.
  - A customer who appreciates the value for money.

  Based on the following information, write a glowing, positive, and completely unique review. Keep it concise (2-4 sentences).

  Business Name: {{{businessName}}}
  Product or Service: {{{productOrService}}}

  Review:
  `,
  config: {
    temperature: 0.95,
  },
});

const generatePositiveReviewFlow = ai.defineFlow(
  {
    name: 'generatePositiveReviewFlow',
    inputSchema: GeneratePositiveReviewInputSchema,
    outputSchema: GeneratePositiveReviewOutputSchema,
  },
  async input => {
    const {output} = await generateReviewPrompt(input);
    return output!;
  }
);
