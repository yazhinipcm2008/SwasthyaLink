import { Router, type IRouter } from "express";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import { and, eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  createHealthId,
  endSession,
  hashPassword,
  requireUser,
  startSession,
  toProfile,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your details and try again." });
    return;
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    res.status(400).json({ error: "An account with this email already exists." });
    return;
  }
  const [user] = await db
    .insert(usersTable)
    .values({
      healthId: createHealthId(),
      name: data.name.trim(),
      email,
      passwordHash: hashPassword(data.password),
      role: data.role ?? "worker",
      language: data.language ?? "en",
    })
    .returning();
  await startSession(res, user.id);
  res.status(201).json({ user: toProfile(user) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash) || (parsed.data.role && user.role !== parsed.data.role)) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }
  await startSession(res, user.id);
  res.json({ user: toProfile(user) });
});

router.post("/auth/logout", async (req, res) => {
  await endSession(req, res);
  res.status(204).send();
});

router.get("/auth/me", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  res.json({ user: toProfile(user) });
});

export default router;