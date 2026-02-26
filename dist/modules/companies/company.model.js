"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CompanySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    industry: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        trim: true
    },
    logo: {
        type: String, // URL
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    recruiterIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        }]
}, {
    timestamps: true
});
const Company = mongoose_1.models.Company || (0, mongoose_1.model)("Company", CompanySchema);
exports.default = Company;
