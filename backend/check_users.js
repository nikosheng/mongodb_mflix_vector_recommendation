const mongoose = require('mongoose');
require('dotenv').config();

const FlexibleSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const UserRaw = mongoose.model('UserRaw', FlexibleSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await UserRaw.findOne({});
    if (user) {
        console.log('Found a user:');
        console.log(JSON.stringify(user, null, 2));
    } else {
        console.log('No users found in "users" collection.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();