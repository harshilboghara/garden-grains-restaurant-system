const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/GardenGrains1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('feedbacks');
    
    console.log('Fetching indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    console.log('Dropping all indexes (except _id)...');
    try {
      await collection.dropIndexes();
      console.log('All indexes dropped successfully');
    } catch (dropError) {
      console.error('Error dropping indexes:', dropError.message);
    }

    console.log('The indexes will be recreated correctly when the server restarts.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixIndexes();
