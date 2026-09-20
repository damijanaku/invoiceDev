import { Router } from "express";
const router = Router();
import authenticateToken from "../middleware/auth.middleware.js";
import { register, login, getProfile } from "../controllers/user.controller.js";

router.post("/register", register);
router.post('/login', login);

router.get('/profile', authenticateToken, getProfile);

export default router;