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
import { Task } from "@/types/kanban";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash, Upload } from "lucide-react";
import { useEffect, useState } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  attachment: z.instanceof(File).optional(),
});

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: () => void;
  task?: Task | null;
}

export function TaskDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
}: TaskDialogProps) {
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    task?.attachmentUrl || null
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
      });
      setAttachmentPreview(task.attachmentUrl || null);
    } else {
      reset({
        title: "",
        description: "",
      });
      setAttachmentPreview(null);
    }
  }, [task, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    onSave({ ...task, ...data });
    onClose();
  };

  const handleClose = () => {
    reset({
      title: task?.title || "",
      description: task?.description || "",
    });
    setAttachmentPreview(task?.attachmentUrl || null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Edit the details of your task."
              : "Add a new task to your project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => <Input id="title" {...field} />}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
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
          <div className="grid gap-2">
            <Label htmlFor="attachment">Attachment</Label>
            <div className="flex items-center gap-4">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
              />
              {attachmentPreview && (
                <img
                  src={attachmentPreview}
                  alt="Attachment preview"
                  className="h-16 w-16 object-cover rounded-md"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            {task && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="mr-auto"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
