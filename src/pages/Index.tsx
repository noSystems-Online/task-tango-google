import { useState } from "react";
import { Project } from "@/types/kanban";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { KanbanBoard } from "@/components/KanbanBoard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "board">(
    "dashboard"
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectListVersion, setProjectListVersion] = useState(0);

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView("board");
  };

  const handleBackToDashboard = (projectDeleted?: boolean) => {
    setCurrentView("dashboard");
    setSelectedProject(null);
    if (projectDeleted) setProjectListVersion((v) => v + 1);
  };

  const handleColumnsChange = (columns: Project["columns"]) => {
    setSelectedProject((prev) => (prev ? { ...prev, columns } : prev));
    // Trigger a re-render of the dashboard to update progress bars
    setProjectListVersion((v) => v + 1);
  };

  if (currentView === "board" && selectedProject) {
    return (
      <KanbanBoard
        project={selectedProject}
        onBack={() => handleBackToDashboard(false)}
        onProjectDeleted={() => handleBackToDashboard(true)}
        onColumnsChange={handleColumnsChange}
      />
    );
  }

  return (
    <ProjectDashboard
      key={projectListVersion}
      onOpenProject={handleOpenProject}
    />
  );
};

export default Index;
