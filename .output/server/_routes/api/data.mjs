import { defineHandler } from "../../_libs/h3.mjs";
import { and, desc, eq } from "../../_libs/drizzle-orm.mjs";
import { complaints, db, requireUser, students } from "../../_chunks/auth.mjs";
//#region server/routes/api/data.get.ts
var data_get_default = defineHandler(async (event) => {
	const user = await requireUser(event);
	const [studentRows, complaintRows] = await Promise.all([db.select().from(students).where(eq(students.userId, user.id)).orderBy(desc(students.createdAt)), db.select({
		id: complaints.id,
		studentId: complaints.studentId,
		category: complaints.category,
		description: complaints.description,
		date: complaints.createdAt,
		status: complaints.status,
		name: students.name,
		room: students.room
	}).from(complaints).innerJoin(students, eq(complaints.studentId, students.id)).where(and(eq(complaints.userId, user.id), eq(students.userId, user.id))).orderBy(desc(complaints.createdAt))]);
	return {
		students: studentRows.map((student) => {
			const { id, name, department, room, hostel, gender, contact, fee, status } = student;
			return {
				id,
				name,
				department,
				room,
				hostel,
				gender,
				contact,
				fee,
				status,
				initials: name.split(/\s+/).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase()
			};
		}),
		complaints: complaintRows.map((complaint) => ({
			...complaint,
			date: complaint.date.toISOString()
		}))
	};
});
//#endregion
export { data_get_default as default };
