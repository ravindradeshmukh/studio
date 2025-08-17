'use server';

import {
  generatePositiveReview,
  type GeneratePositiveReviewInput,
} from '@/ai/flows/generate-positive-review';
import { z } from 'zod';

const ReviewSchema = z.object({
  businessName: z.string().min(1, 'Business name is required.'),
  productOrService: z.string().min(1, 'Product or service is required.'),
});

export type ReviewGenerationResult = {
  reviewText?: string;
  error?: string;
};

export async function handleGenerateReview(
  formData: FormData
): Promise<ReviewGenerationResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      error:
        'The GEMINI_API_KEY is not set. Please add it to your .env file.',
    };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = ReviewSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors
      .map((e) => e.message)
      .join(' ');
    return {
      error: `Invalid form data: ${errorMessage}`,
    };
  }

  const { businessName, productOrService } =
    validatedFields.data;

  try {
    const aiInput: GeneratePositiveReviewInput = {
      businessName,
      productOrService,
    };

    const result = await generatePositiveReview(aiInput);

    if (result.reviewText) {
      return { reviewText: result.reviewText };
    } else {
      return {
        error: 'Failed to generate review. The AI did not return any text.',
      };
    }
  } catch (e) {
    console.error(e);
    return {
      error: 'An unexpected error occurred while contacting the AI service.',
    };
  }
}
