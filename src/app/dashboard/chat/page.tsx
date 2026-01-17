"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { Bot } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-black/5 bg-[var(--bg-primary)] flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-cyan)] flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Enzo Copilot</h1>
                    <p className="text-sm text-[var(--text-muted)]">
                        Your AI Career Strategist
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden bg-[var(--bg-secondary)]">
                <div className="h-full w-full px-4 md:px-6">
                    <ChatInterface variant="full" />
                </div>
            </div>
        </div>
    );
}
