import { Card } from "@/components/ui/card";
import { Target, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

const PLAYBOOKS = {
  D: {
    title: "Dominant (D) Type",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    traits: [
      "Direct and decisive",
      "Results-oriented",
      "Competitive and assertive",
      "Takes charge naturally",
    ],
    doThis: [
      "Get straight to the point—no long explanations",
      "Focus on results and bottom-line outcomes",
      "Give them options and let them decide",
      "Be prepared and show competence",
      "Challenge them with ambitious goals",
    ],
    avoidThis: [
      "Wasting time with small talk",
      "Being vague or indecisive",
      "Micromanaging or controlling them",
      "Showing weakness or uncertainty",
    ],
    communication: "Be direct, brief, and results-focused. Present options and let them choose.",
  },
  I: {
    title: "Influential (I) Type",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    traits: [
      "Outgoing and enthusiastic",
      "People-oriented",
      "Optimistic and persuasive",
      "Enjoys social interaction",
    ],
    doThis: [
      "Build rapport with friendly conversation",
      "Show enthusiasm and positive energy",
      "Tell stories and use examples",
      "Recognize their achievements publicly",
      "Make interactions fun and engaging",
    ],
    avoidThis: [
      "Being too formal or rigid",
      "Overwhelming them with data",
      "Ignoring their ideas or input",
      "Being overly critical or negative",
    ],
    communication: "Be warm, engaging, and enthusiastic. Share stories and celebrate wins together.",
  },
  S: {
    title: "Steady (S) Type",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    traits: [
      "Patient and supportive",
      "Values harmony and stability",
      "Loyal and dependable",
      "Good listener",
    ],
    doThis: [
      "Build trust through consistency",
      "Give them time to process changes",
      "Show appreciation for their loyalty",
      "Provide reassurance and support",
      "Maintain a calm, steady approach",
    ],
    avoidThis: [
      "Rushing them or being pushy",
      "Creating unnecessary conflict",
      "Making abrupt changes without warning",
      "Being aggressive or confrontational",
    ],
    communication: "Be patient, supportive, and consistent. Give advance notice of changes.",
  },
  C: {
    title: "Conscientious (C) Type",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    traits: [
      "Analytical and precise",
      "Quality-focused",
      "Systematic and organized",
      "Detail-oriented",
    ],
    doThis: [
      "Provide detailed information and data",
      "Allow time for analysis and questions",
      "Follow through on commitments",
      "Explain the logic and reasoning",
      "Respect their need for accuracy",
    ],
    avoidThis: [
      "Being disorganized or unprepared",
      "Making emotional appeals without logic",
      "Rushing them to decide",
      "Overlooking important details",
    ],
    communication: "Be thorough, logical, and precise. Provide data and answer questions completely.",
  },
};

interface CommunicationPlaybookProps {
  type: "D" | "I" | "S" | "C";
}

export const CommunicationPlaybook = ({ type }: CommunicationPlaybookProps) => {
  const playbook = PLAYBOOKS[type];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-bold ${playbook.color}`}>{playbook.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Communication Strategy & Best Practices
        </p>
      </div>

      <Card className={`border-2 ${playbook.borderColor} ${playbook.bgColor} p-6`}>
        <div className="flex items-start gap-3">
          <Target className={`mt-1 h-5 w-5 ${playbook.color}`} />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Key Traits</h3>
            <ul className="space-y-1 text-sm">
              {playbook.traits.map((trait, idx) => (
                <li key={idx} className="text-muted-foreground">
                  • {trait}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="border border-border p-6">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Communication Style</h3>
            <p className="text-sm text-muted-foreground">{playbook.communication}</p>
          </div>
        </div>
      </Card>

      <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-1 h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-foreground mb-3">Do This</h3>
            <ul className="space-y-2 text-sm">
              {playbook.doThis.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-1 h-5 w-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-foreground mb-3">Avoid This</h3>
            <ul className="space-y-2 text-sm">
              {playbook.avoidThis.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
