import { Project } from "@/types/kanban";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface ProjectTableProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
}

export function ProjectTable({
  projects,
  onOpenProject,
  onDeleteProject,
  onEditProject,
}: ProjectTableProps) {
  return (
    <div className="border border-border/50 rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const totalTasks = project.columns.reduce(
              (acc, col) => acc + col.tasks.length,
              0
            );
            const completedTasks =
              project.columns.find((col) => col.status === "done")?.tasks.length || 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div
                    className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                    onClick={() => onOpenProject(project)}
                  >
                    {project.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {project.description || "No description"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {project.columns.map((column) => (
                      <Badge key={column.id} variant="secondary" className="text-xs">
                        {column.tasks.length}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}