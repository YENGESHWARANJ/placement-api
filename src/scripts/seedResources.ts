import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../modules/resources/resource.model";

dotenv.config();

const sampleResources = [
    {
        title: "React Official Documentation",
        description: "Comprehensive guide to React.js with hooks, state management, and best practices.",
        url: "https://react.dev",
        category: "Frontend Development",
        tags: ["react", "javascript", "web development"],
        type: "documentation",
        difficulty: "beginner",
        featured: true,
        rating: 4.9
    },
    {
        title: "TypeScript Handbook",
        description: "Complete TypeScript documentation covering types, interfaces, and advanced patterns.",
        url: "https://www.typescriptlang.org/docs/",
        category: "Programming Languages",
        tags: ["typescript", "javascript", "types"],
        type: "documentation",
        difficulty: "intermediate",
        featured: true,
        rating: 4.8
    },
    {
        title: "The Ultimate Node.js Course",
        description: "Master Node.js from basics to advanced topics including Express, MongoDB, and APIs.",
        url: "https://www.udemy.com/course/the-complete-nodejs-developer-course",
        category: "Backend Development",
        tags: ["nodejs", "express", "mongodb", "backend"],
        type: "course",
        difficulty: "beginner",
        featured: true,
        rating: 4.7
    },
    {
        title: "System Design Primer",
        description: "Learn how to design large-scale systems. Prep for the system design interview.",
        url: "https://github.com/donnemartin/system-design-primer",
        category: "System Design",
        tags: ["system design", "architecture", "interview prep"],
        type: "article",
        difficulty: "advanced",
        featured: true,
        rating: 4.9
    },
    {
        title: "LeetCode Practice Platform",
        description: "Coding interview preparation with thousands of algorithmic challenges.",
        url: "https://leetcode.com",
        category: "Interview Preparation",
        tags: ["algorithms", "data structures", "coding interview"],
        type: "tool",
        difficulty: "intermediate",
        featured: false,
        rating: 4.6
    },
    {
        title: "Docker for Beginners",
        description: "Learn containerization with Docker from scratch to production deployment.",
        url: "https://www.docker.com/101-tutorial",
        category: "DevOps",
        tags: ["docker", "containers", "devops"],
        type: "course",
        difficulty: "beginner",
        featured: false,
        rating: 4.5
    },
    {
        title: "AWS Cloud Practitioner Essentials",
        description: "Introduction to AWS cloud computing fundamentals and core services.",
        url: "https://aws.amazon.com/training/",
        category: "Cloud Computing",
        tags: ["aws", "cloud", "infrastructure"],
        type: "course",
        difficulty: "beginner",
        featured: true,
        rating: 4.7
    },
    {
        title: "Git and GitHub Complete Guide",
        description: "Master version control with Git and collaboration workflows on GitHub.",
        url: "https://docs.github.com/en/get-started",
        category: "Tools & Technologies",
        tags: ["git", "github", "version control"],
        type: "documentation",
        difficulty: "beginner",
        featured: false,
        rating: 4.8
    },
    {
        title: "JavaScript Design Patterns",
        description: "Learn essential design patterns and best practices for writing clean JavaScript.",
        url: "https://addyosmani.com/resources/essentialjsdesignpatterns/book/",
        category: "Programming Languages",
        tags: ["javascript", "design patterns", "best practices"],
        type: "article",
        difficulty: "intermediate",
        featured: false,
        rating: 4.6
    },
    {
        title: "MongoDB University",
        description: "Free courses on MongoDB, aggregation pipeline, performance tuning, and more.",
        url: "https://university.mongodb.com",
        category: "Databases",
        tags: ["mongodb", "nosql", "databases"],
        type: "course",
        difficulty: "intermediate",
        featured: true,
        rating: 4.7
    },
    {
        title: "Cracking the Coding Interview",
        description: "The most popular book for technical interview preparation with 189 questions.",
        url: "http://www.crackingthecodinginterview.com",
        category: "Interview Preparation",
        tags: ["interview", "algorithms", "coding"],
        type: "article",
        difficulty: "intermediate",
        featured: true,
        rating: 4.9
    },
    {
        title: "Figma for Developers",
        description: "Learn UI/UX fundamentals and how to translate designs into code.",
        url: "https://www.figma.com/resources/learn-design/",
        category: "UI/UX Design",
        tags: ["figma", "ui design", "prototyping"],
        type: "documentation",
        difficulty: "beginner",
        featured: false,
        rating: 4.5
    }
];

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("✅ Connected to MongoDB");

        // Clear existing resources
        await Resource.deleteMany({});
        console.log("🗑️  Cleared existing resources");

        // Insert sample resources
        const inserted = await Resource.insertMany(sampleResources);
        console.log(`✨ Inserted ${inserted.length} sample resources`);

        console.log("\n📚 Sample Resources:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        inserted.forEach((resource, index) => {
            console.log(`${index + 1}. ${resource.title} (${resource.category})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed Error:", error);
        process.exit(1);
    }
};

seedResources();
