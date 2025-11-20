import { cn } from "@/lib/utils";
import { DISCShape } from "./DISCShape";

interface CustomRadioProps {
  id: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  discType: "D" | "I" | "S" | "C";
}

const DISC_STYLES = {
  D: {
    border: "border-disc-d/30 hover:border-disc-d/50",
    bg: "hover:bg-disc-d/5",
    activeBg: "bg-disc-d/10 border-disc-d shadow-glow-d",
    text: "text-disc-d",
  },
  I: {
    border: "border-disc-i/30 hover:border-disc-i/50",
    bg: "hover:bg-disc-i/5",
    activeBg: "bg-disc-i/10 border-disc-i shadow-glow-i",
    text: "text-disc-i",
  },
  S: {
    border: "border-disc-s/30 hover:border-disc-s/50",
    bg: "hover:bg-disc-s/5",
    activeBg: "bg-disc-s/10 border-disc-s shadow-glow-s",
    text: "text-disc-s",
  },
  C: {
    border: "border-disc-c/30 hover:border-disc-c/50",
    bg: "hover:bg-disc-c/5",
    activeBg: "bg-disc-c/10 border-disc-c shadow-glow-c",
    text: "text-disc-c",
  },
};

export const CustomRadio = ({ id, value, checked, onChange, label, discType }: CustomRadioProps) => {
  const styles = DISC_STYLES[discType];

  return (
    <div
      onClick={onChange}
      className={cn(
        "group relative flex items-start space-x-4 rounded-lg border-2 bg-background p-4 cursor-pointer transition-all duration-300",
        styles.border,
        styles.bg,
        checked && styles.activeBg
      )}
    >
      {/* Custom Radio Circle with DISC Shape */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            checked ? `border-disc-${discType.toLowerCase()} bg-disc-${discType.toLowerCase()}` : "border-muted-foreground/30"
          )}
        >
          {checked && (
            <div className="w-3 h-3">
              <DISCShape
                type={discType}
                size="sm"
                className="text-white fill-current animate-scale-in"
              />
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <label htmlFor={id} className="flex-1 cursor-pointer text-sm font-medium leading-relaxed">
        {label}
      </label>

      {/* Decorative DISC Shape Background */}
      <div className="absolute -right-2 -top-2 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
        <div className="w-10 h-10">
          <DISCShape type={discType} size="lg" className={cn("fill-current", styles.text)} />
        </div>
      </div>
    </div>
  );
};
