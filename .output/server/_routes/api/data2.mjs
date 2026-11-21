import { defineHandler } from "../../_libs/h3.mjs";
import { createError, readValidatedBody } from "../../_libs/h32.mjs";
import { and, eq } from "../../_libs/drizzle-orm.mjs";
import { complaints, db, requireUser, students } from "../../_chunks/auth.mjs";
import { discriminatedUnionType, enumType, literalType, objectType, stringType } from "../../_libs/zod.mjs";
//#region server/routes/api/data.patch.ts
var updateRecord = discriminatedUnionType("type", [objectType({
	type: literalType("student"),
	id: stringType().min(1),
	fee: enumType(["Paid", "Due"])
}), objectType({
	type: literalType("complaint"),
	id: stringType().min(1),
	status: enumType(["Open", "Resolved"])
})]);
var data_patch_default = defineHandler(async (event) => {
	const user = await requireUser(event);
	const body = await readValidatedBody(event, updateRecord);
	if (body.type === "student") {
		const [student] = await db.update(students).set({ fee: body.fee }).where(and(eq(students.id, body.id), eq(students.userId, user.id))).returning({ id: students.id });
		if (!student) throw createError({
			statusCode: 404,
			statusMessage: "Student not found."
		});
		return { ok: true };
	}
	const [complaint] = await db.update(complaints).set({ status: body.status }).where(and(eq(complaints.id, body.id), eq(complaints.userId, user.id))).returning({ id: complaints.id });
	if (!complaint) throw createError({
		statusCode: 404,
		statusMessage: "Complaint not found."
	});
	return { ok: true };
});
//#endregion
export { data_patch_default as default };
