import { Task, Priority } from '@/types/kanban';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Clock, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const priorityIcons: Record<Priority, React.ReactNode> = {
  low: <Flag className="h-3 w-3" />,
  medium: <Flag className="h-3 w-3" />,
  high: <Flag className="h-3 w-3" />,
  urgent: <Flag className="h-3 w-3 fill-current" />
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group cursor-grab active:cursor-grabbing
        shadow-[var(--shadow-task)] hover:shadow-[var(--shadow-elevation)]
        transition-[var(--transition-smooth)] border-border/50
        ${isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:border-primary/20'}
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-foreground leading-tight">
            {task.title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu actions
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        {task.description && (
          <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 ${priorityColors[task.priority]}`}
          >
            <span className="flex items-center gap-1">
              {priorityIcons[task.priority]}
              {task.priority}
            </span>
          </Badge>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(task.createdAt, { addSuffix: true })}
          </div>
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {task.assignee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {task.assignee}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}