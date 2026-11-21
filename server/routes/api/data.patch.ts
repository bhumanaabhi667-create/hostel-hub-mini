import { and, eq } from "drizzle-orm";
import { defineHandler } from "nitro";
import { createError, readValidatedBody } from "nitro/h3";
import { z } from "zod";
import { db } from "../../db";
import { complaints, students } from "../../db/schema";
import { requireUser } from "../../utils/auth";

const updateRecord = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("student"),
    id: z.string().min(1),
    fee: z.enum(["Paid", "Due"]),
  }),
  z.object({
    type: z.literal("complaint"),
    id: z.string().min(1),
    status: z.enum(["Open", "Resolved"]),
  }),
]);

export default defineHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readValidatedBody(event, updateRecord);

  if (body.type === "student") {
    const [student] = await db
      .update(students)
      .set({ fee: body.fee })
      .where(and(eq(students.id, body.id), eq(students.userId, user.id)))
      .returning({ id: students.id });

    if (!student) {
      throw createError({ statusCode: 404, statusMessage: "Student not found." });
    }

    return { ok: true };
  }

  const [complaint] = await db
    .update(complaints)
    .set({ status: body.status })
    .where(and(eq(complaints.id, body.id), eq(complaints.userId, user.id)))
    .returning({ id: complaints.id });

  if (!complaint) {
    throw createError({ statusCode: 404, statusMessage: "Complaint not found." });
  }

  return { ok: true };
});
