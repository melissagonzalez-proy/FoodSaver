import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type FeedbackTone = "success" | "error" | "info";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message?: string;
  tone?: FeedbackTone;
  actionLabel?: string;
}

const TONE_STYLES: Record<FeedbackTone, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-600",
  },
  error: {
    icon: TriangleAlert,
    className: "bg-red-500/10 text-red-600",
  },
  info: {
    icon: Info,
    className: "bg-brand-accent/10 text-brand-accent",
  },
};

export const FeedbackDialog = ({
  open,
  onOpenChange,
  title,
  message,
  tone = "info",
  actionLabel = "Entendido",
}: FeedbackDialogProps) => {
  const { icon: Icon, className } = TONE_STYLES[tone];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-brand-card border-brand-border rounded-3xl max-w-md">
        <AlertDialogHeader>
          <div
            aria-hidden="true"
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3",
              className,
            )}
          >
            <Icon size={28} />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-center text-brand-text font-jakarta">
            {title}
          </AlertDialogTitle>
          {message && (
            <AlertDialogDescription className="text-center text-brand-muted">
              {message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full rounded-xl bg-brand-accent text-white hover:bg-brand-accent-light">
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
