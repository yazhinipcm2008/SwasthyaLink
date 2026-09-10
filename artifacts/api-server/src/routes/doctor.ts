import { Router, type IRouter } from "express";
import { CreateRecordBody } from "@workspace/api-zod";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { db, recordsTable, usersTable } from "@workspace/db";
import { requireDoctor, toProfile } from "../lib/auth";

const router: IRouter = Router();

function toRecord(record: typeof recordsTable.$inferSelect) {
  return {
    id: record.id,
    kind: record.kind as "diagnosis" | "prescription" | "visit",
    title: record.title,
    details: record.details,
    recordedAt: record.recordedAt.toISOString(),
  };
}

router.get("/doctor/workers", async (req, res) => {
  const doctor = await requireDoctor(req, res);
  if (!doctor) return;
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query) {
    res.json([]);
    return;
  }
  const workers = await db
    .select({
      id: usersTable.id,
      healthId: usersTable.healthId,
      name: usersTable.name,
      age: usersTable.age,
      bloodGroup: usersTable.bloodGroup,
    })
    .from(usersTable)
    .where(and(eq(usersTable.role, "worker"), or(ilike(usersTable.name, `%${query}%`), ilike(usersTable.healthId, `%${query}%`))))
    .orderBy(asc(usersTable.name))
    .limit(20);
  res.json(workers);
});

router.get("/doctor/workers/:healthId", async (req, res) => {
  const doctor = await requireDoctor(req, res);
  if (!doctor) return;
  const [worker] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.role, "worker"), eq(usersTable.healthId, req.params.healthId)))
    .limit(1);
  if (!worker) {
    res.status(404).json({ error: "Worker not found." });
    return;
  }
  res.json(toProfile(worker));
});

router.get("/doctor/workers/:healthId/records", async (req, res) => {
  const doctor = await requireDoctor(req, res);
  if (!doctor) return;
  const [worker] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.role, "worker"), eq(usersTable.healthId, req.params.healthId)))
    .limit(1);
  if (!worker) {
    res.status(404).json({ error: "Worker not found." });
    return;
  }
  const records = await db
    .select()
    .from(recordsTable)
    .where(eq(recordsTable.userId, worker.id))
    .orderBy(desc(recordsTable.recordedAt), desc(recordsTable.id));
  res.json(records.map(toRecord));
});

router.post("/doctor/workers/:healthId/records", async (req, res) => {
  const doctor = await requireDoctor(req, res);
  if (!doctor) return;
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please add a title and details." });
    return;
  }
  const [worker] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.role, "worker"), eq(usersTable.healthId, req.params.healthId)))
    .limit(1);
  if (!worker) {
    res.status(404).json({ error: "Worker not found." });
    return;
  }
  const data = parsed.data;
  const [record] = await db
    .insert(recordsTable)
    .values({
      userId: worker.id,
      kind: data.kind,
      title: data.title.trim(),
      details: data.details.trim(),
      ...(data.recordedAt ? { recordedAt: new Date(data.recordedAt) } : {}),
    })
    .returning();
  res.status(201).json(toRecord(record));
});

export default router;