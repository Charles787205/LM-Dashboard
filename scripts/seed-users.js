const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// For CommonJS, we need to handle ES modules differently
async function loadModules() {
  // Since we're using ES modules in the project, we need to create a connection manually
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  
  await mongoose.connect(MONGODB_URI);
  
  // Define User schema directly here since importing ES modules is complex in CommonJS
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, required: false },
    image: { type: String, required: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    position: { type: String, required: false },
    phone: { type: String, required: false },
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: false },
    hubName: { type: String, required: false },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    employeeId: { type: String, required: false, unique: true, sparse: true },
    joinDate: { type: Date, default: Date.now },
    totalDeliveries: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { timestamps: true });
  
  return mongoose.models.User || mongoose.model('User', UserSchema);
}

const sampleUsers = [
  {
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@inttracker.com',
    phone: '+1 (555) 123-4567',
    role: 'driver',
    position: 'Senior Delivery Driver',
    hubName: 'Downtown Hub',
    status: 'active',
    employeeId: 'EMP001',
    totalDeliveries: 156,
    successfulDeliveries: 148,
    rating: 4.8,
    joinDate: new Date('2024-01-15'),
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@inttracker.com',
    phone: '+1 (555) 234-5678',
    role: 'manager',
    position: 'Hub Manager',
    hubName: 'North Hub',
    status: 'active',
    employeeId: 'EMP002',
    totalDeliveries: 0,
    successfulDeliveries: 0,
    rating: 4.9,
    joinDate: new Date('2023-08-22'),
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@inttracker.com',
    phone: '+1 (555) 345-6789',
    role: 'driver',
    position: 'Delivery Driver',
    hubName: 'South Hub',
    status: 'active',
    employeeId: 'EMP003',
    totalDeliveries: 203,
    successfulDeliveries: 187,
    rating: 4.6,
    joinDate: new Date('2024-03-10'),
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@inttracker.com',
    phone: '+1 (555) 456-7890',
    role: 'dispatcher',
    position: 'Fleet Dispatcher',
    hubName: 'East Hub',
    status: 'active',
    employeeId: 'EMP004',
    totalDeliveries: 0,
    successfulDeliveries: 0,
    rating: 4.7,
    joinDate: new Date('2023-12-05'),
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@inttracker.com',
    phone: '+1 (555) 567-8901',
    role: 'driver',
    position: 'Delivery Driver',
    hubName: 'West Hub',
    status: 'active',
    employeeId: 'EMP005',
    totalDeliveries: 178,
    successfulDeliveries: 162,
    rating: 4.5,
    joinDate: new Date('2024-02-18'),
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa.thompson@inttracker.com',
    phone: '+1 (555) 678-9012',
    role: 'manager',
    position: 'Operations Manager',
    hubName: 'Central Hub',
    status: 'active',
    employeeId: 'EMP006',
    totalDeliveries: 0,
    successfulDeliveries: 0,
    rating: 4.8,
    joinDate: new Date('2023-11-10'),
  },
  {
    name: 'Carlos Martinez',
    email: 'carlos.martinez@inttracker.com',
    phone: '+1 (555) 789-0123',
    role: 'driver',
    position: 'Delivery Driver',
    hubName: 'Downtown Hub',
    status: 'inactive',
    employeeId: 'EMP007',
    totalDeliveries: 89,
    successfulDeliveries: 82,
    rating: 4.3,
    joinDate: new Date('2024-01-05'),
  }
];

async function seedUsers() {
  try {
    console.log('Loading modules and connecting to database...');
    const User = await loadModules();

    console.log('Clearing existing users...');
    // Only clear users that are not OAuth users (have employeeId)
    await User.deleteMany({ employeeId: { $exists: true } });

    console.log('Inserting sample users...');
    const insertedUsers = await User.insertMany(sampleUsers);

    console.log(`Successfully inserted ${insertedUsers.length} users:`);
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('User seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedUsers();
