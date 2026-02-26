"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDrive = exports.deleteDrive = exports.getAllDrives = exports.createDrive = void 0;
const drive_model_1 = __importDefault(require("./drive.model"));
const createDrive = async (req, res) => {
    try {
        const drive = await drive_model_1.default.create(req.body);
        return res.status(201).json({ drive });
    }
    catch (error) {
        console.error("CREATE DRIVE ERROR:", error);
        return res.status(500).json({ message: "Failed to create drive" });
    }
};
exports.createDrive = createDrive;
const getAllDrives = async (req, res) => {
    try {
        const drives = await drive_model_1.default.find().sort({ date: 1 });
        return res.json({ drives });
    }
    catch (error) {
        console.error("GET DRIVES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch drives" });
    }
};
exports.getAllDrives = getAllDrives;
const deleteDrive = async (req, res) => {
    try {
        const { id } = req.params;
        await drive_model_1.default.findByIdAndDelete(id);
        return res.json({ message: "Drive deleted successfully" });
    }
    catch (error) {
        console.error("DELETE DRIVE ERROR:", error);
        return res.status(500).json({ message: "Failed to delete drive" });
    }
};
exports.deleteDrive = deleteDrive;
const updateDrive = async (req, res) => {
    try {
        const { id } = req.params;
        const drive = await drive_model_1.default.findByIdAndUpdate(id, req.body, { new: true });
        return res.json({ drive });
    }
    catch (error) {
        console.error("UPDATE DRIVE ERROR:", error);
        return res.status(500).json({ message: "Failed to update drive" });
    }
};
exports.updateDrive = updateDrive;
