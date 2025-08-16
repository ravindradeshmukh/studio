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
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Copy, ExternalLink, Sparkles, LoaderCircle, Edit } from 'lucide-react';

const businessInfoSchema = z.object({
  googleMapsLink: z
    .string()
    .url({ message: 'Please enter a valid Google Maps URL.' }),
  businessName: z
    .string()
    .min(2, { message: 'Business name must be at least 2 characters.' }),
  productOrService: z
    .string()
    .min(2, { message: 'Product/service must be at least 2 characters.' }),
});

type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

const LOCAL_STORAGE_KEY = 'reviewBuddyBusinessInfo';

const defaultBusinessInfo: BusinessInfoFormValues = {
  googleMapsLink: 'https://g.page/r/CXDBDtKbaLGgEBE/review',
  businessName: 'Muktai Traders',
  productOrService:
    'Asian paints, painting services, Rajyog Paints, painting consultation and color visualization',
};

export function ReviewGenerator() {
  const { toast } = useToast();
  const [generatedReview, setGeneratedReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessInfo, setBusinessInfo] =
    useState<BusinessInfoFormValues | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInfo) {
        setBusinessInfo(JSON.parse(savedInfo));
      } else {
        setBusinessInfo(defaultBusinessInfo);
      }
    } catch (error) {
      console.error('Failed to parse business info from localStorage', error);
      setBusinessInfo(defaultBusinessInfo);
    }
  }, []);

  const businessForm = useForm<BusinessInfoFormValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: defaultBusinessInfo,
  });

  const handleSaveBusinessInfo: SubmitHandler<BusinessInfoFormValues> = (
    data
  ) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    setBusinessInfo(data);
    toast({
      title: 'Business Info Saved!',
      description: 'You can now start generating reviews.',
    });
  };

  const handleEditBusinessInfo = () => {
    if (businessInfo) {
      businessForm.reset(businessInfo);
    }
    setBusinessInfo(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setGeneratedReview('');
  };

  const onGenerateSubmit = async () => {
    if (!businessInfo) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Business information is missing.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedReview('');

    const formData = new FormData();
    formData.append('googleMapsLink', businessInfo.googleMapsLink);
    formData.append('businessName', businessInfo.businessName);
    formData.append('productOrService', businessInfo.productOrService);

    const result = await handleGenerateReview(formData);
    setIsGenerating(false);

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

  if (!businessInfo) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <Form {...businessForm}>
          <form onSubmit={businessForm.handleSubmit(handleSaveBusinessInfo)}>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">
                Business Details
              </CardTitle>
              <CardDescription>
                First, let's save the business information. We'll remember it
                for next time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={businessForm.control}
                name="googleMapsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Review Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://maps.app.goo.gl/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={businessForm.control}
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
                control={businessForm.control}
                name="productOrService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Product or Service</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Coffee, Web Design"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Save Business Info
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onGenerateSubmit();
          }}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-3xl">
                  {businessInfo.businessName}
                </CardTitle>
                <CardDescription>
                  Reviewing: {businessInfo.productOrService}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditBusinessInfo}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ready to generate a new positive review for this business?
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
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
                <a
                  href={businessInfo.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
