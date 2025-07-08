import { useState } from 'react';
import { Task, Column, TaskStatus, Priority } from '@/types/kanban';

export function useKanban(initialColumns: Column[]) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const createTask = (
    columnId: string, 
    title: string, 
    description?: string, 
    priority: Priority = 'medium'
  ) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      status: columns.find(col => col.id === columnId)?.status || 'todo',
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setColumns(prev => prev.map(column => 
      column.id === columnId 
        ? { ...column, tasks: [...column.tasks, newTask] }
        : column
    ));

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    })));
  };

  const deleteTask = (taskId: string) => {
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => task.id !== taskId)
    })));
  };

  const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    const task = columns
      .find(col => col.id === fromColumnId)
      ?.tasks.find(t => t.id === taskId);
    
    if (!task) return;

    const newStatus = columns.find(col => col.id === toColumnId)?.status;
    if (!newStatus) return;

    // Remove task from source column and add to destination column
    setColumns(prev => prev.map(column => {
      if (column.id === fromColumnId) {
        return {
          ...column,
          tasks: column.tasks.filter(t => t.id !== taskId)
        };
      }
      if (column.id === toColumnId) {
        return {
          ...column,
          tasks: [...column.tasks, { ...task, status: newStatus, updatedAt: new Date() }]
        };
      }
      return column;
    }));
  };

  return {
    columns,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };
}