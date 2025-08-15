'use server';

import {
  generatePositiveReview,
  type GeneratePositiveReviewInput,
} from '@/ai/flows/generate-positive-review';
import { z } from 'zod';

const ReviewSchema = z.object({
  googleMapsLink: z.string().url('Please enter a valid Google Maps link.'),
  businessName: z.string().min(1, 'Business name is required.'),
  productOrService: z.string().min(1, 'Product or service is required.'),
  positiveExperience: z
    .string()
    .min(20, 'Please describe your experience in at least 20 characters.'),
});

export type ReviewGenerationResult = {
  reviewText?: string;
  error?: string;
};

export async function handleGenerateReview(
  formData: FormData
): Promise<ReviewGenerationResult> {
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

  const { businessName, productOrService, positiveExperience } =
    validatedFields.data;

  try {
    const aiInput: GeneratePositiveReviewInput = {
      businessName,
      productOrService,
      positiveExperience,
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
