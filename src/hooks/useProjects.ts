import { useState } from 'react';
import { Project, Task, Column, DEFAULT_COLUMNS } from '@/types/kanban';

// Mock data for demonstration
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    columns: DEFAULT_COLUMNS.map(col => ({
      ...col,
      tasks: col.id === 'todo' ? [
        {
          id: '1',
          title: 'Design new homepage',
          description: 'Create mockups for the new homepage design',
          status: 'todo' as const,
          priority: 'high' as const,
          assignee: 'John Doe',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Update navigation menu',
          description: 'Redesign the main navigation structure',
          status: 'todo' as const,
          priority: 'medium' as const,
          assignee: 'Jane Smith',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16')
        }
      ] : col.id === 'in-progress' ? [
        {
          id: '3',
          title: 'Implement responsive design',
          description: 'Make the website mobile-friendly',
          status: 'in-progress' as const,
          priority: 'high' as const,
          assignee: 'Mike Johnson',
          createdAt: new Date('2024-01-17'),
          updatedAt: new Date('2024-01-20')
        }
      ] : []
    }))
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'New mobile application for iOS and Android',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    columns: DEFAULT_COLUMNS.map(col => ({
      ...col,
      tasks: col.id === 'todo' ? [
        {
          id: '4',
          title: 'User authentication flow',
          description: 'Implement login and registration',
          status: 'todo' as const,
          priority: 'urgent' as const,
          assignee: 'Sarah Wilson',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10')
        }
      ] : col.id === 'done' ? [
        {
          id: '5',
          title: 'Project setup',
          description: 'Initialize React Native project',
          status: 'done' as const,
          priority: 'medium' as const,
          assignee: 'Tom Brown',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-12')
        }
      ] : []
    }))
  }
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const createProject = (name: string, description?: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: DEFAULT_COLUMNS.map(col => ({ ...col, tasks: [] }))
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  return {
    projects,
    createProject,
    updateProject,
    deleteProject
  };
}