import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LearnerLayout } from "@/components/learner/LearnerLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sessionThreads, sampleChat, suggestedFollowups } from "@/data/mockData";
import { Paperclip, Send, Sparkles, Bot } from "lucide-react";

export const Route = createFileRoute("/learner/sessions")({
  head: () => ({ meta: [{ title: "Sessions — AI Tutor" }] }),
  component: LearnerSessions,
});

function LearnerSessions() {
  const [selected, setSelected] = useState(sessionThreads[0].id);
  const [input, setInput] = useState("");

  return (
    <LearnerLayout title="AI Tutor Sessions" subtitle="Chat with your Digital Twin tutors anytime.">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Sessions list */}
        <Card className="shadow-soft">
          <div className="border-b border-border p-3">
            <Button className="w-full gradient-ai text-white shadow-glow"><Sparkles className="h-4 w-4" /> New Session</Button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
            {sessionThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={[
                  "w-full text-left p-3 transition hover:bg-accent/50",
                  selected === t.id ? "bg-accent/60" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{t.title}</span>
                  {t.unread > 0 && <Badge className="gradient-ai text-white">{t.unread}</Badge>}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t.tutor} · {t.course}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{t.time}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat pane */}
        <Card className="flex flex-col shadow-soft">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Dr. Maya Chen</div>
              <div className="text-xs text-muted-foreground">Intro to ML · Digital Twin</div>
            </div>
            <Badge className="ml-auto bg-emerald-500/10 text-emerald-600">Online</Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* TODO: connect to AI model — stream messages instead of static mock */}
            {sampleChat.map((m, i) => (
              <div key={i} className={["flex gap-3", m.role === "user" ? "flex-row-reverse" : ""].join(" ")}>
                <div className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                  m.role === "user" ? "bg-primary" : "bg-gradient-to-br from-cyan-500 to-blue-600",
                ].join(" ")}>
                  {m.role === "user" ? "A" : <Bot className="h-4 w-4" />}
                </div>
                <div className={[
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-soft",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary",
                ].join(" ")}>
                  <div>{m.text}</div>
                  <div className={["mt-1 text-[10px]", m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"].join(" ")}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested followups */}
          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
            {suggestedFollowups.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="rounded-full border border-input bg-secondary/50 px-3 py-1.5 text-xs hover:bg-accent"
              >
                <Sparkles className="mr-1 inline h-3 w-3" /> {s}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="flex items-end gap-2 border-t border-border p-3">
            <Button variant="outline" size="icon" aria-label="Attach"><Paperclip className="h-4 w-4" /></Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI tutor anything…"
              className="min-h-[44px] resize-none"
            />
            {/* TODO: connect to AI model — send message to chat completion endpoint */}
            <Button className="gradient-ai text-white shadow-glow"><Send className="h-4 w-4" /> Ask</Button>
          </div>
        </Card>
      </div>
    </LearnerLayout>
  );
}
