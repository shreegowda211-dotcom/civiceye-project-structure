import mongoose from 'mongoose';
import connectToDB from '../db.js';
import Complaint from '../model/complaintSchema.js';

const categoryMap = {
  'Garbage Issue': 'Garbage',
  'Streetlight Issue': 'Streetlight',
  'Water Leakage issue': 'Water Leakage',
  'Electricity Problem': 'Other',
};

const migrateCategories = async () => {
  try {
    await connectToDB();
    console.log('🔍 Starting category migration...');

    for (const [oldCategory, newCategory] of Object.entries(categoryMap)) {
      const result = await Complaint.updateMany(
        { category: oldCategory },
        { category: newCategory }
      );
      console.log(`✅ Updated ${result.modifiedCount} complaints: "${oldCategory}" → "${newCategory}"`);
    }

    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateCategories();
