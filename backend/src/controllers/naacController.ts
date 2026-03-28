import { Request, Response } from "express";
import NaacDocument from "../models/NaacDocument.js";

export const getNaacDocuments = async (req: Request, res: Response) => {
  try {
    const { criterion, year } = req.query;
    let query: any = {};
    if (criterion) query.criterion = Number(criterion);
    if (year) query.academicYear = year;

    const documents = await NaacDocument.find(query)
      .populate("uploadedBy", "name")
      .sort({ criterion: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadNaacDocument = async (req: Request, res: Response) => {
  try {
    const { title, criterion, academicYear, description, fileUrl } = req.body;
    
    // In a real scenario, fileUrl would come from Cloudinary middleware
    const document = new NaacDocument({
      title,
      criterion,
      academicYear,
      description,
      fileUrl,
      uploadedBy: (req as any).user?._id,
      status: "DRAFT"
    });

    await document.save();
    res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // DRAFT, REVIEW, APPROVED
    const document = await NaacDocument.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, data: document });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getComplianceStats = async (req: Request, res: Response) => {
  try {
    const stats = await NaacDocument.aggregate([
      { $group: { _id: "$criterion", count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
