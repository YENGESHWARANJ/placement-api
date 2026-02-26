"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getCompanies = void 0;
const company_model_1 = __importDefault(require("./company.model"));
const getCompanies = async (req, res) => {
    try {
        const companies = await company_model_1.default.find().sort({ name: 1 });
        return res.json({ companies });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch companies" });
    }
};
exports.getCompanies = getCompanies;
const createCompany = async (req, res) => {
    try {
        const company = await company_model_1.default.create(req.body);
        return res.status(201).json({ message: "Company created successfully", company });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Company already exists" });
        }
        return res.status(500).json({ message: "Failed to create company" });
    }
};
exports.createCompany = createCompany;
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await company_model_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!company)
            return res.status(404).json({ message: "Company not found" });
        return res.json({ message: "Company updated", company });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update company" });
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        await company_model_1.default.findByIdAndDelete(id);
        return res.json({ message: "Company removed" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete company" });
    }
};
exports.deleteCompany = deleteCompany;
