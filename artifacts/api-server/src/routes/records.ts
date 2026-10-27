import { Router, type IRouter } from "express";
import { CreateRecordBody } from "@workspace/api-zod";
import { and, desc, eq } from "drizzle-orm";
import { db, recordsTable } from "@workspace/db";
import { requireUser } from "../lib/auth";

const router: IRouter = Router();

function toRecord(record: typeof recordsTable.$inferSelect) {
  return {
    id: record.id,
    kind: record.kind as "diagnosis" | "prescription" | "vaccination" | "visit",
    title: record.title,
    providerName: record.providerName,
    details: record.details,
    recordedAt: record.recordedAt.toISOString(),
  };
}

router.get("/records", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const records = await db
    .select()
    .from(recordsTable)
    .where(eq(recordsTable.userId, user.id))
    .orderBy(desc(recordsTable.recordedAt), desc(recordsTable.id));
  res.json(records.map(toRecord));
});

router.post("/records", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please add a title and details." });
    return;
  }
  const data = parsed.data;
  const [record] = await db
    .insert(recordsTable)
    .values({
      userId: user.id,
      kind: data.kind,
      title: data.title.trim(),
      providerName: data.providerName?.trim() || null,
      details: data.details?.trim() || null,
      ...(data.recordedAt ? { recordedAt: new Date(data.recordedAt) } : {}),
    })
    .returning();
  res.status(201).json(toRecord(record));
});

export default router;