import { Elysia, t } from "elysia";
import { node } from "@elysiajs/node";
import env from "./env";
import { chat } from "./ai";

const PORT = env.PORT;

const app = new Elysia({ adapter: node() })
    .get("/", () => "Hello, Elysia!")
    .get("/health", () => ({ status: "ok" }))
    .post(
        "/chat",
        ({ body: { message }, set }) => {
            set.headers = { "Content-Type": "text/event-stream" };
            return chat(message).textStream;
        },
        {
            body: t.Object({ message: t.String() }),
        },
    )
    .listen(PORT, ({ hostname, port }) => {
        console.log(`🦊 Elysia is running at ${hostname}:${port}`);
    });
