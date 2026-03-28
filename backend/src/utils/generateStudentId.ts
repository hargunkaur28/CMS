import Student from "../models/Student.js";

/**
 * Generates a unique student ID in the format: NGM-YYYY-0001
 * @returns {Promise<string>} The generated student ID
 */
export const generateStudentId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `NGM-${currentYear}`;

  // Find the last student with this year's prefix
  const lastStudent = await Student.findOne({
    studentId: new RegExp(`^${yearPrefix}`),
  })
    .sort({ studentId: -1 })
    .exec();

  let nextNumber = 1;
  if (lastStudent && lastStudent.studentId) {
    const lastNumberStr = lastStudent.studentId.split("-").pop();
    if (lastNumberStr) {
      nextNumber = parseInt(lastNumberStr, 10) + 1;
    }
  }

  // Format the number to be 4 digits with leading zeros
  const formattedNumber = nextNumber.toString().padStart(4, "0");
  return `${yearPrefix}-${formattedNumber}`;
};
