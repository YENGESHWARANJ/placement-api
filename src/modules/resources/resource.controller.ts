import { Request, Response } from "express";
import Resource from "./resource.model";
import { AuthRequest } from "../../middleware/auth.middleware";

// Get all resources with optional filtering
export const getResources = async (req: Request, res: Response) => {
    try {
        const { category, type, difficulty, search } = req.query;

        const filter: any = {};
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (difficulty) filter.difficulty = difficulty;
        if (search && typeof search === 'string' && search.trim() !== '') {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex characters
            const searchRegex = new RegExp(safeSearch, 'i');
            filter.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { tags: { $in: [searchRegex] } }
            ];
        }

        const resources = await Resource.find(filter)
            .sort({ featured: -1, createdAt: -1 });

        return res.json({ resources });
    } catch (error) {
        console.error("GET RESOURCES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch resources" });
    }
};

// Get featured resources
export const getFeaturedResources = async (req: Request, res: Response) => {
    try {
        const resources = await Resource.find({ featured: true })
            .sort({ rating: -1 })
            .limit(6);

        return res.json({ resources });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch featured resources" });
    }
};

// Get single resource
export const getResourceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        return res.json({ resource });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch resource" });
    }
};

// Create resource (Admin only)
export const createResource = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, url, category, tags, type, difficulty, featured, rating } = req.body;

        if (!title || !description || !url || !category) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const resource = await Resource.create({
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
    } catch (error) {
        console.error("CREATE RESOURCE ERROR:", error);
        return res.status(500).json({ message: "Failed to create resource" });
    }
};

// Update resource (Admin only)
export const updateResource = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const resource = await Resource.findByIdAndUpdate(id, updates, { new: true });

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        return res.json({
            message: "Resource updated successfully",
            resource
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update resource" });
    }
};

// Delete resource (Admin only)
export const deleteResource = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findByIdAndDelete(id);

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        return res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete resource" });
    }
};

// Get resource categories
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Resource.distinct("category") || [];
        return res.json({ categories });
    } catch (error) {
        console.error("GET CATEGORIES ERROR:", error);
        // Better to return empty than 500
        return res.json({ categories: [] });
    }
};
