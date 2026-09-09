import { Router, type IRouter } from "express";
import { UpdateProfileBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireUser, toProfile } from "../lib/auth";

const router: IRouter = Router();

router.get("/profile", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  res.json(toProfile(user));
});

router.patch("/profile", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your profile details." });
    return;
  }
  const data = parsed.data;
  const [updated] = await db
    .update(usersTable)
    .set({
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.age !== undefined ? { age: data.age } : {}),
      ...(data.bloodGroup !== undefined ? { bloodGroup: data.bloodGroup } : {}),
      ...(data.allergies !== undefined ? { allergies: data.allergies } : {}),
      ...(data.emergencyContact !== undefined ? { emergencyContact: data.emergencyContact } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
    })
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json(toProfile(updated));
});

export default router;