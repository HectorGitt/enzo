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
    
    ${activityContext}
    
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
    ${activityContext}

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
// ... existing code ...

export async function generateResumeJSON(text: string) {
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use 1.5 Flash for large context window

    const prompt = `
    You are an expert Data Extraction Agent. 
    Extract the resume data from the following text into the exact JSON structure defined below.
    
    RESUME TEXT:
    ${text.slice(0, 30000)}

    TARGET JSON STRUCTURE:
    {
        "name": "string (Full Name)",
        "title": "string (Current Job Title)",
        "email": "string",
        "phone": "string",
        "location": "string",
        "bio": "string (Professional Summary, max 500 chars)",
        "skills": ["string (List of skills)"],
        "experience": [
            {
                "company": "string",
                "role": "string",
                "startDate": "string (YYYY-MM or Present)",
                "endDate": "string (YYYY-MM or Present)",
                "current": boolean,
                "description": "string (Bullet points combined into paragraph)",
                "wins": ["string (Extract key achievements as list of strings)"]
            }
        ],
        "education": [
            {
                "school": "string",
                "degree": "string",
                "startDate": "string (YYYY)",
                "endDate": "string (YYYY)"
            }
        ]
    }

    Rules:
    - If a field is not found, leave it as empty string or empty list.
    - Standardize dates to YYYY-MM if possible.
    - Return ONLY valid JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error("Gemini Resume Parse Failed:", e);
        throw e;
    }
}

export type GenerationType = 'overview' | 'strengths' | 'recommendations' | 'highlights' | 'custom';
export type ToneType = 'professional' | 'casual' | 'enthusiastic' | 'executive' | 'bold';

export interface GenerationConfig {
    length: 'short' | 'medium' | 'long';
    tone: ToneType;
    customPrompt?: string;
}

export async function generateCustomContent(
    context: string,
    type: GenerationType,
    config: GenerationConfig
) {
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let promptTemplate = "";

    switch (type) {
        case 'overview':
            promptTemplate = `
            Create a comprehensive **Professional Overview** of the user's career based on the activity log.
            Focus on career progression, key themes, and major technical achievements.
            `;
            break;
        case 'strengths':
            promptTemplate = `
            Analyze the activity log to identify the user's **Top 5 Technical & Soft Skills**.
            For each strength, provide specific evidence from the logs (e.g., "Demonstrated leadership by refactoring X").
            `;
            break;
        case 'recommendations':
            promptTemplate = `
            Based on the code patterns and project types, suggest **3-5 Recommendations** for professional growth or resume positioning.
            Example: "Consider highlighting your experience with X in your summary."
            `;
            break;
        case 'highlights':
            promptTemplate = `
            Extract a list of **Key Highlights** formatted as bullet points for a resume.
            `;
            break;
        case 'custom':
            promptTemplate = config.customPrompt || "Analyze the context.";
            break;
    }

    const lengthGuide = {
        'short': 'Keep it concise (approx 100-200 words).',
        'medium': 'Standard detail (approx 300-500 words).',
        'long': 'In-depth analysis (approx 700+ words).'
    };

    const prompt = `
    You are an expert Career Coach and Technical Resume Writer.
    
    CONTEXT (User's GitHub/Work Activity):
    ${context}

    TASK:
    ${promptTemplate}

    CONFIGURATION:
    - Tone: ${config.tone}
    - Length: ${lengthGuide[config.length]}
    
    OUTPUT FORMAT:
    Return valid Markdown. Use bolding (#, ##) for structure.
    Do NOT wrap in JSON. Return raw Markdown text.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (e) {
        console.error("Gemini Custom Gen Failed:", e);
        throw e;
    }
}
