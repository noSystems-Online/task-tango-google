import { ProjectProvider } from "@/context/ProjectContext";

export default function App({ children }: { children: React.ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
