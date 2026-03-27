// FILE: /tmp/check-db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = "mongodb+srv://harshkumar15132:zOfi0q72Fv92kCjF@wptkagn.mongodb.net/CMS?retryWrites=true&w=majority"; // From backend/src/config/db.ts or .env

async function check() {
    await mongoose.connect(MONGO_URI);
    const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));
    const count = await Attendance.countDocuments();
    const records = await Attendance.find().limit(5).sort({ date: -1 });
    console.log(`TOTAL RECORDS: ${count}`);
    console.log("SAMPLES:", JSON.stringify(records, null, 2));
    process.exit();
}
check();
