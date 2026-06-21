import { Card, CardContent } from "@/components/ui/card";

const toneStyles: Record<string, string> = {
  blue: "from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-300",
  purple: "from-purple-500/15 to-purple-500/0 text-purple-600 dark:text-purple-300",
  cyan: "from-cyan-500/15 to-cyan-500/0 text-cyan-600 dark:text-cyan-300",
  success: "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300",
  warning: "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300",
};

export function StatCard({ label, value, delta, tone = "blue" }: {
  label: string;
  value: string;
  delta?: string;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <Card className="relative overflow-hidden border-border/60 shadow-soft transition hover:shadow-glow/40">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneStyles[tone]}`} />
      <CardContent className="relative p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
        {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
      </CardContent>
    </Card>
  );
}
