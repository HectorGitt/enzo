export interface Project {
    id: string;
    name: string;
    description: string;
    tags: string[];
    link?: string;
    wins: Win[];
}

export interface Win {
    id: string;
    source: 'github' | 'slack' | 'manual';
    rawContent: string;
    summary: string;
    date: string;
    status: 'pending' | 'approved';
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    bio: string;
    skills: string[];
    projects: Project[];
}
