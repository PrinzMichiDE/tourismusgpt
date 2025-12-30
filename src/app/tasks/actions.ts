"use server";

import { prisma } from "@/lib/db";
import { taskSchema, TaskInput } from "./schema";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  return await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createTask(data: TaskInput) {
  const result = taskSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }

  await prisma.task.create({
    data: result.data,
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTask(id: string, data: Partial<TaskInput>) {
  await prisma.task.update({
    where: { id },
    data,
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function toggleTask(id: string, completed: boolean) {
  await prisma.task.update({
    where: { id },
    data: { completed },
  });
  revalidatePath("/tasks");
  return { success: true };
}
