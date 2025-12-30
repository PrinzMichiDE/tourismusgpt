import { getTasks } from "@/app/tasks/actions";
import { TaskItem } from "./task-item";

export async function TaskList() {
  const tasks = await getTasks();

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
        No tasks yet. Create one above!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
