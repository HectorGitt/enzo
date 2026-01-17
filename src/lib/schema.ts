export interface Win {
	id: string;
	title: string;
	source: "github" | "linkedin" | "slack" | "manual" | "system";
	rawContent: string;
	summary: string; // The STAR format bullet point
	date: string;
	tags: string[];
	status: "pending" | "approved" | "rejected";
	showOnResume?: boolean;
}

export interface Experience {
	id: string;
	role: string;
	company: string;
	startDate: string;
	endDate?: string;
	current: boolean;
	description: string;
	wins: string[]; // IDs of wins associated with this role
}

export interface Education {
	id: string;
	degree: string;
	school: string;
	graduationDate: string;
}

export interface Skill {
	id: string;
	name: string;
	category: "frontend" | "backend" | "devops" | "soft" | "other";
	level: 1 | 2 | 3 | 4 | 5; // 1: Beginner, 5: Expert
}

export interface Publication {
	id: string;
	title: string;
	publisher: string;
	date: string;
	link: string;
	type: "article" | "book" | "paper" | "other";
}

export interface SpeakingEngagement {
	id: string;
	title: string;
	event: string;
	date: string;
	link?: string;
}

export interface ResumeTemplate {
	id: string;
	name: string;
	filename: string;
	uploadDate: string; // ISO String
}

export interface ResumeConfig {
	template: string;
	sections: {
		id: string;
		text: string; // Display name
		visible: boolean;
	}[];
}

export interface UserProfile {
	id: string;
	name: string;
	username?: string; // Unique handle for public profile
	email: string;
	phone?: string;
	location?: string;
	bio: string; // The "Master Bio"
	title: string; // e.g. "Senior Full Stack Engineeer"
	experience: Experience[];
	education: Education[];
	skills: Skill[];
	publications: Publication[];
	speaking: SpeakingEngagement[];
	wins: Win[]; // Pool of all wins
	portfolioRepo?: string; // e.g. "username/portfolio" for bot PRs
	connectedProviders?: string[]; // IDs of connected providers e.g. ["github", "slack"]
	lastSyncLog?: string; // JSON string of logs
	rawActivities?: RawActivity[]; // Separate ingest data
	resumeConfig?: ResumeConfig;
	bioVariations?: string[]; // Saved AI generated bios
	syncSettings?: {
		frequency: "daily" | "weekly" | "manual";
		syncTypes: string[]; // e.g. ['commits', 'pr', 'slack_messages']
		betaFeatures: boolean;
	};
	socials?: {
		github?: string;
		linkedin?: string;
		twitter?: string;
		website?: string;
	};
	savedContent?: SavedContent[];
	waitlist?: string[]; // Array of integration IDs
	credits: number; // Default 500000
	contentGenerationUsed?: number; // Number of content generations used (for free tier limit)
}

export interface RawActivity {
	id: string;
	source: "github" | "linkedin" | "slack" | "google";
	externalId: string;
	title: string;
	content: string;
	metadataJson: string; // JSON string
	date: string;
}

export interface SavedContent {
	id: string;
	userId: string;
	type: "bio" | "cover_letter" | "highlight" | "raw" | "other";
	content: string;
	title?: string;
	tags?: string[];
	createdAt: string;
}
