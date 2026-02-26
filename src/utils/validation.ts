import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "recruiter", "admin"]).optional(),
    captchaToken: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    captchaToken: z.string().optional(),
});

export const verifyOTPSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

