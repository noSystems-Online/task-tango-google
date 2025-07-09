import { Project } from "@/types/kanban";
import { useKanban } from "@/hooks/useKanban";
import { KanbanColumn } from "./KanbanColumn";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useState, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types/kanban";
import { TaskDialog } from "./TaskDialog";
import { useProjectContext } from "@/context/useProjectContext";
import { ProjectSettingsDialog } from "./ProjectSettingsDialog";

const COLUMN_PREFIX = "column-";

interface KanbanBoardProps {
  project: Project;
  onBack: () => void;
  onColumnsChange?: (columns: Project["columns"]) => void;
  onProjectDeleted?: () => void;
}

export function KanbanBoard({
  project,
  onBack,
  onColumnsChange,
  onProjectDeleted,
}: KanbanBoardProps) {
  const {
    columns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderColumns,
    reorderTasks,
  } = useKanban(project.columns);
  const { editProject, deleteProject, fetchAll } = useProjectContext();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (typeof active.id === "string" && active.id.startsWith(COLUMN_PREFIX)) {
      setActiveColumnId(active.id.replace(COLUMN_PREFIX, ""));
      setActiveTask(null);
    } else {
      const task = columns
        .flatMap((col) => col.tasks)
        .find((task) => task.id === active.id);
      setActiveTask(task || null);
      setActiveColumnId(null);
    }
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (task.id) {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
      });
    } else if (editingColumnId) {
      await createTask(editingColumnId, task.title || "", task.description);
    }
    await fetchAll();
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setEditingColumnId(null);
  };

  const handleDeleteTask = async () => {
    if (editingTask?.id) {
      await deleteTask(editingTask.id);
      await fetchAll();
    }
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);

    if (!over) return;

    // Handle column drag
    if (
      typeof active.id === "string" &&
      active.id.startsWith(COLUMN_PREFIX) &&
      typeof over.id === "string" &&
      over.id.startsWith(COLUMN_PREFIX)
    ) {
      const activeColId = active.id.replace(COLUMN_PREFIX, "");
      const overColId = over.id.replace(COLUMN_PREFIX, "");
      if (activeColId !== overColId) {
        const oldIndex = columns.findIndex((col) => col.id === activeColId);
        const newIndex = columns.findIndex((col) => col.id === overColId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(columns, oldIndex, newIndex).map(
            (col, idx) => ({ ...col, order: idx })
          );
          await reorderColumns(newOrder);
          await fetchAll();
        }
      }
      return;
    }

    // Handle task drag (move between columns or reorder within column)
    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;
    // Find the source column
    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeTaskId)
    );
    if (!sourceColumn) return;

    if (sourceColumn.id === overColumnId) {
      // Reorder within the same column
      const column = columns.find((col) => col.id === overColumnId);
      if (!column) return;
      const oldIndex = column.tasks.findIndex(
        (task) => task.id === activeTaskId
      );
      let overTaskIndex = column.tasks.findIndex((task) => task.id === over.id);
      // If dropped on the column itself (empty space), move to end
      if (overTaskIndex === -1) overTaskIndex = column.tasks.length;
      if (oldIndex !== -1 && oldIndex !== overTaskIndex) {
        const newTaskOrder = arrayMove(
          column.tasks,
          oldIndex,
          overTaskIndex
        ).map((t) => t.id);
        // Optimistically update UI
        await reorderTasks(column.id, newTaskOrder);
      }
    } else {
      // Move to another column and reorder both columns
      // Optimistically update UI
      await moveTask(activeTaskId, sourceColumn.id, overColumnId);
      // After move, build new order for both columns
      const source = columns.find((col) => col.id === sourceColumn.id);
      const dest = columns.find((col) => col.id === overColumnId);
      if (source) {
        const sourceTaskIds = source.tasks
          .filter((t) => t.id !== activeTaskId)
          .map((t) => t.id);
        await reorderTasks(source.id, sourceTaskIds);
      }
      if (dest) {
        // If dropped on a task, insert before that task; else, add to end
        let destTaskIds = dest.tasks.map((t) => t.id);
        const overTaskIndex = dest.tasks.findIndex(
          (task) => task.id === over.id
        );
        if (overTaskIndex === -1) {
          destTaskIds = [...destTaskIds, activeTaskId];
        } else {
          destTaskIds = [
            ...destTaskIds.slice(0, overTaskIndex),
            activeTaskId,
            ...destTaskIds.slice(overTaskIndex),
          ];
        }
        await reorderTasks(dest.id, destTaskIds);
      }
    }
  };

  const handleAddTask = (columnId: string) => {
    setEditingColumnId(columnId);
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveProjectSettings = (updates: Partial<Project>) => {
    editProject(project.id, updates);
    setIsSettingsDialogOpen(false);
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    if (onProjectDeleted) {
      onProjectDeleted();
    } else {
      onBack();
    }
  };

  // Move column up or down
  function handleMoveColumn(columnId: string, direction: "up" | "down") {
    const idx = columns.findIndex((col) => col.id === columnId);
    if (idx === -1) return;
    const newIndex = direction === "up" ? idx - 1 : idx + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;
    const newOrder = arrayMove(columns, idx, newIndex).map((col, i) => ({
      ...col,
      order: i,
    }));
    reorderColumns(newOrder);
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>

          <div className="h-6 w-px bg-border" />

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsSettingsDialogOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max pb-6">
            <SortableContext
              items={columns.map((col) => COLUMN_PREFIX + col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column, idx) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                  onMoveColumn={handleMoveColumn}
                  isFirst={idx === 0}
                  isLast={idx === columns.length - 1}
                  enableTaskSorting
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeColumnId ? (
              <div className="w-64 h-10 bg-card rounded shadow flex items-center justify-center font-bold text-lg">
                {columns.find((c) => c.id === activeColumnId)?.title}
              </div>
            ) : activeTask ? (
              <TaskCard task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
      />
      <ProjectSettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
        onSave={handleSaveProjectSettings}
        onDelete={handleDeleteProject}
        project={{ ...project, columns }}
        onColumnsChange={onColumnsChange}
      />
    </div>
  );
}
