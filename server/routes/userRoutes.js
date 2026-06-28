import express from "express";
import { getUserData, storeRecentSearchedCities } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAuth } from "@clerk/express"; // ✅ Import Clerk auth

const userRouter = express.Router();

// ✅ Add requireAuth() before protect
userRouter.get('/', requireAuth(), protect, getUserData);
userRouter.post('/store-recent-search', requireAuth(), protect, storeRecentSearchedCities);

export default userRouter;
