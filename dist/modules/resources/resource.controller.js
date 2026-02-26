"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.deleteResource = exports.updateResource = exports.createResource = exports.getResourceById = exports.getFeaturedResources = exports.getResources = void 0;
const resource_model_1 = __importDefault(require("./resource.model"));
// Get all resources with optional filtering
const getResources = async (req, res) => {
    try {
        const { category, type, difficulty, search } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (type)
            filter.type = type;
        if (difficulty)
            filter.difficulty = difficulty;
        if (search && typeof search === 'string' && search.trim() !== '') {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex characters
            const searchRegex = new RegExp(safeSearch, 'i');
            filter.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { tags: { $in: [searchRegex] } }
            ];
        }
        const resources = await resource_model_1.default.find(filter)
            .sort({ featured: -1, createdAt: -1 });
        return res.json({ resources });
    }
    catch (error) {
        console.error("GET RESOURCES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch resources" });
    }
};
exports.getResources = getResources;
// Get featured resources
const getFeaturedResources = async (req, res) => {
    try {
        const resources = await resource_model_1.default.find({ featured: true })
            .sort({ rating: -1 })
            .limit(6);
        return res.json({ resources });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch featured resources" });
    }
};
exports.getFeaturedResources = getFeaturedResources;
// Get single resource
const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await resource_model_1.default.findById(id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        return res.json({ resource });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch resource" });
    }
};
exports.getResourceById = getResourceById;
// Create resource (Admin only)
const createResource = async (req, res) => {
    try {
        const { title, description, url, category, tags, type, difficulty, featured, rating } = req.body;
        if (!title || !description || !url || !category) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const resource = await resource_model_1.default.create({
            title,
            description,
            url,
            category,
            tags: tags || [],
            type: type || "article",
            difficulty: difficulty || "beginner",
            featured: featured || false,
            rating: rating || 4.5
        });
        return res.status(201).json({
            message: "Resource created successfully",
            resource
        });
    }
    catch (error) {
        console.error("CREATE RESOURCE ERROR:", error);
        return res.status(500).json({ message: "Failed to create resource" });
    }
};
exports.createResource = createResource;
// Update resource (Admin only)
const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const resource = await resource_model_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        return res.json({
            message: "Resource updated successfully",
            resource
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update resource" });
    }
};
exports.updateResource = updateResource;
// Delete resource (Admin only)
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await resource_model_1.default.findByIdAndDelete(id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        return res.json({ message: "Resource deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete resource" });
    }
};
exports.deleteResource = deleteResource;
// Get resource categories
const getCategories = async (req, res) => {
    try {
        const categories = await resource_model_1.default.distinct("category") || [];
        return res.json({ categories });
    }
    catch (error) {
        console.error("GET CATEGORIES ERROR:", error);
        // Better to return empty than 500
        return res.json({ categories: [] });
    }
};
exports.getCategories = getCategories;
