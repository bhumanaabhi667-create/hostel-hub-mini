import { __exportAll } from "../_runtime.mjs";
import { createError } from "../_libs/h32.mjs";
import { drizzle, index, pgTable, text, timestamp } from "../_libs/drizzle-orm.mjs";
import { On, pe } from "../_libs/neondatabase__serverless.mjs";
import { require_main } from "../_libs/dotenv.mjs";
import { wrapper_default } from "../_libs/ws.mjs";
import { JOSEAlgNotAllowed, JWKSNoMatchingKey, JWSInvalid, JWSSignatureVerificationFailed, JWTClaimValidationFailed, JWTExpired, JWTInvalid, createRemoteJWKSet, jwtVerify } from "../_libs/jose.mjs";
//#region server/db/schema.ts
var import_main = require_main();
var schema_exports = /* @__PURE__ */ __exportAll({
	complaints: () => complaints,
	students: () => students
});
var students = pgTable("hostel_student", {
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
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("hostel_student_user_id_idx").on(table.userId)]);
var complaints = pgTable("hostel_complaint", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull(),
	studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
	category: text("category").notNull(),
	description: text("description").notNull(),
	status: text("status").notNull().default("Open"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("hostel_complaint_user_id_idx").on(table.userId), index("hostel_complaint_student_id_idx").on(table.studentId)]);
//#endregion
//#region server/db/index.ts
(0, import_main.config)({ path: ".env.local" });
var connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be configured for the server.");
pe.webSocketConstructor = wrapper_default;
var db = drizzle({
	client: new On({ connectionString }),
	schema: schema_exports
});
//#endregion
//#region server/utils/auth.ts
var authBaseUrl = process.env.NEON_AUTH_BASE_URL;
if (!authBaseUrl) throw new Error("NEON_AUTH_BASE_URL must be configured for server authentication.");
var authOrigin = new URL(authBaseUrl).origin;
var jwks = createRemoteJWKSet(new URL(".well-known/jwks.json", `${authBaseUrl.replace(/\/+$/, "")}/`));
async function requireUser(event) {
	const token = event.req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
	if (!token) throw createError({
		statusCode: 401,
		statusMessage: "Sign in to continue."
	});
	let payload;
	try {
		({payload} = await jwtVerify(token, jwks, {
			algorithms: ["EdDSA"],
			issuer: authOrigin,
			audience: authOrigin
		}));
	} catch (error) {
		if (error instanceof JWTExpired || error instanceof JWTClaimValidationFailed || error instanceof JWTInvalid || error instanceof JWSInvalid || error instanceof JWSSignatureVerificationFailed || error instanceof JWKSNoMatchingKey || error instanceof JOSEAlgNotAllowed) throw createError({
			statusCode: 401,
			statusMessage: "Your session is invalid or expired."
		});
		throw error;
	}
	if (typeof payload.sub !== "string" || payload.sub.length === 0) throw createError({
		statusCode: 401,
		statusMessage: "Your session is invalid or expired."
	});
	return { id: payload.sub };
}
//#endregion
export { complaints, db, requireUser, students };
