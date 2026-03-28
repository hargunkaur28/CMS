import { z } from "zod";

export const createExam = z.object({
  body: z.object({
    collegeId: z.string(),
    code: z.string().regex(/^[A-Z0-9_]+$/),
    name: z.string().min(5).max(100),
    examType: z.enum(['INTERNAL', 'EXTERNAL', 'PRACTICAL']),
    scheduleDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    duration: z.number().int().min(30),
    courses: z.array(z.string()).min(1),
    subjects: z.array(z.string()).min(1),
    totalMarks: z.number().int().min(1),
    passingMarks: z.number().int(),
    gradingScheme: z.array(z.object({
      grade: z.enum(['A+', 'A', 'B+', 'B', 'C', 'D', 'F']),
      minMarks: z.number(),
      maxMarks: z.number(),
      gradePoint: z.number()
    }))
  })
    .refine(data => data.passingMarks < data.totalMarks, {
      message: "Passing marks must be less than total marks",
      path: ["passingMarks"]
    })
    .refine(data => {
      // Validate grading scheme is continuous
      const sorted = [...data.gradingScheme].sort((a, b) => a.minMarks - b.minMarks);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].maxMarks + 1 !== sorted[i + 1].minMarks) return false;
      }
      return true;
    }, {
      message: "Grading scheme must be continuous and have no gaps",
      path: ["gradingScheme"]
    })
});

export const enterMarks = z.object({
  body: z.object({
    studentId: z.string(),
    subjectId: z.string(),
    courseId: z.string(),
    batchId: z.string(),
    components: z.array(z.object({
      name: z.string(),
      maxMarks: z.number(),
      obtainedMarks: z.number(),
      weight: z.number().optional()
    })),
  })
});

export const bulkImportMarks = z.object({
  body: z.object({
    records: z.array(z.object({
      studentId: z.string(),
      subjectId: z.string(),
      components: z.array(z.object({
        name: z.string(),
        maxMarks: z.number(),
        obtainedMarks: z.number(),
        weight: z.number().optional()
      })),
    }))
  })
});

export const publishResults = z.object({
  params: z.object({
    examId: z.string(),
  })
});
