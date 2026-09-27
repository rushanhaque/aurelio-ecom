import "dotenv/config";
import { database } from "../server/db.ts";
// Production frontend, local-only server, existing development database.
process.env.NODE_ENV = "development";
await database();
process.env.NODE_ENV = "production";
process.env.HOST = "127.0.0.1";
process.env.ALLOW_PREVIEW_ORDERS = "true";
process.env.LOCAL_EMAIL_PREVIEW = "true";
await import("../server.js");
