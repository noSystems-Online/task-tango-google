import { useState } from "react";
import { Project } from "@/types/kanban";
import { useProjectContext } from "@/context/useProjectContext";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { ProjectTable } from "./ProjectTable";

interface ProjectDashboardProps {
  onOpenProject: (project: Project) => void;
}

export function ProjectDashboard({ onOpenProject }: ProjectDashboardProps) {
  const { projects, loading, createProject, deleteProject, editProject } =
    useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      );
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (
    projectId: string,
    updates: { name: string; description: string }
  ) => {
    await editProject(projectId, updates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pt-0">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Project Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your projects and kanban boards
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project with a kanban board to manage your
                    tasks.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name..."
                      className="border-border/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description..."
                      className="border-border/50 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border/50"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex border border-border/50 rounded-md">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {projects.length === 0 ? (
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to start managing tasks with kanban
                  boards.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No projects found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or create a new project.
                </p>
              </div>
            )}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenProject={onOpenProject}
                onDeleteProject={deleteProject}
                onEditProject={handleEditProject}
              />
            ))}
          </div>
        ) : (
          <ProjectTable
            projects={filteredProjects}
            onOpenProject={onOpenProject}
            onDeleteProject={deleteProject}
            onEditProject={handleEditProject}
          />
        )}
      </div>
      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={editingProject}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
