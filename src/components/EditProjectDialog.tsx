import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Project } from "@/types/kanban";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSave: (
    projectId: string,
    updates: { name: string; description: string }
  ) => Promise<void>;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: EditProjectDialogProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [loading, setLoading] = useState(false);

  // Update fields when project changes
  React.useEffect(() => {
    setName(project?.name || "");
    setDescription(project?.description || "");
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    setLoading(true);
    await onSave(project.id, { name, description });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project name and description.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-project-name">Project Name</Label>
            <Input
              id="edit-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="border-border/50"
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-project-description">
              Description (Optional)
            </Label>
            <Textarea
              id="edit-project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description..."
              className="border-border/50 resize-none"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
