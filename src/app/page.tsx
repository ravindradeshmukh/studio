import { ReviewGenerator } from '@/components/review-generator';
import { Logo } from '@/components/icons/logo';

export default function Home() {
  return (
    <>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4 shadow-lg">
            <Logo className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary">
            Review Buddy
          </h1>
          <p className="mt-2 text-lg text-foreground/80 max-w-prose">
            Never struggle with what to write again. Let AI help you craft the
            perfect positive review in seconds.
          </p>
        </div>
        <ReviewGenerator />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Powered by AI. Built with Next.js and Genkit.</p>
      </footer>
    </>
  );
}
