import { useContext } from "react";
import { ProjectContext } from "./ProjectContextInstance";

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx)
    throw new Error("useProjectContext must be used within a ProjectProvider");
  return ctx;
}
