'use client';

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

import { handleGenerateReview } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Copy, ExternalLink, Sparkles, LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  googleMapsLink: z
    .string()
    .url({ message: 'Please enter a valid Google Maps URL.' }),
  businessName: z
    .string()
    .min(2, { message: 'Business name must be at least 2 characters.' }),
  productOrService: z
    .string()
    .min(2, { message: 'Product/service must be at least 2 characters.' }),
  positiveExperience: z
    .string()
    .min(20, { message: 'Experience must be at least 20 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function ReviewGenerator() {
  const { toast } = useToast();
  const [generatedReview, setGeneratedReview] = useState('');
  const [googleLink, setGoogleLink] = useState('');
  const resultCardRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      googleMapsLink: '',
      businessName: '',
      productOrService: '',
      positiveExperience: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const formData = new FormData();
    (Object.keys(data) as Array<keyof FormValues>).forEach((key) => {
      formData.append(key, data[key]);
    });

    setGeneratedReview('');
    setGoogleLink(data.googleMapsLink);

    const result = await handleGenerateReview(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.reviewText) {
      setGeneratedReview(result.reviewText);
      toast({
        title: 'Success!',
        description: 'Your glowing review is ready.',
      });
      form.reset();
    }
  };

  useEffect(() => {
    if (generatedReview && resultCardRef.current) {
      resultCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [generatedReview]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedReview);
    toast({
      title: 'Copied!',
      description: 'The review has been copied to your clipboard.',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">
                Generate a Glowing Review
              </CardTitle>
              <CardDescription>
                Fill in the details below and our AI will craft a positive
                review for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="googleMapsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Review Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Corner Cafe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productOrService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product or Service</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Iced Latte, Website Design"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="positiveExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell us what you liked</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., The staff was incredibly friendly and the coffee was the best I've ever had."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Review
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {generatedReview && (
        <div ref={resultCardRef}>
          <Card className="animate-in fade-in-0 duration-500 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">
                Your AI-Generated Review
              </CardTitle>
              <CardDescription>
                Copy your review and then click the button to go to the Google
                Maps page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-md">
                <p className="italic text-foreground/90">{generatedReview}</p>
              </blockquote>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Review
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <a href={googleLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Leave Your Review
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
