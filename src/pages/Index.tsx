import { useState } from "react";
import { Project } from "@/types/kanban";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { KanbanBoard } from "@/components/KanbanBoard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "board">(
    "dashboard"
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView("board");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedProject(null);
  };

  const handleColumnsChange = (columns: Project["columns"]) => {
    setSelectedProject((prev) => (prev ? { ...prev, columns } : prev));
  };

  if (currentView === "board" && selectedProject) {
    return (
      <KanbanBoard
        project={selectedProject}
        onBack={handleBackToDashboard}
        onColumnsChange={handleColumnsChange}
      />
    );
  }

  return <ProjectDashboard onOpenProject={handleOpenProject} />;
};

export default Index;
