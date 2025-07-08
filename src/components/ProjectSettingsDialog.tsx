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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { useProjectContext } from "@/context/useProjectContext";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

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
  onColumnsChange?: (columns: Project["columns"]) => void;
}

import { ArrowUp, ArrowDown } from "lucide-react";

interface SortableColumnItemProps {
  col: Project["columns"][number];
  index: number;
  total: number;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  listeners?: SyntheticListenerMap | undefined;
  attributes?: React.HTMLAttributes<Element>;
  isDragging?: boolean;
}

function SortableColumnItem({
  col,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  listeners,
  attributes,
  isDragging,
}: SortableColumnItemProps) {
  const { setNodeRef, transform, transition } = useSortable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-2 px-3 py-1 rounded bg-muted text-xs border mb-1 cursor-move"
      {...attributes}
      {...listeners}
    >
      <span className="flex-1">{col.title}</span>
      <div className="flex flex-col gap-0.5 mr-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-5 w-5 p-0"
          onClick={() => onMoveUp(col.id)}
          title="Move up"
          disabled={index === 0}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-5 w-5 p-0"
          onClick={() => onMoveDown(col.id)}
          title="Move down"
          disabled={index === total - 1}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-5 w-5 p-0 text-destructive"
        onClick={() => onDelete(col.id)}
        title="Delete column"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProjectSettingsDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  project,
  onColumnsChange,
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

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

  const { addColumn, deleteColumn, reorderColumns } = useProjectContext();

  // Add column handler (should call backend addColumn)
  const handleAddColumn = async (col: {
    title: string;
    status: string;
    color: string;
  }) => {
    const newCol = await addColumn(project.id, col);
    if (newCol) {
      const updated = [
        ...columns,
        { ...newCol, status: newCol.status as TaskStatus, tasks: [] },
      ];
      setColumns(updated);
      onColumnsChange?.(updated);
    }
  };

  // Delete column handler (should call backend deleteColumn)
  const handleDeleteColumn = async (columnId: string) => {
    const ok = await deleteColumn(columnId, project.id);
    if (ok) {
      const updated = columns.filter((col) => col.id !== columnId);
      setColumns(updated);
      onColumnsChange?.(updated);
    }
  };

  // Drag-and-drop reorder handler (should call backend reorderColumns)
  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = columns.findIndex((col) => col.id === active.id);
    const newIndex = columns.findIndex((col) => col.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newColumns = arrayMove(columns, oldIndex, newIndex);
    setColumns(newColumns);
    reorderColumns(
      project.id,
      newColumns.map((col) => col.id)
    );
    onColumnsChange?.(newColumns);
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
          {/* Columns List (drag-and-drop, delete) */}
          <div className="grid gap-2">
            <Label>Columns (Order)</Label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => setDraggingId(active.id as string)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map((col) => col.id)}
                strategy={verticalListSortingStrategy}
              >
                {columns.map((col, idx) => (
                  <SortableColumnItem
                    key={col.id}
                    col={col}
                    index={idx}
                    total={columns.length}
                    isDragging={draggingId === col.id}
                    onDelete={handleDeleteColumn}
                    onMoveUp={() => {
                      if (idx === 0) return;
                      const newColumns = [...columns];
                      [newColumns[idx - 1], newColumns[idx]] = [
                        newColumns[idx],
                        newColumns[idx - 1],
                      ];
                      setColumns(newColumns);
                      reorderColumns(
                        project.id,
                        newColumns.map((c) => c.id)
                      );
                      onColumnsChange?.(newColumns);
                    }}
                    onMoveDown={() => {
                      if (idx === columns.length - 1) return;
                      const newColumns = [...columns];
                      [newColumns[idx], newColumns[idx + 1]] = [
                        newColumns[idx + 1],
                        newColumns[idx],
                      ];
                      setColumns(newColumns);
                      reorderColumns(
                        project.id,
                        newColumns.map((c) => c.id)
                      );
                      onColumnsChange?.(newColumns);
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
