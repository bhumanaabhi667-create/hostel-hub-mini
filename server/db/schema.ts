import {
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const students = pgTable(
  "hostel_student",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    department: text("department").notNull(),
    room: text("room").notNull(),
    hostel: text("hostel").notNull(),
    gender: text("gender").notNull(),
    contact: text("contact").notNull(),
    fee: text("fee").notNull().default("Due"),
    status: text("status").notNull().default("Active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("hostel_student_user_id_idx").on(table.userId)],
);

export const complaints = pgTable(
  "hostel_complaint",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("Open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("hostel_complaint_user_id_idx").on(table.userId),
    index("hostel_complaint_student_id_idx").on(table.studentId),
  ],
);
