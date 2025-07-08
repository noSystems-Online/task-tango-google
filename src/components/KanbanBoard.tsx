import { Project } from '@/types/kanban';
import { useKanban } from '@/hooks/useKanban';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '@/types/kanban';

interface KanbanBoardProps {
  project: Project;
  onBack: () => void;
}

export function KanbanBoard({ project, onBack }: KanbanBoardProps) {
  const { columns, createTask, updateTask, deleteTask, moveTask } = useKanban(project.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    // Find the source column
    const sourceColumn = columns.find(col => 
      col.tasks.some(task => task.id === activeTaskId)
    );

    if (!sourceColumn) return;

    // If dropping on a different column, move the task
    if (sourceColumn.id !== overColumnId) {
      moveTask(activeTaskId, sourceColumn.id, overColumnId);
    }
  };

  const handleAddTask = (columnId: string) => {
    const title = window.prompt('Enter task title:');
    if (title) {
      createTask(columnId, title);
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
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
              items={columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onAddTask={handleAddTask}
                  onEditTask={(task) => {
                    // For now, just console log - can be enhanced later
                    console.log('Edit task:', task);
                  }}
                  onDeleteTask={deleteTask}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}