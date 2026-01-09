import { UserProfile } from './schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export async function getProfile(email: string = "user@example.com"): Promise<UserProfile> {
    try {
        const res = await fetch(`${API_URL}/profile?email=${email}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch profile from backend');
        }

        const data = await res.json();

        // Transform backend data to frontend schema if needed
        // Specifically handle 'tags' in Wins and 'wins' in Experience which might come as strings if not handled by Pydantic
        // But for now, we assume the backend Pydantic model outputs JSON compatible structure.
        // We do need to parse 'tags' if it comes back as a string from SQLite via the API.

        if (data.wins) {
            data.wins = data.wins.map((w: any) => ({
                ...w,
                tags: typeof w.tags === 'string' ? JSON.parse(w.tags) : w.tags
            }));
        }

        if (data.connectedProviders && typeof data.connectedProviders === 'string') {
            try {
                data.connectedProviders = JSON.parse(data.connectedProviders);
            } catch (e) {
                data.connectedProviders = [];
            }
        }

        // Handle rawActivities from snake_case backend
        // Handle rawActivities (which comes as camelCase key from backend dict, but snake_case fields from Pydantic)
        if (data.rawActivities) {
            data.rawActivities = data.rawActivities.map((ra: any) => ({
                id: ra.id,
                source: ra.source,
                externalId: ra.external_id || ra.externalId,
                title: ra.title,
                content: ra.content,
                metadataJson: ra.metadata_json || ra.metadataJson,
                date: ra.date
            }));
        } else if (data.raw_activities) {
            // Fallback if backend changes key
            data.rawActivities = data.raw_activities.map((ra: any) => ({
                id: ra.id,
                source: ra.source,
                externalId: ra.external_id || ra.externalId,
                title: ra.title,
                content: ra.content,
                metadataJson: ra.metadata_json || ra.metadataJson,
                date: ra.date
            }));
            delete data.raw_activities;
        }

        return data;
    } catch (error) {
        console.error("Backend connection failed:", error);
        // Fallback or re-throw? For MVP better to fail loud so we know backend is down
        throw error;
    }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });

        if (!res.ok) {
            throw new Error('Failed to save profile');
        }
    } catch (error) {
        console.error("Backend save failed:", error);
        throw error;
    }
}

export async function uploadLinkedInPdf(file: File, email: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
        const res = await fetch(`${API_URL}/import/linkedin`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Failed to upload PDF');
        }

        return await res.json();
    } catch (error) {
        console.error("PDF Upload failed:", error);
        throw error;
    }
}

export async function uploadTemplate(file: File, userId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const res = await fetch(`${API_URL}/upload-template`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Failed to upload template');
    }
    return await res.json();
}

export async function getTemplates(userId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/templates?email=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return await res.json();
}

export async function generateResumeDocx(templateId: string | null, profile: UserProfile): Promise<void> {
    const res = await fetch(`${API_URL}/generate-resume/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            template_id: templateId,
            profile: profile
        })
    });

    if (!res.ok) {
        throw new Error('Failed to generate DOCX');
    }

    // Trigger download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${profile.name.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
