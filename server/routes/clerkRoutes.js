import express from "express";
import bodyParser from "body-parser";
import clerkWebhooks from "../controllers/clerkWebhooks.js";

const router = express.Router();

router.post("/clerk-webhook", bodyParser.raw({ type: "*/*" }), clerkWebhooks);

export default router;