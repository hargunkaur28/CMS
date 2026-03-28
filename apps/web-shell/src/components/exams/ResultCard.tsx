"use client";

import React from "react";
import Card from "@/components/ui/Card";

interface ResultCardProps {
  result: any;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS": return "bg-success-container text-success border-success";
      case "FAIL": return "bg-error-container text-error border-error";
      default: return "bg-surface-container text-surface-on-surface-variant";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-surface-on-surface">{result.examId.name}</h3>
          <p className="text-sm text-surface-on-surface-variant font-medium">Session: 2024-25</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(result.status)}`}>
          {result.status}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs text-surface-on-surface-variant mb-1 uppercase font-bold tracking-wider">Obtained Marks</p>
          <p className="text-2xl font-bold text-surface-on-surface">{result.totalMarksObtained}</p>
        </div>
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs text-surface-on-surface-variant mb-1 uppercase font-bold tracking-wider">Max Marks</p>
          <p className="text-2xl font-bold text-surface-on-surface">{result.totalMaxMarks}</p>
        </div>
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs text-surface-on-surface-variant mb-1 uppercase font-bold tracking-wider">Percentage</p>
          <p className="text-2xl font-bold text-primary">{result.percentage.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs text-surface-on-surface-variant mb-1 uppercase font-bold tracking-wider">CGPA</p>
          <p className="text-2xl font-bold text-secondary-container-on-secondary-container">{result.cgpa.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-outline-variant rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-surface-container text-xs text-surface-on-surface-variant font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3 text-center">Marks</th>
              <th className="px-6 py-3 text-center">Grade</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
            {result.subjects.map((subject: any) => (
              <tr key={subject.subjectId} className="hover:bg-surface-container-low transition-all">
                <td className="px-6 py-4">
                  <p className="font-bold text-surface-on-surface">{subject.subjectName}</p>
                  <p className="text-xs text-surface-on-surface-variant">Code: {subject.subjectId.code || "SUB-001"}</p>
                </td>
                <td className="px-6 py-4 text-center font-bold text-surface-on-surface">
                  {subject.marks} / {subject.maxMarks}
                </td>
                <td className="px-6 py-4 text-center font-black text-primary">
                  {subject.grade}
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(subject.status)}`}>
                        {subject.status}
                    </span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ResultCard;
