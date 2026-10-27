import { eq } from "drizzle-orm";
import { db, usersTable, recordsTable } from "@workspace/db";
import { hashPassword } from "./auth";
import { logger } from "./logger";

export async function seedInitialData() {
  try {
    // Check if worker exists
    const [existingWorker] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.aadhaar, "123456789012"))
      .limit(1);

    let workerId: number;

    if (!existingWorker) {
      const [worker] = await db
        .insert(usersTable)
        .values({
          name: "Rahul Kumar",
          aadhaar: "123456789012",
          passwordHash: hashPassword("password123"),
          healthId: "SWL-2026-KL892",
          role: "worker",
          age: 29,
          bloodGroup: "B+",
          allergies: "Penicillin, Dust",
          emergencyContact: "+91 98765 43210",
          language: "en",
        })
        .returning();
      workerId = worker.id;
      logger.info({ workerId: worker.id }, "Seeded demo worker account");
    } else {
      workerId = existingWorker.id;
    }

    // Check if doctor exists
    const [existingDoctor] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.aadhaar, "987654321098"))
      .limit(1);

    if (!existingDoctor) {
      await db
        .insert(usersTable)
        .values({
          name: "Dr. Anjali Menon",
          aadhaar: "987654321098",
          passwordHash: hashPassword("password123"),
          healthId: "SWL-2026-DOC01",
          role: "doctor",
          age: 42,
          bloodGroup: "O+",
          allergies: null,
          emergencyContact: "+91 94471 23456",
          language: "en",
        })
        .returning();
      logger.info("Seeded demo doctor account");
    }

    // Check records for demo worker
    const existingRecords = await db
      .select()
      .from(recordsTable)
      .where(eq(recordsTable.userId, workerId))
      .limit(1);

    if (existingRecords.length === 0) {
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

      await db.insert(recordsTable).values([
        {
          userId: workerId,
          kind: "diagnosis",
          title: "Seasonal Bronchitis",
          providerName: "Ernakulam General Hospital",
          details: "Mild wheezing, prescribed inhaler for 5 days. Rest advised.",
          recordedAt: threeDaysAgo,
        },
        {
          userId: workerId,
          kind: "prescription",
          title: "Amoxicillin 500mg & Cetirizine 10mg",
          providerName: "Dr. Anjali Menon (Community Clinic)",
          details: "Take after food twice daily for 5 days.",
          recordedAt: threeDaysAgo,
        },
        {
          userId: workerId,
          kind: "vaccination",
          title: "Tetanus Toxoid (TT)",
          providerName: "Primary Health Centre, Aluva",
          details: "Routine booster shot administered.",
          recordedAt: twoWeeksAgo,
        },
      ]);
      logger.info({ workerId }, "Seeded sample medical records for worker");
    }
  } catch (err) {
    logger.warn({ err }, "Could not seed initial data");
  }
}
