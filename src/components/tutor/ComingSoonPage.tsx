import { createFileRoute } from "@tanstack/react-router";
import { TutorLayout } from "@/components/tutor/TutorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

type Props = { title: string; subtitle: string; description: string };

export function ComingSoonPage({ title, subtitle, description }: Props) {
  return (
    <TutorLayout title={title} subtitle={subtitle}>
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-ai text-white shadow-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Coming soon</h2>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </TutorLayout>
  );
}

// Helper to register simple placeholder routes
export const Route = createFileRoute("/tutor/_placeholder")({
  component: () => null,
});
