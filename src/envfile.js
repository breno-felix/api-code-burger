import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

export default {
  dbUrl: process.env.DB_URL,
};