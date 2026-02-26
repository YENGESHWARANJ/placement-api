export interface ResumeData {
    name: string | null;
    email: string | null;
    phone: string | null;
    skills: string[];
    education: string[];
    experience: string[];
    rawText: string;
    isOCR: boolean;
}

export const SKILLS_LIST = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "spring", "laravel",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis", "firebase",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github", "gitlab",
    "machine learning", "deep learning", "ai", "nlp", "tensorflow", "pytorch", "scikit-learn",
    "agile", "scrum", "jira", "leadership", "communication"
];
