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
import { useState, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DOMPurify from "dompurify";

// Utility to strip HTML tags and decode entities
function stripHtml(html: string): string {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  enableSorting?: boolean;
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

export function TaskCard({ task, onEdit, enableSorting }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const style = enableSorting
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const clickTimeout = useRef<number | null>(null);

  const handleTitleClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (onEdit) onEdit(task);
    } else {
      clickTimeout.current = window.setTimeout(() => {
        setIsExpanded((prev) => !prev);
        clickTimeout.current = null;
      }, 250);
    }
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
            {...(enableSorting ? attributes : {})}
            {...(enableSorting ? listeners : {})}
            onClick={handleTitleClick}
            className="flex-1 cursor-pointer"
          >
            <CardTitle className="text-sm font-medium text-foreground leading-tight">
              {task.title}
            </CardTitle>
            {!isExpanded && task.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {stripHtml(task.description)}
              </p>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            {Array.isArray(task.attachmentUrls) &&
              task.attachmentUrls.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {task.attachmentUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Task attachment ${idx + 1}`}
                      className="max-w-[6rem] h-16 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
            {task.description && (
              <div
                className="text-sm text-muted-foreground prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(task.description),
                }}
              />
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
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
              </div>

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
