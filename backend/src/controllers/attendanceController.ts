import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// ─── Helper ────────────────────────────────────────────────────────────────
// Returns attendance % for a student across all records provided
function calcPercent(total: number, present: number): number {
  if (total === 0) return 100;
  return Math.round((present / total) * 100);
}

// ─── Mark Attendance (bulk, for a whole batch in one request) ─────────────
// POST /api/attendance/mark
// Body: { batchId, subjectId, facultyId, collegeId, date, records: [{studentId, status}] }
export const markAttendance = async (req: any, res: any) => {
  try {
    const { batchId, subjectId, facultyId, collegeId, date, records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No attendance records provided' });
    }

    const effectiveCollegeId = collegeId || req.user?.collegeId;

    // Upsert each record (allow re-marking the same day)
    const ops = records.map((r: { studentId: string; status: string }) =>
      Attendance.findOneAndUpdate(
        { studentId: r.studentId, subjectId, date: new Date(date) },
        {
          studentId: r.studentId,
          subjectId,
          batchId,
          collegeId: effectiveCollegeId,
          facultyId,
          date: new Date(date),
          status: r.status,
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(ops);
    res.status(201).json({ message: `Attendance marked for ${records.length} students` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get attendance for a batch on a date ─────────────────────────────────
// GET /api/attendance?batchId=&subjectId=&date=
export const getAttendanceByBatch = async (req: any, res: any) => {
  try {
    const { batchId, subjectId, date } = req.query;
    const query: any = {};
    if (batchId) query.batchId = batchId;
    if (subjectId) query.subjectId = subjectId;
    if (date) query.date = new Date(date as string);

    const records = await Attendance.find(query)
      .populate('studentId', 'rollNumber userId')
      .populate('subjectId', 'name');
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get per-student attendance summary ──────────────────────────────────
// GET /api/attendance/student/:studentId?subjectId=
export const getStudentAttendance = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    const query: any = { studentId };
    if (req.query.subjectId) query.subjectId = req.query.subjectId;

    const records = await Attendance.find(query).populate('subjectId', 'name');
    const total = records.length;
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const percentage = calcPercent(total, present);

    res.json({ records, summary: { total, present, absent: total - present, percentage } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── AI Shortage Prediction ────────────────────────────────────────────────
// GET /api/attendance/shortage-alerts?batchId=&collegeId=&threshold=75
// Returns students at risk of falling below the threshold
export const getShortageAlerts = async (req: any, res: any) => {
  try {
    const { batchId, collegeId } = req.query;
    const threshold = parseInt(req.query.threshold as string || '75', 10);
    const effectiveCollegeId = collegeId || req.user?.collegeId;

    const query: any = {};
    if (batchId) query.batchId = batchId;
    if (effectiveCollegeId) query.collegeId = effectiveCollegeId;

    // Aggregate attendance per student per subject
    const pipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: { studentId: '$studentId', subjectId: '$subjectId' },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $eq: ['$total', 0] },
              100,
              { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
            ]
          }
        }
      },
      { $match: { percentage: { $lt: threshold } } },
      {
        $lookup: {
          from: 'students',
          localField: '_id.studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id.subjectId',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: { path: '$student', preserveNullAndEmpty: true } },
      { $unwind: { path: '$subject', preserveNullAndEmpty: true } },
      {
        $project: {
          studentId: '$_id.studentId',
          subjectId: '$_id.subjectId',
          rollNumber: '$student.rollNumber',
          subjectName: '$subject.name',
          total: 1,
          present: 1,
          percentage: { $round: ['$percentage', 1] },
          // AI: classes needed to regain threshold
          classesNeededToRecover: {
            $ceil: {
              $divide: [
                { $subtract: [{ $multiply: [{ $add: ['$total', 10] }, threshold / 100] }, '$present'] },
                1
              ]
            }
          },
          riskLevel: {
            $switch: {
              branches: [
                { case: { $lt: ['$percentage', 50] }, then: 'critical' },
                { case: { $lt: ['$percentage', 65] }, then: 'high' },
              ],
              default: 'medium'
            }
          }
        }
      },
      { $sort: { percentage: 1 } }
    ];

    const alerts = await Attendance.aggregate(pipeline);
    res.json({ threshold, alerts, count: alerts.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
