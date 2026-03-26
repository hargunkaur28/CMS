import Student from '../models/Student.js';
import College from '../models/College.js';

/**
 * Generates a unique Student ID.
 * Format: [PREFIX]-[YEAR]-[SEQUENCE]
 * Example: GIT-2024-0001
 */
export const generateStudentId = async (collegeId: string): Promise<string> => {
  const college = await College.findById(collegeId);
  if (!college) throw new Error('College not found');

  const prefix = college.name.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString();
  
  // Find the last student enrolled in this college this year
  const lastStudent = await Student.findOne({ 
    collegeId, 
    rollNumber: new RegExp(`^${prefix}-${year}-`) 
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastStudent) {
    const parts = lastStudent.rollNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1] || '0', 10);
    sequence = lastSeq + 1;
  }

  const sequenceStr = sequence.toString().padStart(4, '0');
  return `${prefix}-${year}-${sequenceStr}`;
};
