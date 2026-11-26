import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

await connectDB();
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
const existing = await User.findOne({ email });
if (existing) {
  existing.role = 'admin';
  existing.status = 'active';
  existing.password = password;
  await existing.save();
  console.log('Existing user promoted to admin:', email);
} else {
  await User.create({ name: 'Wizora Admin', email, password, role: 'admin' });
  console.log('Admin created:', email);
}
process.exit(0);
