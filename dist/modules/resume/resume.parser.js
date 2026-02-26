"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResumeText = parseResumeText;
const resume_types_1 = require("./resume.types");
function parseResumeText(text, isOCR) {
    const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
    const lowerText = text.toLowerCase();
    // 1. EXTRACT EMAILS
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex) || [];
    const email = emails.length > 0 ? emails[0] : null;
    // 2. EXTRACT PHONE
    // Matches: +1-555-555-5555, (555) 555-5555, 555 555 5555, etc.
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex) || [];
    // Filter out unlikely matches (too short or just years)
    const validPhones = phones.filter(p => p.replace(/\D/g, '').length >= 10);
    const phone = validPhones.length > 0 ? validPhones[0] : null;
    // 3. EXTRACT NAME (Heuristic)
    // Look for the first line that is not an email/phone/header
    let name = null;
    const badNameKeywords = ["resume", "curriculum", "vitae", "cv", "profile", "summary", "contact", "education", "experience", "skills"];
    for (const line of lines) {
        if (line.split(' ').length > 5)
            continue; // Too long for a name
        if (badNameKeywords.some(kw => line.toLowerCase().includes(kw)))
            continue; // Skip headers
        if (line.includes("@") || /\d/.test(line))
            continue; // Skip email/phone lines
        // Check if it looks capitalized (heuristic)
        // If we haven't found a name yet, take this one
        name = line;
        break;
    }
    // 4. EXTRACT SKILLS
    const foundSkills = new Set();
    resume_types_1.SKILLS_LIST.forEach(skill => {
        // Check for exact word match to avoid substrings (e.g. "Go" in "Good")
        // Escape special regex chars in skill name (like C++)
        const createRegex = (s) => new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (createRegex(skill).test(text)) {
            foundSkills.add(skill);
        }
    });
    // 5. EXTRACT EDUCATION & EXPERIENCE SECTIONS (Simple Block Extraction)
    const education = [];
    const experience = [];
    let currentSection = null;
    const eduKeywords = ["education", "academic", "qualification", "university", "college", "degree"];
    const expKeywords = ["experience", "employment", "work history", "job", "career"];
    const otherKeywords = ["skills", "projects", "languages", "hobbies", "references", "certification", "summary", "objective"];
    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        // Detect Section Headers
        const isEduHeader = eduKeywords.some(k => lowerLine.includes(k) && line.length < 40);
        const isExpHeader = expKeywords.some(k => lowerLine.includes(k) && line.length < 40);
        const isOtherHeader = otherKeywords.some(k => lowerLine.includes(k) && line.length < 40);
        if (isEduHeader) {
            currentSection = "education";
            continue;
        }
        if (isExpHeader) {
            currentSection = "experience";
            continue;
        }
        if (isOtherHeader) {
            currentSection = null;
            continue;
        }
        if (currentSection === "education") {
            education.push(line);
        }
        else if (currentSection === "experience") {
            experience.push(line);
        }
    }
    // Limit section output for cleanliness
    const cleanEdu = education.slice(0, 5); // Top 5 lines
    const cleanExp = experience.slice(0, 10); // Top 10 lines
    return {
        name: name ? name.substring(0, 50) : "Candidate",
        email: email || null,
        phone: phone || null,
        skills: Array.from(foundSkills),
        education: cleanEdu,
        experience: cleanExp,
        rawText: text.substring(0, 2000), // Preview
        isOCR
    };
}
