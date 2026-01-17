"use client";

import { useState } from "react";
import { MessageCircle, X, Bot, Maximize2 } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Do not show widget on the dedicated chat page
    if (pathname === "/dashboard/chat") return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 ${isOpen
                    ? "bg-red-500 hover:bg-red-600 rotate-90"
                    : "bg-[var(--accent-cyan)] hover:brightness-110"
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 w-[400px] h-[600px] bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen
                    ? "scale-100 opacity-100 pointer-events-auto"
                    : "scale-90 opacity-0 pointer-events-none translate-y-10"
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-black/5 bg-[var(--bg-primary)] rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-cyan)] flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Enzo Copilot</h3>
                            <p className="text-xs text-[var(--text-muted)]">
                                Powered by Gemini 1.5
                            </p>
                        </div>
                    </div>
                    {/* Expand Button */}
                    <Link href="/dashboard/chat" onClick={() => setIsOpen(false)}>
                        <button className="p-2 hover:bg-black/5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ChatInterface variant="widget" />
                </div>
            </div>
        </>
    );
}
