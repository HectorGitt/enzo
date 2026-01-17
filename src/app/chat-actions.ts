"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { auth } from "@/auth";
import {
    getProfileByEmail,
    saveProfileToDB,
    createChatSession,
    getLatestChatSession,
    addChatMessage
} from "@/lib/profile-repository";
import { checkCreditsAction, deductCreditsAction } from "./credits-actions";
import { generateEmbedding, cosineSimilarity } from "@/lib/gemini";
import { UserProfile, Win, RawActivity } from "@/lib/schema";

const API_KEY = process.env.GEMINI_API_KEY;

// Minimum credits required to initiate chat (safety buffer)
const MIN_CREDITS_REQUIRED = 100;

export async function getChatHistoryAction(limit: number = 50, before?: string) {
    const session = await auth();
    // @ts-ignore
    const email = session?.user?.email as string;
    if (!email) return { success: false, error: "Unauthorized" };

    const profile = await getProfileByEmail(email);
    if (!profile) return { success: false, error: "Profile not found" };

    const chatSession = await getLatestChatSession(profile.id, limit, before);
    if (!chatSession) {
        // Return default greeting if new
        return { success: true, messages: [] };
    }

    return { success: true, messages: chatSession.messages };
}

export async function chatWithDataAction(
    message: string,
    history: { role: "user" | "model"; parts: string }[]
) {
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const session = await auth();
    // @ts-ignore
    const email = session?.user?.email as string;
    if (!email) throw new Error("Unauthorized");

    // 1. Credit Check (Check minimum buffer)
    const creditCheck = await checkCreditsAction(MIN_CREDITS_REQUIRED);
    if (!creditCheck.allowed) {
        return {
            success: false,
            error: creditCheck.error || "Insufficient credits",
        };
    }

    // 2. Fetch Profile & Chat Session
    const profile = await getProfileByEmail(email);
    if (!profile) throw new Error("Profile not found");

    let chatSession = await getLatestChatSession(profile.id);
    let sessionId = chatSession?.id;

    if (!sessionId) {
        sessionId = await createChatSession(profile.id);
    }

    // Save User Message immediately
    await addChatMessage(sessionId!, "user", message);

    // 3. Initialize Gemini with Tools
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [
            {
                functionDeclarations: [
                    {
                        name: "search_by_date",
                        description:
                            "Search for achievements/work within a specific date range.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                startDate: {
                                    type: SchemaType.STRING,
                                    description: "Start date (YYYY-MM-DD)",
                                },
                                endDate: {
                                    type: SchemaType.STRING,
                                    description: "End date (YYYY-MM-DD)",
                                },
                            },
                            required: ["startDate", "endDate"],
                        },
                    },
                    {
                        name: "search_by_repo",
                        description:
                            "Search for achievements related to a specific repository or project name.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                repoName: {
                                    type: SchemaType.STRING,
                                    description: "Name of the repository or project (e.g. 'enzo', 'react-app')",
                                },
                            },
                            required: ["repoName"],
                        },
                    },
                    {
                        name: "search_by_similarity",
                        description:
                            "Search for achievements based on semantic similarity to a query topic (e.g. 'React experience', 'Leadership').",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                query: {
                                    type: SchemaType.STRING,
                                    description: "The topic or concept to search for",
                                },
                            },
                            required: ["query"],
                        },
                    },
                ],
            },
        ],
    });

    // 4. Start Chat Session
    const chat = model.startChat({
        // @ts-ignore
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }]
        })),
        systemInstruction: {
            role: "system",
            parts: [{
                text: `
        Current Date: ${new Date().toISOString().split('T')[0]}
        You are Enzo, an expert Career Copilot.
        
        USER PROFILE CONTEXT (RESUME DATA):
        Name: ${profile.name}
        Title: ${profile.title || "Professional"}
        Bio: ${profile.bio || "No bio provided."}
        
        SKILLS:
        ${(profile.skills || []).map(s => s.name).join(", ")}
        
        EXPERIENCE:
        ${(profile.experience || []).map(e => `- ${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'}): ${e.description ? e.description.substring(0, 200) + '...' : ''}`).join("\n")}
        
        EDUCATION:
        ${(profile.education || []).map(e => `- ${e.degree} at ${e.school} (${e.graduationDate})`).join("\n")}
        
        You have access to the user's professional history (Wins, Embeddings).
        
        Your Goal: Answer the user's questions about their own career data accurately.
        
        Process:
        1. ANALYZE the user's request to decide which tool to use.
           - "What did I do last month?" -> search_by_date
           - "Summarize my work on the 'dashboard' repo" -> search_by_repo
           - "What is my experience with Tailwind?" -> search_by_similarity
           - "Rewrite my bio" -> USE PROFILE CONTEXT (No tool needed)
        2. CALL the appropriate tool if specific data retrieval is needed.
        3. RECEIVE the data.
        4. ANSWER the user's question using the data provided AND the profile context above.
        
        Rules:
        - If the user provides a Job Description (JD), extract key skills and search for them using 'search_by_similarity'.
        - Be concise and professional.
        - If the tool returns no results, use the Profile Context (Bio, Skills, Experience, Education) to infer an answer if possible. 
        - ONLY state "I couldn't find any relevant data" if absolutely NO information (neither from tools nor profile context) is helpful.
        ` }]
        },
    });

    try {
        // Send initial message to determine tool use
        const result = await chat.sendMessage(message);
        const call = result.response.functionCalls()?.[0];

        let toolResultText = "";
        let finalResponseText = "";
        let tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;

        if (call) {
            // EXECUTE TOOL
            const args = call.args as Record<string, unknown>;
            // Union type for results
            let relevantItems: (Win | RawActivity)[] = [];

            if (call.name === "search_by_date") {
                console.log("TOOL CALL: search_by_date", args);
                const start = new Date(args.startDate as string).toISOString().split('T')[0];
                const end = new Date(args.endDate as string).toISOString().split('T')[0];

                console.log(`Searching range: ${start} to ${end}`);
                console.log(`Total Wins: ${profile.wins.length}, Total Raw: ${profile.rawActivities?.length || 0}`);

                // Filter Wins
                const wins = profile.wins.filter((w) => {
                    return w.date >= start && w.date <= end;
                });

                // Filter Raw Activities
                const raw = (profile.rawActivities || []).filter((r) => {
                    // Raw dates might be ISO timestamps, extract YYYY-MM-DD
                    const rDate = r.date.includes('T') ? r.date.split('T')[0] : r.date;
                    return rDate >= start && rDate <= end;
                });

                relevantItems = [...wins, ...raw];
                console.log(`Found ${relevantItems.length} matches (${wins.length} wins, ${raw.length} raw).`);

            } else if (call.name === "search_by_repo") {
                const repo = (args.repoName as string).toLowerCase();

                const wins = profile.wins.filter((w) =>
                    w.tags.some((t) => t.toLowerCase().includes(repo))
                );

                const raw = (profile.rawActivities || []).filter((r) => {
                    const meta: any = r.metadataJson || {};
                    const rRepo = meta.repo?.toLowerCase() || "";
                    return rRepo.includes(repo) || r.title.toLowerCase().includes(repo);
                });

                relevantItems = [...wins, ...raw];

            } else if (call.name === "search_by_similarity") {
                const query = args.query as string;

                // On-the-fly embedding check (Batched)
                const winsWithEmbeddings = await ensureEmbeddings(profile.wins);
                if (winsWithEmbeddings.updated) {
                    await saveProfileToDB({ ...profile, wins: winsWithEmbeddings.wins });
                }

                const queryEmbedding = await generateEmbedding(query);

                const scored = winsWithEmbeddings.wins.map(w => ({
                    item: w,
                    score: w.embedding ? cosineSimilarity(queryEmbedding, w.embedding) : 0
                }));

                // Sort by score desc, top 20
                relevantItems = scored
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 20)
                    .map(s => s.item);
            }

            // Feed Data Back
            toolResultText = JSON.stringify(relevantItems.map(item => {
                // Determine source/type
                const isWin = (item as Win).summary !== undefined;
                return {
                    type: isWin ? "Highlight" : "Raw Activity",
                    date: item.date,
                    title: item.title,
                    summary: isWin ? (item as Win).summary : (item as RawActivity).content,
                    source: item.source
                };
            })); // Minimize tokens

            const finalResult = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: {
                            result: toolResultText
                        }
                    }
                }
            ]);

            finalResponseText = finalResult.response.text();
            tokensUsed += finalResult.response.usageMetadata?.totalTokenCount || 0;

        } else {
            // No tool call needed (e.g. "Hi")
            finalResponseText = result.response.text();
        }

        // Save AI Response
        await addChatMessage(sessionId!, "model", finalResponseText);

        // Deduct Actual Credits Used
        await deductCreditsAction(tokensUsed, "Enzo Chat");

        return {
            success: true,
            response: finalResponseText,
            tokensUsed
        };

    } catch (e: any) {
        console.error("Chat Action Failed:", e);
        return { success: false, error: e.message };
    }
}


// Helper to ensure all wins have embeddings (Optimized Batching)
// Returns updated list and boolean flag if db update is needed
async function ensureEmbeddings(wins: Win[]): Promise<{ wins: Win[], updated: boolean }> {
    let updated = false;
    const processingWins = [...wins];

    // Filter wins needing embeddings
    const needingEmbedding = processingWins.filter(w => !w.embedding || w.embedding.length === 0);

    if (needingEmbedding.length > 0) {
        updated = true;
        const BATCH_SIZE = 5; // Process 5 at a time to prevent rate limits/crashes

        for (let i = 0; i < needingEmbedding.length; i += BATCH_SIZE) {
            const batch = needingEmbedding.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (w) => {
                try {
                    // Combine title and summary for embedding context
                    const textToEmbed = `${w.title} ${w.summary} ${w.tags.join(" ")}`;
                    w.embedding = await generateEmbedding(textToEmbed);
                } catch (e) {
                    console.warn(`Failed to generate embedding for win ${w.id}`, e);
                }
            }));
        }
    }

    return { wins: processingWins, updated };
}
