import { Column, Task } from '@/types/kanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: Column;
  onAddTask?: (columnId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function KanbanColumn({ column, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Card className={`
      h-fit min-h-[200px] w-80 flex-shrink-0
      bg-kanban-column border-border/50
      transition-[var(--transition-smooth)]
      ${isOver ? 'ring-2 ring-primary/20 border-primary/30' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${column.color}`} />
            <CardTitle className="text-sm font-semibold text-foreground">
              {column.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {column.tasks.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask?.(column.id)}
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[120px] pb-2"
        >
          <SortableContext
            items={column.tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No tasks yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask?.(column.id)}
                className="mt-2 text-xs text-primary hover:text-primary-hover"
              >
                Add first task
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}