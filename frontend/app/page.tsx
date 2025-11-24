"use client";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";

export default function Chat() {
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);
    const [message, setMessage] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setMessage("")
    };

    return (
        <div className="bg-black text-white h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md flex flex-col gap-4">
                <div className="flex-1 overflow-y-auto p-4 border border-black rounded-lg bg-black/50 h-max"></div>
                <form className="flex gap-2" onSubmit={submit}>
                    <Input
                        placeholder="Type your message..."
                        className="flex-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        autoFocus
                    />
                    <Button type="submit">Send</Button>
                </form>
            </div>
        </div>
    );
}
