import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateHighlightSummary(title: string, rawContent: string, source: string) {
    if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert technical writer helping a developer track their career achievements.
    Analyze the following ${source} item and create a concise, impressive summary for a performance review.
    
    Item: ${title}
    Details: ${rawContent.slice(0, 2000)}

    Output exactly 3 lines:
    1. A refined, professional title (max 50 chars).
    2. A one-sentence impact summary (what was achieved/solved).
    3. A comma-separated list of 3-5 relevant technical tags (skills/technologies infered).
    
    Format:
    Title: ...
    Summary: ...
    Tags: ...
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Simple parsing
        const lines = text.split('\n');
        const newTitle = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || title;
        const newSummary = lines.find(l => l.startsWith('Summary:'))?.replace('Summary:', '').trim() || '';
        const tagsStr = lines.find(l => l.startsWith('Tags:'))?.replace('Tags:', '').trim() || '';
        const newTags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

        return {
            title: newTitle,
            summary: newSummary,
            tags: newTags
        };
    } catch (error) {
        console.error("Gemini processing failed:", error);
        throw error;
    }
}

export async function generateRepoRefinement(
    repoName: string,
    activityContext: string,
    tone: 'professional' | 'casual' | 'enthusiastic',
    count: number
) {
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert technical resume writer.
    User has contributed to a repository named "${repoName}".
    Here is the log of selected activities (commits/PRs):
    
    ${activityContext.slice(0, 10000)} ${/* Limit context size */ ''}
    
    Task: Synthesize this activity into exactly ${count} high-impact "Highlights".
    Tone: ${tone}.
    
    Rules:
    - Aggregate related small commits into one substantial highlight.
    - Focus on VALUE (what was solved/improved) not just checking code in.
    - Ignore trivial chores unless they add up to a big refactor.
    
    Output Format: JSON Array of objects.
    Example:
    [
        {
            "title": "Refactored Authentication System",
            "summary": "Migrated from Legacy Auth to NextAuth v5, improving security and reducing login latency by 20%.",
            "tags": ["NextAuth", "Security", "Performance"]
        }
    ]
    
    Return ONLY the JSON array.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found in response");

        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error("Gemini Repo Gen Failed:", e);
        throw e;
    }
}

export async function generateBioVariations(
    activityContext: string,
    tone: 'professional' | 'casual' | 'enthusiastic'
) {
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert technical resume writer.
    Based on the following activity log, write distinct professional summaries (Bios) for the user's profile.
    
    Context:
    ${activityContext.slice(0, 10000)}

    Task: Create exactly 3 variations of a Professional Bio (approx 3-4 sentences each).
    1. **The Professional**: Standard, polished, suited for enterprise roles.
    2. **The Specialist**: Focuses heavily on the specific tech stack and hard skills found in the logs.
    3. **The Executive**: High-level, focusing on impact, leadership, and value delivery (less implementation detail).

    Tone guide: ${tone}

    Output Format: JSON Array of strings.
    Example:
    [
        "Experienced Full Stack Engineer with a focus on...",
        "React and Node.js specialist who has shipped...",
        "Engineering leader driving 20% efficiency gains..."
    ]

    Return ONLY the JSON array.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (!jsonMatch) throw new Error("No JSON array found");
        return JSON.parse(jsonMatch[0]) as string[];
    } catch (e) {
        console.error("Gemini Bio Gen Failed:", e);
        throw e;
    }
}
