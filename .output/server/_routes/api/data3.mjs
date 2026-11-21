import { defineHandler } from "../../_libs/h3.mjs";
import { createError, readValidatedBody } from "../../_libs/h32.mjs";
import { and, eq } from "../../_libs/drizzle-orm.mjs";
import { complaints, db, requireUser, students } from "../../_chunks/auth.mjs";
import { discriminatedUnionType, enumType, literalType, objectType, stringType } from "../../_libs/zod.mjs";
import { randomUUID } from "node:crypto";
//#region server/routes/api/data.post.ts
var createRecord = discriminatedUnionType("type", [objectType({
	type: literalType("student"),
	name: stringType().trim().min(1).max(120),
	department: stringType().trim().max(120).default("Undeclared"),
	room: stringType().trim().min(1).max(40),
	hostel: stringType().trim().min(1).max(120),
	gender: stringType().trim().min(1).max(40),
	contact: stringType().trim().max(80).default("—")
}), objectType({
	type: literalType("complaint"),
	studentId: stringType().min(1),
	category: enumType([
		"Electrical",
		"Plumbing",
		"Wi-Fi"
	]),
	description: stringType().trim().min(1).max(2e3)
})]);
var data_post_default = defineHandler(async (event) => {
	const user = await requireUser(event);
	const body = await readValidatedBody(event, createRecord);
	if (body.type === "student") {
		const [student] = await db.insert(students).values({
			id: `STU-${randomUUID()}`,
			userId: user.id,
			name: body.name,
			department: body.department || "Undeclared",
			room: body.room.toUpperCase(),
			hostel: body.hostel,
			gender: body.gender,
			contact: body.contact || "—"
		}).returning();
		return {
			...student,
			initials: student.name.split(/\s+/).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase()
		};
	}
	const [student] = await db.select({
		id: students.id,
		name: students.name,
		room: students.room
	}).from(students).where(and(eq(students.id, body.studentId), eq(students.userId, user.id))).limit(1);
	if (!student) throw createError({
		statusCode: 404,
		statusMessage: "Student not found."
	});
	const [complaint] = await db.insert(complaints).values({
		id: `CMP-${randomUUID()}`,
		userId: user.id,
		studentId: student.id,
		category: body.category,
		description: body.description
	}).returning();
	return {
		...complaint,
		date: complaint.createdAt.toISOString(),
		name: student.name,
		room: student.room
	};
});
//#endregion
export { data_post_default as default };
