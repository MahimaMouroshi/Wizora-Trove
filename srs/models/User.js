import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true, maxlength: 30 },
  university: { type: String, trim: true, maxlength: 100 },
  avatarUrl: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  dateOfBirth: Date,
  membership: {
    plan: { type: String, enum: ['3_month', '6_month', '12_month'] },
    startsAt: Date,
    expiresAt: Date,
    idCardNumber: String,
    securityDeposit: { type: Number, default: 0 },
    securityStatus: { type: String, enum: ['none', 'held', 'partially_used', 'refunded'], default: 'none' },
    paymentStatus: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' }
  },
  reading: {
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastReadDate: Date,
    totalMinutes: { type: Number, default: 0 },
    readBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
  },
  alreadyRead: [{ type: String, trim: true, maxlength: 150 }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
