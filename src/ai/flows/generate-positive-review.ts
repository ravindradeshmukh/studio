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
  positiveExperience: z.string().describe('Details of the positive experience with the product or service.'),
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
  prompt: `You are a helpful assistant that crafts positive business reviews.

  Based on the following information, write a positive review for the business.

  Business Name: {{{businessName}}}
  Product or Service: {{{productOrService}}}
  Positive Experience: {{{positiveExperience}}}

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
