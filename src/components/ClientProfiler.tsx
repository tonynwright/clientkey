import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  company: z
    .string()
    .trim()
    .max(150, { message: "Company must be less than 150 characters" })
    .optional()
    .or(z.literal("")),
});

const questionSchema = z
  .array(z.number().int().min(1).max(5))
  .length(24, { message: "All 24 questions must be answered" });

const discSchema = z.object({
  client: clientSchema,
  answers: questionSchema,
});

const DISC_QUESTIONS: { id: number; text: string; type: "D" | "I" | "S" | "C" }[] = [
  { id: 1, text: "I like to take charge and make quick decisions.", type: "D" },
  { id: 2, text: "I enjoy being the center of attention.", type: "I" },
  { id: 3, text: "I value stability and consistency.", type: "S" },
  { id: 4, text: "I pay close attention to details.", type: "C" },
  { id: 5, text: "I am comfortable taking risks.", type: "D" },
  { id: 6, text: "I easily build rapport with new people.", type: "I" },
  { id: 7, text: "I am patient and a good listener.", type: "S" },
  { id: 8, text: "I prefer to follow structured processes.", type: "C" },
  { id: 9, text: "I am driven by results and goals.", type: "D" },
  { id: 10, text: "I like to motivate and inspire others.", type: "I" },
  { id: 11, text: "I avoid conflict and seek harmony.", type: "S" },
  { id: 12, text: "I double-check work for accuracy.", type: "C" },
  { id: 13, text: "I am competitive and assertive.", type: "D" },
  { id: 14, text: "I enjoy spontaneous conversations.", type: "I" },
  { id: 15, text: "I am loyal and supportive of my team.", type: "S" },
  { id: 16, text: "I like having clear rules and expectations.", type: "C" },
  { id: 17, text: "I act quickly and decisively.", type: "D" },
  { id: 18, text: "I bring energy and optimism to groups.", type: "I" },
  { id: 19, text: "I prefer a calm, steady pace of work.", type: "S" },
  { id: 20, text: "I enjoy analyzing data and information.", type: "C" },
  { id: 21, text: "I like to lead projects from the front.", type: "D" },
  { id: 22, text: "I am expressive and talkative.", type: "I" },
  { id: 23, text: "I am dependable and consistent.", type: "S" },
  { id: 24, text: "I prefer quality over speed.", type: "C" },
];

function calculateDiscType(answers: number[]) {
  const scores = { D: 0, I: 0, S: 0, C: 0 } as Record<"D" | "I" | "S" | "C", number>;

  answers.forEach((value, index) => {
    const question = DISC_QUESTIONS[index];
    scores[question.type] += value;
  });

  const entries = Object.entries(scores) as ["D" | "I" | "S" | "C", number][];
  entries.sort((a, b) => b[1] - a[1]);
  const primary = entries[0][0];

  return { primary, scores };
}

interface ClientWithAssessment {
  id: string;
  name: string;
  email: string;
  company: string | null;
  primary_type: string | null;
  created_at: string;
}

export const ClientProfiler = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    company: "",
  });

  const [answers, setAnswers] = useState<number[]>(Array(24).fill(0));
  const [submitting, setSubmitting] = useState(false);

  const { data: clients, isLoading } = useQuery<ClientWithAssessment[]>({
    queryKey: ["clients-with-disc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, company, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: assessments, error: assessError } = await supabase
        .from("disc_assessments")
        .select("client_id, primary_type, created_at")
        .order("created_at", { ascending: false });

      if (assessError) throw assessError;

      const latestByClient = new Map<string, { primary_type: string; created_at: string }>();
      assessments?.forEach((a) => {
        if (!latestByClient.has(a.client_id)) {
          latestByClient.set(a.client_id, {
            primary_type: a.primary_type,
            created_at: a.created_at,
          });
        }
      });

      return (
        data?.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
          created_at: c.created_at,
          primary_type: latestByClient.get(c.id)?.primary_type ?? null,
        })) ?? []
      );
    },
  });

  const createClientAndAssessment = useMutation({
    mutationFn: async (payload: z.infer<typeof discSchema>) => {
      const { client, answers } = payload;
      const { primary, scores } = calculateDiscType(answers);

      const { data: clientInsert, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: client.name,
          email: client.email,
          company: client.company || null,
        })
        .select("id")
        .single();

      if (clientError || !clientInsert) {
        throw clientError || new Error("Failed to create client");
      }

      const { error: assessmentError } = await supabase.from("disc_assessments").insert({
        client_id: clientInsert.id,
        d_score: scores.D,
        i_score: scores.I,
        s_score: scores.S,
        c_score: scores.C,
        primary_type: primary,
        assessment_data: { answers },
      });

      if (assessmentError) {
        throw assessmentError;
      }

      return { primary, scores };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["clients-with-disc"] });
      toast({
        title: "Assessment saved",
        description: `Primary DISC type: ${result.primary}`,
      });
      setClientForm({ name: "", email: "", company: "" });
      setAnswers(Array(24).fill(0));
    },
    onError: (error: any) => {
      toast({
        title: "Something went wrong",
        description: error?.message ?? "Unable to save client and assessment.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parseResult = discSchema.safeParse({
      client: clientForm,
      answers,
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message ?? "Please fix the errors in the form.";
      toast({ title: "Invalid input", description: firstError });
      setSubmitting(false);
      return;
    }

    createClientAndAssessment
      .mutateAsync(parseResult.data)
      .finally(() => setSubmitting(false));
  };

  const updateAnswer = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:py-16">
        <div className="flex-1 space-y-6">
          <header className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Client Profiler
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              DISC Personality Assessment
            </h1>
            <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
              Capture client details, run a 24-question DISC assessment, and instantly
              see their dominant personality type: D, I, S, or C.
            </p>
          </header>

          <Card className="border border-border bg-card/80 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    value={clientForm.company}
                    onChange={(e) => setClientForm((f) => ({ ...f, company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium text-foreground">DISC Assessment</h2>
                  <p className="text-sm text-muted-foreground">
                    For each statement, rate how well it describes your client from 1
                    (Not at all) to 5 (Very much).
                  </p>
                </div>

                <div className="grid gap-4 max-h-[380px] overflow-y-auto pr-1">
                  {DISC_QUESTIONS.map((q, idx) => (
                    <div
                      key={q.id}
                      className="grid items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 sm:grid-cols-[minmax(0,1fr),auto]"
                    >
                      <p className="text-sm text-foreground">{q.id}. {q.text}</p>
                      <div className="flex items-center gap-1 justify-end">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            type="button"
                            key={v}
                            onClick={() => updateAnswer(idx, v)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors
                              ${
                                answers[idx] === v
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background text-muted-foreground border border-border hover:bg-muted"
                              }
                            `}
                            aria-label={`Question ${q.id} rating ${v}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  All fields and all 24 questions are required before saving.
                </p>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving assessment..." : "Save Client & Assessment"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="flex-1 space-y-4">
          <Card className="border border-border bg-card/80 p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-medium text-foreground">Client Dashboard</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              View all clients and their most recent DISC personality type.
            </p>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading clients...</p>
            ) : clients && clients.length > 0 ? (
              <div className="max-h-[460px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">DISC Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.company || "-"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {client.email}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {client.primary_type ?? "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No clients yet. Add a client and complete an assessment to see results
                here.
              </p>
            )}
          </Card>

          <Card className="border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">About DISC types</p>
            <ul className="mt-2 space-y-1">
              <li><span className="font-semibold">D</span> – Dominance: results-driven, decisive, bold.</li>
              <li><span className="font-semibold">I</span> – Influence: outgoing, persuasive, enthusiastic.</li>
              <li><span className="font-semibold">S</span> – Steadiness: patient, reliable, supportive.</li>
              <li><span className="font-semibold">C</span> – Conscientiousness: analytical, precise, quality-focused.</li>
            </ul>
          </Card>
        </aside>
      </section>
    </main>
  );
};
