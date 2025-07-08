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
import { Label } from "@/components/ui/label";
import { Task } from "@/types/kanban";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { supabase } from "@/integrations/supabase/client";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  attachments: z.any().optional(), // We'll handle validation in the UI for multiple files
});

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>, files?: File[]) => void;
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
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>(
    task?.attachmentUrls || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      attachments: [],
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        attachments: [],
      });
      setAttachmentPreviews(task.attachmentUrls || []);
      setSelectedFiles([]);
    } else {
      reset({
        title: "",
        description: "",
        attachments: [],
      });
      setAttachmentPreviews([]);
      setSelectedFiles([]);
    }
  }, [task, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    // Generate previews
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((previews) => setAttachmentPreviews(previews));
  };

  // --- Image Paste Handler for ReactQuill ---
  const handleImagePaste = async (e: Event) => {
    const clipboardEvent = e as ClipboardEvent;
    if (!clipboardEvent.clipboardData) return;
    const items = clipboardEvent.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Upload to Supabase
          const fileName = `${Date.now()}_${file.name}`;
          const { error } = await supabase.storage
            .from("task-attachments")
            .upload(fileName, file);
          if (error) {
            console.error("Error uploading pasted image:", error);
            return;
          }
          const {
            data: { publicUrl },
          } = supabase.storage.from("task-attachments").getPublicUrl(fileName);
          if (publicUrl) {
            // Insert image into editor
            const quill = document.querySelector(".ql-editor");
            if (quill) {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const img = document.createElement("img");
                img.src = publicUrl;
                range.insertNode(img);
                // Move cursor after image
                range.setStartAfter(img);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }
        }
      }
    }
  };

  // Attach/detach paste event to ReactQuill editor
  useEffect(() => {
    const quillEditor = document.querySelector(".ql-editor");
    if (!quillEditor) return;
    quillEditor.addEventListener("paste", handleImagePaste);
    return () => {
      quillEditor.removeEventListener("paste", handleImagePaste);
    };
  }, [isOpen]);

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    onSave({ ...task, ...data }, selectedFiles);
    onClose();
  };

  const handleClose = () => {
    reset({
      title: task?.title || "",
      description: task?.description || "",
      attachments: [],
    });
    setAttachmentPreviews(task?.attachmentUrls || []);
    setSelectedFiles([]);
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
          <div className="grid gap-2 pb-8">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  theme="snow"
                  value={field.value}
                  onChange={field.onChange}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      [
                        "bold",
                        "italic",
                        "underline",
                        "strike",
                        "blockquote",
                        "code-block",
                      ],
                      [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                        { indent: "+1" },
                      ],
                      ["link", "image", "video"],
                      [{ color: [] }, { background: [] }],
                      [{ align: [] }],
                      ["clean"],
                    ],
                  }}
                  placeholder="Write a description..."
                />
              )}
            />
          </div>

          <div className="w-full border-t border-border/30 my-2" />

          <div className="grid gap-2 pt-2">
            <Label htmlFor="attachment">Attachments</Label>
            <Input
              id="attachment"
              type="file"
              multiple
              onChange={handleFileChange}
              className="flex-1"
            />
            {attachmentPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachmentPreviews.map((preview, idx) => (
                  <img
                    key={idx}
                    src={preview}
                    alt={`Attachment preview ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded-md border"
                  />
                ))}
              </div>
            )}
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
