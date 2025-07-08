import { Task, Priority } from "@/types/kanban";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Clock, Flag, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const priorityIcons: Record<Priority, React.ReactNode> = {
  low: <Flag className="h-3 w-3" />,
  medium: <Flag className="h-3 w-3" />,
  high: <Flag className="h-3 w-3" />,
  urgent: <Flag className="h-3 w-3 fill-current" />,
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Collapsible asChild open={isExpanded} onOpenChange={setIsExpanded}>
      <Card
        ref={setNodeRef}
        style={style}
        className="group shadow-sm hover:shadow-md transition-shadow border-border/50"
      >
        <div className="flex items-start p-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <CollapsibleTrigger asChild>
            <div className="flex-1 cursor-pointer">
              <CardTitle className="text-sm font-medium text-foreground leading-tight">
                {task.title}
              </CardTitle>
              {!isExpanded && task.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {task.description}
                </p>
              )}
            </div>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(task);
            }}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        <CollapsibleContent>
          {task.description && (
            <CardDescription className="px-4 pb-4 text-xs text-muted-foreground">
              {task.description}
            </CardDescription>
          )}
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 ${
                  priorityColors[task.priority]
                }`}
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
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
