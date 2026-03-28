"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { useExams } from "@/hooks/useExams";

interface ExamFormProps {
  collegeId: string;
  onSuccess?: () => void;
  initialData?: any;
}

const ExamForm: React.FC<ExamFormProps> = ({ collegeId, onSuccess, initialData }) => {
  const { createExam, loading, error: apiError } = useExams(collegeId);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
    examType: initialData?.examType || "INTERNAL",
    scheduleDate: initialData?.scheduleDate ? new Date(initialData.scheduleDate).toISOString().split('T')[0] : "",
    duration: initialData?.duration || 120,
    courses: initialData?.courses || [],
    subjects: initialData?.subjects || [],
    totalMarks: initialData?.totalMarks || 100,
    passingMarks: initialData?.passingMarks || 40,
    gradingScheme: initialData?.gradingScheme || [
      { grade: "A+", minMarks: 90, maxMarks: 100, gradePoint: 4.0 },
      { grade: "A", minMarks: 80, maxMarks: 89, gradePoint: 3.7 },
      { grade: "B+", minMarks: 70, maxMarks: 79, gradePoint: 3.3 },
      { grade: "B", minMarks: 60, maxMarks: 69, gradePoint: 3.0 },
      { grade: "C", minMarks: 50, maxMarks: 59, gradePoint: 2.5 },
      { grade: "D", minMarks: 40, maxMarks: 49, gradePoint: 2.0 },
      { grade: "F", minMarks: 0, maxMarks: 39, gradePoint: 0.0 }
    ],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradingChange = (index: number, field: string, value: string | number) => {
    const newScheme = [...formData.gradingScheme];
    newScheme[index] = { ...newScheme[index], [field]: Number(value) || value };
    setFormData((prev) => ({ ...prev, gradingScheme: newScheme }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        ...formData,
        collegeId,
        courses: Array.isArray(formData.courses) ? formData.courses : [formData.courses],
        subjects: Array.isArray(formData.subjects) ? formData.subjects : [formData.subjects],
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingMarks: Number(formData.passingMarks),
        scheduleDate: new Date(formData.scheduleDate).toISOString()
      };

      await createExam(payload);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-surface-on-surface mb-6">
        {initialData ? "Edit Exam" : "Create New Exam"}
      </h2>

      {(error || apiError) && (
        <div className="bg-error-container text-error p-4 rounded-lg mb-6 border border-error">
          {error || apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Exam Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., MID_SEM_2024"
              className="w-full bg-surface-container placeholder-surface-on-surface-variant/50 text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Exam Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Midterm Examination"
              className="w-full bg-surface-container placeholder-surface-on-surface-variant/50 text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Type</label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              className="w-full bg-surface-container text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="INTERNAL">INTERNAL</option>
              <option value="EXTERNAL">EXTERNAL</option>
              <option value="PRACTICAL">PRACTICAL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Schedule Date</label>
            <input
              type="date"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleChange}
              className="w-full bg-surface-container text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Duration (min)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-surface-container text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Total Marks</label>
            <input
              type="number"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleChange}
              className="w-full bg-surface-container text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-on-surface-variant mb-1">Passing Marks</label>
            <input
              type="number"
              name="passingMarks"
              value={formData.passingMarks}
              onChange={handleChange}
              className="w-full bg-surface-container text-surface-on-surface p-3 rounded-xl border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Grading Scheme */}
        <div>
          <h3 className="text-lg font-semibold text-surface-on-surface mb-3">Grading Scheme</h3>
          <div className="overflow-x-auto border border-outline rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high text-surface-on-surface-variant uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Min Marks</th>
                  <th className="px-4 py-3">Max Marks</th>
                  <th className="px-4 py-3">GP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {formData.gradingScheme.map((item, index) => (
                  <tr key={item.grade}>
                    <td className="px-4 py-3 font-medium text-surface-on-surface">{item.grade}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.minMarks}
                        onChange={(e) => handleGradingChange(index, "minMarks", e.target.value)}
                        className="w-20 bg-surface-container-low text-surface-on-surface p-2 rounded-lg border border-outline"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.maxMarks}
                        onChange={(e) => handleGradingChange(index, "maxMarks", e.target.value)}
                        className="w-20 bg-surface-container-low text-surface-on-surface p-2 rounded-lg border border-outline"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.1"
                        value={item.gradePoint}
                        onChange={(e) => handleGradingChange(index, "gradePoint", e.target.value)}
                        className="w-20 bg-surface-container-low text-surface-on-surface p-2 rounded-lg border border-outline"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses & Subjects (Placeholder for multi-select) */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
           <p className="text-sm text-surface-on-surface-variant flex items-center gap-2">
             <span className="w-2 h-2 bg-primary rounded-full"></span>
             Relational linking (Courses/Subjects) will use the standard selector pattern from the Academics module.
           </p>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-xl border border-outline text-surface-on-surface font-medium hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-primary-on-primary rounded-xl font-medium shadow-ambient hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default ExamForm;
