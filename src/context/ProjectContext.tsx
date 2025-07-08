import React, { useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { ProjectContext } from "@/context/ProjectContextInstance";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    projects,
    loading,
    createProject,
    editProject,
    deleteProject,
    addColumn,
    deleteColumn,
    reorderColumns,
    fetchAll,
  } = useProjects();

  const value = useMemo(
    () => ({
      projects,
      loading,
      createProject,
      editProject,
      deleteProject,
      addColumn,
      deleteColumn,
      reorderColumns,
      fetchAll,
    }),
    [
      projects,
      loading,
      createProject,
      editProject,
      deleteProject,
      addColumn,
      deleteColumn,
      reorderColumns,
      fetchAll,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
