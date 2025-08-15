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
  prompt: `You are a helpful assistant that crafts excellent, positive business reviews.

  Based on the following information, write a glowing, positive review for the business. Be creative and enthusiastic. Keep the review short and concise.

  Business Name: {{{businessName}}}
  Product or Service: {{{productOrService}}}

  Review:
  `,
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
