import { Project } from "@/types/kanban";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export interface ProjectCardProps {
  project: Project;
  onOpenProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
}

export function ProjectCard({
  project,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}: ProjectCardProps) {
  const totalTasks = project.columns.reduce(
    (acc, col) => acc + col.tasks.length,
    0
  );
  const completedTasks =
    project.columns.find((col) => col.status === "done")?.tasks.length || 0;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card
      className="group hover:shadow-[var(--shadow-elevation)] transition-[var(--transition-smooth)] cursor-pointer border-border/50 hover:border-primary/20"
      onDoubleClick={() => onOpenProject(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle 
              className="text-lg font-semibold text-foreground group-hover:text-primary transition-[var(--transition-smooth)] cursor-pointer"
              onClick={() => onOpenProject(project)}
            >
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="flex gap-1 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  title="Project Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEditProject && onEditProject(project)}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteProject && onDeleteProject(project.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            {project.columns.map((column) => (
              <Badge
                key={column.id}
                variant="secondary"
                className="text-xs px-2 py-1"
              >
                {column.tasks.length}
              </Badge>
            ))}
          </div>

          <Button
            onClick={() => onOpenProject(project)}
            size="sm"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-[var(--transition-smooth)]"
          >
            Open Board
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
