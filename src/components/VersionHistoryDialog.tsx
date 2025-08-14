import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { History } from "lucide-react";

interface VersionHistoryDialogProps {
  currentVersion: string;
}

const VERSION_HISTORY: Array<{
  version: string;
  date: string;
  changes: string[];
}> = [
  {
    version: "v1.3.0",
    date: "2025-08-14",
    changes: [
      "Comprehensive security vulnerability fixes",
      "Database security hardening with audit logging",
      "Enhanced API key and 2FA validation",
      "Improved input validation and sanitization",
      "Added Security Dashboard for monitoring",
    ],
  },
  {
    version: "v1.2.0",
    date: "2025-08-01",
    changes: [
      "Improved language switching with locale-aware formatting",
      "Security and performance refinements",
      "Minor bug fixes",
    ],
  },
  {
    version: "v1.1.0",
    date: "2025-07-10",
    changes: [
      "Added manual date entry in Planning",
      "UI/UX polish across Settings",
    ],
  },
  {
    version: "v1.0.0",
    date: "2025-06-01",
    changes: ["Initial public release"],
  },
];

export function VersionHistoryDialog({ currentVersion }: VersionHistoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          View history
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>Recent updates and changes</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {VERSION_HISTORY.map((entry) => (
            <div key={entry.version} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{entry.version}</div>
                <div className="text-sm text-muted-foreground">{entry.date}</div>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {entry.changes.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
              {entry.version === currentVersion && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Current</Badge>
                </div>
              )}
              <Separator />
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VersionHistoryDialog;
