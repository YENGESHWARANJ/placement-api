import { Request, Response } from "express";
import Company from "./company.model";

export const getCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await Company.find().sort({ name: 1 });
        return res.json({ companies });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch companies" });
    }
};

export const createCompany = async (req: Request, res: Response) => {
    try {
        const company = await Company.create(req.body);
        return res.status(201).json({ message: "Company created successfully", company });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Company already exists" });
        }
        return res.status(500).json({ message: "Failed to create company" });
    }
};

export const updateCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const company = await Company.findByIdAndUpdate(id, req.body, { new: true });
        if (!company) return res.status(404).json({ message: "Company not found" });
        return res.json({ message: "Company updated", company });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update company" });
    }
};

export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Company.findByIdAndDelete(id);
        return res.json({ message: "Company removed" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete company" });
    }
};
