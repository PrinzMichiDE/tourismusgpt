import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TasksPage() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
             <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        <ModeToggle />
      </div>

      <div className="grid gap-8">
        <TaskForm />
        <TaskList />
      </div>
    </main>
  );
}
