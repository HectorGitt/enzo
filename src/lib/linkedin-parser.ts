import { UserProfile, Experience, Education, Skill } from './schema';

export async function parseLinkedInPDF(fileBuffer: ArrayBuffer): Promise<Partial<UserProfile>> {
    // SCALE: In a real app, this would use a PDF parsing library (pdf-parse) 
    // and maybe an LLM to extract structure.

    // For MVP, we return a high-quality "stub" profile to simulate the effect

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay

    const mockExperience: Experience[] = [
        {
            id: crypto.randomUUID(),
            role: "Senior Software Engineer",
            company: "TechCorp Inc.",
            startDate: "2023-01",
            current: true,
            description: "Leading the frontend migration to Next.js and improving site performance by 40%.",
            wins: []
        },
        {
            id: crypto.randomUUID(),
            role: "Software Developer",
            company: "StartupXYZ",
            startDate: "2020-06",
            endDate: "2022-12",
            current: false,
            description: "Built the initial MVP using React and Node.js. Scaled to 10k users.",
            wins: []
        }
    ];

    const mockEducation: Education[] = [
        {
            id: crypto.randomUUID(),
            school: "University of Technology",
            degree: "B.S. Computer Science",
            graduationDate: "2020-05"
        }
    ];

    const mockSkills: Skill[] = [
        { name: "React", level: 5, category: "frontend" },
        { name: "TypeScript", level: 4, category: "frontend" },
        { name: "Node.js", level: 4, category: "backend" },
        { name: "AWS", level: 3, category: "devops" }
    ];

    return {
        bio: "Experienced Full Stack Engineer with a focus on modern web frameworks and performance optimization.",
        title: "Senior Full Stack Engineer",
        experience: mockExperience,
        education: mockEducation,
        skills: mockSkills
    };
}
