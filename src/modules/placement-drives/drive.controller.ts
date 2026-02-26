import { Request, Response } from "express";
import PlacementDrive from "./drive.model";

export const createDrive = async (req: Request, res: Response) => {
    try {
        const drive = await PlacementDrive.create(req.body);
        return res.status(201).json({ drive });
    } catch (error) {
        console.error("CREATE DRIVE ERROR:", error);
        return res.status(500).json({ message: "Failed to create drive" });
    }
};

export const getAllDrives = async (req: Request, res: Response) => {
    try {
        const drives = await PlacementDrive.find().sort({ date: 1 });
        return res.json({ drives });
    } catch (error) {
        console.error("GET DRIVES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch drives" });
    }
};

export const deleteDrive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await PlacementDrive.findByIdAndDelete(id);
        return res.json({ message: "Drive deleted successfully" });
    } catch (error) {
        console.error("DELETE DRIVE ERROR:", error);
        return res.status(500).json({ message: "Failed to delete drive" });
    }
};

export const updateDrive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const drive = await PlacementDrive.findByIdAndUpdate(id, req.body, { new: true });
        return res.json({ drive });
    } catch (error) {
        console.error("UPDATE DRIVE ERROR:", error);
        return res.status(500).json({ message: "Failed to update drive" });
    }
};
