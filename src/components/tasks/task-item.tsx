"use client";

import { Task } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTask, toggleTask } from "@/app/tasks/actions";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTask(task.id, !task.completed);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      startTransition(async () => {
        await deleteTask(task.id);
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          disabled={isPending}
          id={`task-${task.id}`}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        className="text-destructive hover:text-destructive/90"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
