import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { defineHandler } from "nitro";
import { createError, readValidatedBody } from "nitro/h3";
import { z } from "zod";
import { db } from "../../db";
import { complaints, students } from "../../db/schema";
import { requireUser } from "../../utils/auth";

const createRecord = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("student"),
    name: z.string().trim().min(1).max(120),
    department: z.string().trim().max(120).default("Undeclared"),
    room: z.string().trim().min(1).max(40),
    hostel: z.string().trim().min(1).max(120),
    gender: z.string().trim().min(1).max(40),
    contact: z.string().trim().max(80).default("—"),
  }),
  z.object({
    type: z.literal("complaint"),
    studentId: z.string().min(1),
    category: z.enum(["Electrical", "Plumbing", "Wi-Fi"]),
    description: z.string().trim().min(1).max(2000),
  }),
]);

export default defineHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readValidatedBody(event, createRecord);

  if (body.type === "student") {
    const [student] = await db
      .insert(students)
      .values({
        id: `STU-${randomUUID()}`,
        userId: user.id,
        name: body.name,
        department: body.department || "Undeclared",
        room: body.room.toUpperCase(),
        hostel: body.hostel,
        gender: body.gender,
        contact: body.contact || "—",
      })
      .returning();

    return {
      ...student,
      initials: student.name
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  }

  const [student] = await db
    .select({ id: students.id, name: students.name, room: students.room })
    .from(students)
    .where(and(eq(students.id, body.studentId), eq(students.userId, user.id)))
    .limit(1);

  if (!student) {
    throw createError({ statusCode: 404, statusMessage: "Student not found." });
  }

  const [complaint] = await db
    .insert(complaints)
    .values({
      id: `CMP-${randomUUID()}`,
      userId: user.id,
      studentId: student.id,
      category: body.category,
      description: body.description,
    })
    .returning();

  return {
    ...complaint,
    date: complaint.createdAt.toISOString(),
    name: student.name,
    room: student.room,
  };
});
