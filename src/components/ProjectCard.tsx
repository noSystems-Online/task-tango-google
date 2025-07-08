import { Project } from '@/types/kanban';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onOpenProject: (project: Project) => void;
}

export function ProjectCard({ project, onOpenProject }: ProjectCardProps) {
  const totalTasks = project.columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const completedTasks = project.columns
    .find(col => col.status === 'done')?.tasks.length || 0;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="group hover:shadow-[var(--shadow-elevation)] transition-[var(--transition-smooth)] cursor-pointer border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-[var(--transition-smooth)]">
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'No description provided'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
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
            <span>{formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
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
            {project.columns.map(column => (
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