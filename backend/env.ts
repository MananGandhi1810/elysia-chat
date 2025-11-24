import { z } from "zod";
import { config } from "dotenv";

config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().default(3000),
    GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
});

let parsedEnv: z.infer<typeof envSchema>;

try {
    parsedEnv = envSchema.parse(process.env);
} catch (e) {
    console.error("Environment variable validation failed:", e);
    process.exit(1);
}

export default parsedEnv;
