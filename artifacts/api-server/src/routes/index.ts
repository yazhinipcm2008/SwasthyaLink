import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import recordsRouter from "./records";
import doctorRouter from "./doctor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(recordsRouter);
router.use(doctorRouter);

export default router;
