import mongoose from 'mongoose';

const escalationRuleSchema = new mongoose.Schema({
  level: { type: Number, required: true },
  thresholdHours: { type: Number, required: true },
  action: { type: String, default: 'Notify' },
});

const priorityLevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  responseHours: { type: Number, required: true },
});

const notificationConfigSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: false },
  push: { type: Boolean, default: true },
});

const securityConfigSchema = new mongoose.Schema({
  mfaEnabled: { type: Boolean, default: false },
  passwordMinLength: { type: Number, default: 8 },
  passwordRequiresNumbers: { type: Boolean, default: true },
  passwordRequiresSpecial: { type: Boolean, default: true },
});

const settingsSchema = new mongoose.Schema(
  {
    slaHours: { type: Number, default: 48 },
    autoEscalationEnabled: { type: Boolean, default: true },
    escalationRules: { type: [escalationRuleSchema], default: [{ level: 1, thresholdHours: 24, action: 'Email admin' }] },
    priorityLevels: { type: [priorityLevelSchema], default: [
      { name: 'Low', responseHours: 72 },
      { name: 'Medium', responseHours: 48 },
      { name: 'High', responseHours: 24 },
      { name: 'Critical', responseHours: 12 },
    ] },
    securitySettings: { type: securityConfigSchema, default: () => ({}) },
    notificationSettings: { type: notificationConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
