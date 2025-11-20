import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomRadio } from "./CustomRadio";

export const DISC_QUESTIONS = [
  {
    id: 1,
    optionA: "I make decisions quickly and stick to them",
    optionB: "I prefer to gather all information before deciding",
    aType: "D",
    bType: "C",
  },
  {
    id: 2,
    optionA: "I enjoy being the center of attention",
    optionB: "I prefer working behind the scenes",
    aType: "I",
    bType: "S",
  },
  {
    id: 3,
    optionA: "I value harmony and avoid conflict",
    optionB: "I don't mind confrontation if needed",
    aType: "S",
    bType: "D",
  },
  {
    id: 4,
    optionA: "I focus on accuracy and details",
    optionB: "I focus on the big picture",
    aType: "C",
    bType: "I",
  },
  {
    id: 5,
    optionA: "I prefer to lead and direct others",
    optionB: "I prefer to support and help others",
    aType: "D",
    bType: "S",
  },
  {
    id: 6,
    optionA: "I express enthusiasm openly",
    optionB: "I keep emotions controlled",
    aType: "I",
    bType: "C",
  },
  {
    id: 7,
    optionA: "I work at a steady, consistent pace",
    optionB: "I work in bursts of high energy",
    aType: "S",
    bType: "D",
  },
  {
    id: 8,
    optionA: "I question and analyze before accepting",
    optionB: "I trust and accept readily",
    aType: "C",
    bType: "I",
  },
  {
    id: 9,
    optionA: "I seek challenges and competition",
    optionB: "I seek cooperation and stability",
    aType: "D",
    bType: "S",
  },
  {
    id: 10,
    optionA: "I enjoy meeting new people",
    optionB: "I prefer deepening existing relationships",
    aType: "I",
    bType: "S",
  },
  {
    id: 11,
    optionA: "I resist sudden changes",
    optionB: "I adapt quickly to change",
    aType: "S",
    bType: "D",
  },
  {
    id: 12,
    optionA: "I follow proven methods and systems",
    optionB: "I try new approaches",
    aType: "C",
    bType: "I",
  },
  {
    id: 13,
    optionA: "I tell people directly what I think",
    optionB: "I consider how my words affect others",
    aType: "D",
    bType: "S",
  },
  {
    id: 14,
    optionA: "I am optimistic and see possibilities",
    optionB: "I am realistic and see limitations",
    aType: "I",
    bType: "C",
  },
  {
    id: 15,
    optionA: "I am patient with people and processes",
    optionB: "I push for quick results",
    aType: "S",
    bType: "D",
  },
  {
    id: 16,
    optionA: "I want things done correctly",
    optionB: "I want things done quickly",
    aType: "C",
    bType: "D",
  },
  {
    id: 17,
    optionA: "I take charge in group situations",
    optionB: "I let others take the lead",
    aType: "D",
    bType: "S",
  },
  {
    id: 18,
    optionA: "I share personal stories easily",
    optionB: "I keep conversations professional",
    aType: "I",
    bType: "C",
  },
  {
    id: 19,
    optionA: "I help others feel comfortable",
    optionB: "I focus on achieving goals",
    aType: "S",
    bType: "D",
  },
  {
    id: 20,
    optionA: "I need data and logic to decide",
    optionB: "I rely on gut feelings and intuition",
    aType: "C",
    bType: "I",
  },
  {
    id: 21,
    optionA: "I like to win and be the best",
    optionB: "I like everyone to succeed together",
    aType: "D",
    bType: "S",
  },
  {
    id: 22,
    optionA: "I persuade through charm and enthusiasm",
    optionB: "I persuade through facts and evidence",
    aType: "I",
    bType: "C",
  },
  {
    id: 23,
    optionA: "I value loyalty and trust",
    optionB: "I value competence and results",
    aType: "S",
    bType: "D",
  },
  {
    id: 24,
    optionA: "I plan everything in advance",
    optionB: "I prefer to be spontaneous",
    aType: "C",
    bType: "I",
  },
];

interface DISCAssessmentProps {
  onComplete: (responses: string[], scores: Record<string, number>, dominantType: string) => void;
}

export const DISCAssessment = ({ onComplete }: DISCAssessmentProps) => {
  const [responses, setResponses] = useState<Record<number, "A" | "B">>({});

  const handleSelect = (questionId: number, choice: "A" | "B") => {
    setResponses((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = () => {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    const responseArray: string[] = [];

    DISC_QUESTIONS.forEach((q) => {
      const choice = responses[q.id];
      if (choice === "A") {
        scores[q.aType as keyof typeof scores]++;
        responseArray.push(`${q.id}A`);
      } else if (choice === "B") {
        scores[q.bType as keyof typeof scores]++;
        responseArray.push(`${q.id}B`);
      }
    });

    const dominantType = (Object.keys(scores) as Array<keyof typeof scores>).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    onComplete(responseArray, scores, dominantType);
  };

  const allAnswered = Object.keys(responses).length === DISC_QUESTIONS.length;
  const progress = Math.round((Object.keys(responses).length / DISC_QUESTIONS.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Progress: {Object.keys(responses).length} / {DISC_QUESTIONS.length}
          </p>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
        {DISC_QUESTIONS.map((q) => (
          <Card key={q.id} className="border border-border/50 bg-gradient-subtle p-5">
            <p className="mb-4 text-base font-semibold text-foreground">
              {q.id}. Choose the statement that best describes you:
            </p>
            <div className="space-y-3">
              <CustomRadio
                id={`${q.id}-a`}
                value="A"
                checked={responses[q.id] === "A"}
                onChange={() => handleSelect(q.id, "A")}
                label={q.optionA}
                discType={q.aType as "D" | "I" | "S" | "C"}
              />
              <CustomRadio
                id={`${q.id}-b`}
                value="B"
                checked={responses[q.id] === "B"}
                onChange={() => handleSelect(q.id, "B")}
                label={q.optionB}
                discType={q.bType as "D" | "I" | "S" | "C"}
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full" size="lg">
        {allAnswered ? "Complete Assessment" : `Answer all ${DISC_QUESTIONS.length} questions to continue`}
      </Button>
    </div>
  );
};
