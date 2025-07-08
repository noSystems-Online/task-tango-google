import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Project, TaskStatus } from "@/types/kanban";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { AddColumnDialog } from "@/components/AddColumnDialog";
import { useState } from "react";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

interface ProjectSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
  onDelete: () => void;
  project: Project;
}

export function ProjectSettingsDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  project,
}: ProjectSettingsDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name || "",
      description: project.description || "",
    },
  });

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    onSave({ ...project, ...data });
    onClose();
  };

  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [columns, setColumns] = useState(project.columns || []);

  // Enforce column order for display
  const COLUMN_ORDER: TaskStatus[] = [
    "todo",
    "in-progress",
    "done",
    "deployed",
  ];
  const orderedColumns = [...columns].sort(
    (a, b) => COLUMN_ORDER.indexOf(a.status) - COLUMN_ORDER.indexOf(b.status)
  );

  // Add column handler (frontend only, backend logic to be added in hook)
  const handleAddColumn = async (col: {
    title: string;
    status: string;
    color: string;
  }) => {
    setColumns((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        title: col.title,
        status: col.status as TaskStatus,
        color: col.color,
        project_id: project.id,
        tasks: [],
      },
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>Manage your project settings.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} />}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea id="description" {...field} />}
            />
          </div>
          {/* Columns List (ordered) */}
          <div className="grid gap-2">
            <Label>Columns (Order)</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {orderedColumns.map((col) => (
                <span
                  key={col.id}
                  className="px-3 py-1 rounded bg-muted text-xs border"
                >
                  {col.title}
                </span>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAddColumnOpen(true)}
            >
              + Add Column
            </Button>
          </div>
          <DialogFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="mr-auto">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your project and all its tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
        <AddColumnDialog
          open={addColumnOpen}
          onOpenChange={setAddColumnOpen}
          onAdd={handleAddColumn}
        />
      </DialogContent>
    </Dialog>
  );
}
