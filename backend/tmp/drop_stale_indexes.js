import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cms_erp';

const dropIndexes = async () => {
  try {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'students' }).toArray();
    
    if (collections.length > 0) {
      const indexes = await db.collection('students').indexes();
      console.log('Current Indexes:', JSON.stringify(indexes, null, 2));
      
      const staleIndexes = ['userId_1', 'rollNumber_1']; // Add any other potentially stale unique indexes
      
      for (const indexName of staleIndexes) {
        if (indexes.find(i => i.name === indexName)) {
          await db.collection('students').dropIndex(indexName);
          console.log(`Dropped ${indexName} index`);
        }
      }
    } else {
      console.log('Collection "students" not found.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndexes();
