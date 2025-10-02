// Mock data for all roles and portal content

// User database by role
const users = [
  {
    id: 1,
    email: 'leader@fpt.edu.vn',
    password: 'leader',
    role: 'leader',
    name: 'Leader User',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 2,
    email: 'lecturer@fpt.edu.vn',
    password: 'lecturer',
    role: 'lecturer',
    name: 'Lecturer User',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 3,
    email: 'admin@fpt.edu.vn',
    password: 'admin',
    role: 'admin',
    name: 'Admin User',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 4,
    email: 'academic@fpt.edu.vn',
    password: 'academic',
    role: 'academic',
    name: 'Academic Affairs',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 5,
    email: 'member@fpt.edu.vn',
    password: 'member',
    role: 'member',
    name: 'Member User',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  // Additional students for group management testing
  {
    id: 6,
    email: 'student1@fpt.edu.vn',
    password: 'student1',
    role: 'student',
    name: 'Nguyen Van A',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 7,
    email: 'student2@fpt.edu.vn',
    password: 'student2',
    role: 'student',
    name: 'Tran Thi B',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 8,
    email: 'student3@fpt.edu.vn',
    password: 'student3',
    role: 'student',
    name: 'Le Van C',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 9,
    email: 'student4@fpt.edu.vn',
    password: 'student4',
    role: 'student',
    name: 'Pham Thi D',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 10,
    email: 'student5@fpt.edu.vn',
    password: 'student5',
    role: 'student',
    name: 'Hoang Van E',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 11,
    email: 'student6@fpt.edu.vn',
    password: 'student6',
    role: 'student',
    name: 'Vu Thi F',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 12,
    email: 'student7@fpt.edu.vn',
    password: 'student7',
    role: 'student',
    name: 'Do Van G',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 13,
    email: 'student8@fpt.edu.vn',
    password: 'student8',
    role: 'student',
    name: 'Bui Thi H',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 14,
    email: 'student9@fpt.edu.vn',
    password: 'student9',
    role: 'student',
    name: 'Ngo Van I',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 15,
    email: 'student10@fpt.edu.vn',
    password: 'student10',
    role: 'student',
    name: 'Ly Thi J',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  // Mock members who haven't joined any group
  {
    id: 16,
    email: 'member1@fpt.edu.vn',
    password: 'member1',
    role: 'member',
    name: 'Member One',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 17,
    email: 'member2@fpt.edu.vn',
    password: 'member2',
    role: 'member',
    name: 'Member Two',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
  {
    id: 18,
    email: 'member3@fpt.edu.vn',
    password: 'member3',
    role: 'member',
    name: 'Member Three',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2024-05-01',
  },
];

// Mock login function
export async function mockLogin(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  return user;
}

// Mock group data
export const mockGroups = [
  {
    id: 1,
    name: 'Group 1',
    leader: 'leader@fpt.edu.vn',
    members: ['member@fpt.edu.vn'],
    lecturer: 'lecturer@fpt.edu.vn',
  },
  {
    id: 2,
    name: 'IoT Project Team',
    leader: 'leader@fpt.edu.vn',
    members: ['member@fpt.edu.vn'],
    lecturer: 'lecturer@fpt.edu.vn',
  },
  {
    id: 3,
    name: 'Advanced Robotics',
    leader: 'member@fpt.edu.vn',
    members: [],
    lecturer: 'lecturer@fpt.edu.vn',
  },
  // Groups that members can join
  {
    id: 4,
    name: 'Smart Home IoT',
    leader: null,
    members: [],
    lecturer: 'lecturer@fpt.edu.vn',
    maxMembers: 4,
    description: 'Building smart home automation systems',
    status: 'open',
  },
  {
    id: 5,
    name: 'Environmental Monitoring',
    leader: null,
    members: [],
    lecturer: 'iot.specialist@fpt.edu.vn',
    maxMembers: 4,
    description: 'IoT sensors for environmental data collection',
    status: 'open',
  },
  {
    id: 6,
    name: 'Industrial IoT',
    leader: null,
    members: [],
    lecturer: 'sensor.expert@fpt.edu.vn',
    maxMembers: 4,
    description: 'Industrial automation and monitoring systems',
    status: 'open',
  },
];

// Mock kits data
export const mockKits = [
  {
    id: 1,
    name: 'IoT Starter Kit',
    quantity: 5,
    price: 100000,
    status: 'AVAILABLE',
    description: 'A basic IoT kit for beginners with Arduino Uno, sensors, and breadboard.',
    category: 'Basic',
    location: 'Lab 1',
    lastMaintenance: '2024-01-01',
    nextMaintenance: '2024-06-01',
    components: [
      { name: 'Arduino Uno', quantity: 1, condition: 'New' },
      { name: 'Breadboard', quantity: 1, condition: 'New' },
      { name: 'LEDs', quantity: 10, condition: 'New' },
      { name: 'Resistors', quantity: 20, condition: 'New' },
    ],
  },
  {
    id: 2,
    name: 'Advanced IoT Kit',
    quantity: 2,
    price: 200000,
    status: 'IN-USE',
    description: 'Advanced kit for IoT projects with Raspberry Pi and multiple sensors.',
    category: 'Advanced',
    location: 'Lab 2',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-07-01',
    components: [
      { name: 'Raspberry Pi', quantity: 1, condition: 'Used' },
      { name: 'Sensors', quantity: 5, condition: 'New' },
      { name: 'Camera Module', quantity: 1, condition: 'New' },
      { name: 'WiFi Module', quantity: 1, condition: 'New' },
    ],
  },
  {
    id: 3,
    name: 'Professional IoT Kit',
    quantity: 1,
    price: 500000,
    status: 'AVAILABLE',
    description: 'Professional grade IoT kit for advanced projects and research.',
    category: 'Professional',
    location: 'Lab 3',
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-08-01',
    components: [
      { name: 'ESP32', quantity: 2, condition: 'New' },
      { name: 'OLED Display', quantity: 1, condition: 'New' },
      { name: 'Motor Driver', quantity: 1, condition: 'New' },
      { name: 'GPS Module', quantity: 1, condition: 'New' },
    ],
  },
  {
    id: 4,
    name: 'Robotics Kit',
    quantity: 3,
    price: 300000,
    status: 'DAMAGED',
    description: 'Complete robotics kit with motors, chassis, and control system.',
    category: 'Advanced',
    location: 'Lab 1',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-06-15',
    components: [
      { name: 'DC Motors', quantity: 4, condition: 'Used' },
      { name: 'Wheels', quantity: 4, condition: 'Used' },
      { name: 'Chassis', quantity: 1, condition: 'Damaged' },
      { name: 'Battery Pack', quantity: 1, condition: 'Used' },
    ],
  },
];

// Mock wallet data
export const mockWallet = {
  balance: 500000,
  transactions: [
    { type: 'Deposit', amount: 100000, date: '2024-04-01' },
    { type: 'Rental', amount: -100000, date: '2024-04-02' },
  ],
};

// Mock notifications for admin
export const mockNotifications = [
  { message: 'New rental request submitted', date: '2024-05-01' },
  { message: 'Refund request pending', date: '2024-05-02' },
  { message: 'Kit maintenance due', date: '2024-05-03' },
  { message: 'New user registration', date: '2024-05-04' },
];

// Mock report for admin
export const mockReport = {
  totalKits: 10,
  inUse: 3,
  overdue: 1,
  totalUsers: 150,
  activeRentals: 8,
  pendingApprovals: 5,
};

// Mock assignments for academic
export const mockAssignments = [
  { lecturerId: 'lecturer@fpt.edu.vn', classId: 'CSE101', semesterId: '2024A' },
];

// Mock users for AdminPortal user management
export const mockUsers = users;

// Mock rental requests for admin approval
export const mockRentalRequests = [
  {
    id: 1,
    userId: 3,
    userName: 'Student User',
    userEmail: 'student@fpt.edu.vn',
    userRole: 'student',
    kitId: 1,
    kitName: 'IoT Starter Kit',
    duration: 7,
    startDate: '2024-05-10',
    endDate: '2024-05-17',
    totalCost: 70000,
    status: 'PENDING_APPROVAL',
    requestDate: '2024-05-01',
    reason: 'For IoT project assignment',
    purpose: 'Academic project',
    approvedBy: null,
    approvalDate: null,
  },
  {
    id: 2,
    userId: 8,
    userName: 'John Doe',
    userEmail: 'john.doe@fpt.edu.vn',
    userRole: 'student',
    kitId: 2,
    kitName: 'Advanced IoT Kit',
    duration: 14,
    startDate: '2024-05-15',
    endDate: '2024-05-29',
    totalCost: 280000,
    status: 'APPROVED',
    requestDate: '2024-05-02',
    reason: 'Research project on smart home automation',
    purpose: 'Research',
    approvedBy: 'admin@fpt.edu.vn',
    approvalDate: '2024-05-03',
  },
  {
    id: 4,
    userId: 4,
    userName: 'Leader User',
    userEmail: 'leader@fpt.edu.vn',
    userRole: 'leader',
    kitId: 1,
    kitName: 'IoT Starter Kit',
    duration: 5,
    startDate: '2024-05-25',
    endDate: '2024-05-30',
    totalCost: 50000,
    status: 'PENDING_APPROVAL',
    requestDate: '2024-05-04',
    reason: 'Group project demonstration',
    purpose: 'Academic project',
    approvedBy: null,
    approvalDate: null,
  },
];

// Mock refund requests for admin approval
export const mockRefundRequests = [
  {
    id: 1,
    userId: 3,
    userEmail: 'student@fpt.edu.vn',
    userRole: 'student',
    rentalId: 2,
    kitName: 'Advanced IoT Kit',
    originalAmount: 280000,
    refundAmount: 280000,
    requestDate: '2024-05-10',
    refundDate: '2024-05-12',
    dueDate: '2024-05-29',
    status: 'pending',
    damageAssessment: null,
    approvedBy: null,
    approvalDate: null,
    qrCode: null,
  },
  {
    id: 2,
    userId: 8,
    userEmail: 'john.doe@fpt.edu.vn',
    userRole: 'student',
    rentalId: 3,
    kitName: 'Professional IoT Kit',
    originalAmount: 500000,
    refundAmount: 450000,
    requestDate: '2024-05-15',
    refundDate: '2024-05-18',
    dueDate: '2024-06-19',
    status: 'approved',
    damageAssessment: {
      'ESP32': { damaged: 1, value: 100000 },
      'OLED Display': { damaged: 0, value: 50000 },
    },
    approvedBy: 'admin@fpt.edu.vn',
    approvalDate: '2024-05-19',
    qrCode: 'REFUND-2024-001',
  },
  {
    id: 4,
    userId: 4,
    userEmail: 'leader@fpt.edu.vn',
    userRole: 'leader',
    rentalId: 5,
    kitName: 'Robotics Kit',
    originalAmount: 300000,
    refundAmount: 300000,
    requestDate: '2024-05-25',
    refundDate: '2024-05-26',
    dueDate: '2024-06-09',
    status: 'pending',
    damageAssessment: null,
    approvedBy: null,
    approvalDate: null,
    qrCode: null,
  },
];

// Mock role permissions for access control
export const mockRolePermissions = {
  admin: {
    canCreateUsers: true,
    canDeleteUsers: true,
    canEditUsers: true,
    canManageKits: true,
    canApproveRentals: true,
    canApproveRefunds: true,
    canViewReports: true,
    canManageGroups: true,
    canAccessAdminPortal: true,
  },
  lecturer: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canManageKits: false,
    canApproveRentals: false,
    canApproveRefunds: false,
    canViewReports: true,
    canManageGroups: true,
    canAccessAdminPortal: false,
  },
  student: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canManageKits: false,
    canApproveRentals: false,
    canApproveRefunds: false,
    canViewReports: false,
    canManageGroups: false,
    canAccessAdminPortal: false,
  },
  leader: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canManageKits: false,
    canApproveRentals: false,
    canApproveRefunds: false,
    canViewReports: false,
    canManageGroups: true,
    canAccessAdminPortal: false,
  },
  academic: {
    canCreateUsers: true,
    canDeleteUsers: false,
    canEditUsers: true,
    canManageKits: false,
    canApproveRentals: false,
    canApproveRefunds: false,
    canViewReports: true,
    canManageGroups: false,
    canAccessAdminPortal: false,
  },
  member: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canManageKits: false,
    canApproveRentals: false,
    canApproveRefunds: false,
    canViewReports: false,
    canManageGroups: false,
    canAccessAdminPortal: false,
  },
  parent: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canManageKits: false,
    canApproveRentals: false,
    canApproveRefunds: false,
    canViewReports: false,
    canManageGroups: false,
    canAccessAdminPortal: false,
  },
};

// Mock system statistics for admin dashboard
export const mockSystemStats = {
  totalUsers: 150,
  activeUsers: 120,
  totalKits: 25,
  availableKits: 15,
  rentedKits: 8,
  damagedKits: 2,
  totalRentals: 45,
  pendingApprovals: 5,
  totalRevenue: 2500000,
  monthlyRevenue: 500000,
  popularKits: [
    { name: 'IoT Starter Kit', rentals: 15 },
    { name: 'Advanced IoT Kit', rentals: 12 },
    { name: 'Robotics Kit', rentals: 8 },
  ],
  recentActivity: [
    { action: 'New rental request', user: 'student@fpt.edu.vn', time: '2024-05-01 10:30' },
    { action: 'Kit returned', user: 'lecturer@fpt.edu.vn', time: '2024-05-01 09:15' },
    { action: 'Refund approved', user: 'admin@fpt.edu.vn', time: '2024-05-01 08:45' },
    { action: 'New user registered', user: 'john.doe@fpt.edu.vn', time: '2024-05-01 08:30' },
  ],
};

// Mock maintenance schedule
export const mockMaintenanceSchedule = [
  {
    id: 1,
    kitId: 1,
    kitName: 'IoT Starter Kit',
    lastMaintenance: '2024-01-01',
    nextMaintenance: '2024-06-01',
    status: 'Scheduled',
    technician: 'Tech Team A',
    notes: 'Regular maintenance check',
  },
  {
    id: 2,
    kitId: 2,
    kitName: 'Advanced IoT Kit',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-07-01',
    status: 'Scheduled',
    technician: 'Tech Team B',
    notes: 'Component replacement needed',
  },
  {
    id: 3,
    kitId: 4,
    kitName: 'Robotics Kit',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-06-15',
    status: 'In Progress',
    technician: 'Tech Team A',
    notes: 'Chassis repair in progress',
  },
];

// You can expand these mocks as needed for each portal/component.

// Mock academic data for Academic Affairs Portal
export const mockSemesters = [
  {
    id: 1,
    name: 'Fall 2024',
    startDate: '2024-09-01',
    endDate: '2024-12-20',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Spring 2025',
    startDate: '2025-01-15',
    endDate: '2025-05-10',
    status: 'Upcoming'
  },
  {
    id: 3,
    name: 'Summer 2024',
    startDate: '2024-06-01',
    endDate: '2024-08-15',
    status: 'Completed'
  }
];

export const mockStudents = [
  {
    id: 1,
    studentId: 'SE123456',
    name: 'Nguyen Van A',
    email: 'student1@fpt.edu.vn',
    major: 'Software Engineering',
    status: 'Active',
    enrollmentDate: '2024-09-01'
  },
  {
    id: 2,
    studentId: 'SE123457',
    name: 'Tran Thi B',
    email: 'student2@fpt.edu.vn',
    major: 'Software Engineering',
    status: 'Active',
    enrollmentDate: '2024-09-01'
  },
  {
    id: 3,
    studentId: 'AI123458',
    name: 'Le Van C',
    email: 'student3@fpt.edu.vn',
    major: 'Artificial Intelligence',
    status: 'Active',
    enrollmentDate: '2024-09-01'
  },
  {
    id: 4,
    studentId: 'AI123459',
    name: 'Pham Thi D',
    email: 'student4@fpt.edu.vn',
    major: 'Artificial Intelligence',
    status: 'Active',
    enrollmentDate: '2024-09-01'
  },
  {
    id: 5,
    studentId: 'IT123460',
    name: 'Hoang Van E',
    email: 'student5@fpt.edu.vn',
    major: 'Information Technology',
    status: 'Active',
    enrollmentDate: '2024-09-01'
  }
];

export const mockLecturers = [
  {
    id: 1,
    name: 'Dr. Nguyen Van Lecturer',
    email: 'lecturer@fpt.edu.vn',
    department: 'Software Engineering',
    specialization: 'Web Development',
    status: 'Active',
    hireDate: '2020-01-15'
  },
  {
    id: 2,
    name: 'Dr. Tran Thi Professor',
    email: 'professor@fpt.edu.vn',
    department: 'Artificial Intelligence',
    specialization: 'Machine Learning',
    status: 'Active',
    hireDate: '2019-03-20'
  },
  {
    id: 3,
    name: 'Dr. Le Van Assistant',
    email: 'assistant@fpt.edu.vn',
    department: 'Information Technology',
    specialization: 'Database Systems',
    status: 'Active',
    hireDate: '2021-08-10'
  },
  {
    id: 4,
    name: 'Dr. IoT Specialist',
    email: 'iot.specialist@fpt.edu.vn',
    department: 'Computer Engineering',
    specialization: 'Internet of Things',
    status: 'Active',
    hireDate: '2022-01-10'
  },
  {
    id: 5,
    name: 'Dr. Sensor Expert',
    email: 'sensor.expert@fpt.edu.vn',
    department: 'Computer Engineering',
    specialization: 'Sensor Networks',
    status: 'Active',
    hireDate: '2021-06-15'
  },
  {
    id: 6,
    name: 'Dr. Embedded Systems',
    email: 'embedded.systems@fpt.edu.vn',
    department: 'Computer Engineering',
    specialization: 'Embedded Systems',
    status: 'Active',
    hireDate: '2020-09-20'
  },
  {
    id: 7,
    name: 'Dr. Security Analyst',
    email: 'security.analyst@fpt.edu.vn',
    department: 'Cybersecurity',
    specialization: 'IoT Security',
    status: 'Active',
    hireDate: '2021-03-12'
  }
];

export const mockClasses = [
  {
    id: 1,
    name: 'Web Development Fundamentals',
    semesterId: 1,
    semesterName: 'Fall 2024',
    lecturerId: 1,
    lecturerName: 'Dr. Nguyen Van Lecturer',
    capacity: 30,
    enrolledCount: 25,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Machine Learning Basics',
    semesterId: 1,
    semesterName: 'Fall 2024',
    lecturerId: 2,
    lecturerName: 'Dr. Tran Thi Professor',
    capacity: 25,
    enrolledCount: 20,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Database Design',
    semesterId: 1,
    semesterName: 'Fall 2024',
    lecturerId: 3,
    lecturerName: 'Dr. Le Van Assistant',
    capacity: 35,
    enrolledCount: 30,
    status: 'Active'
  },
  {
    id: 4,
    name: 'Advanced Web Development',
    semesterId: 2,
    semesterName: 'Spring 2025',
    lecturerId: 1,
    lecturerName: 'Dr. Nguyen Van Lecturer',
    capacity: 25,
    enrolledCount: 0,
    status: 'Upcoming'
  },
  {
    id: 5,
    name: 'Internet of Things Fundamentals',
    semesterId: 1,
    semesterName: 'Fall 2024',
    lecturerId: 4,
    lecturerName: 'Dr. IoT Specialist',
    capacity: 30,
    enrolledCount: 28,
    status: 'Active'
  },
  {
    id: 6,
    name: 'IoT Sensor Networks',
    semesterId: 1,
    semesterName: 'Fall 2024',
    lecturerId: 5,
    lecturerName: 'Dr. Sensor Expert',
    capacity: 25,
    enrolledCount: 22,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Embedded Systems Design',
    semesterId: 2,
    semesterName: 'Spring 2025',
    lecturerId: 6,
    lecturerName: 'Dr. Embedded Systems',
    capacity: 20,
    enrolledCount: 0,
    status: 'Upcoming'
  },
  {
    id: 8,
    name: 'IoT Security and Privacy',
    semesterId: 2,
    semesterName: 'Spring 2025',
    lecturerId: 7,
    lecturerName: 'Dr. Security Analyst',
    capacity: 25,
    enrolledCount: 0,
    status: 'Upcoming'
  }
];

export const mockEnrollments = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Nguyen Van A',
    classId: 1,
    className: 'Web Development Fundamentals',
    semesterId: 1,
    semesterName: 'Fall 2024',
    enrollmentDate: '2024-09-01',
    status: 'Enrolled'
  },
  {
    id: 2,
    studentId: 2,
    studentName: 'Tran Thi B',
    classId: 1,
    className: 'Web Development Fundamentals',
    semesterId: 1,
    semesterName: 'Fall 2024',
    enrollmentDate: '2024-09-01',
    status: 'Enrolled'
  },
  {
    id: 3,
    studentId: 3,
    studentName: 'Le Van C',
    classId: 2,
    className: 'Machine Learning Basics',
    semesterId: 1,
    semesterName: 'Fall 2024',
    enrollmentDate: '2024-09-01',
    status: 'Enrolled'
  },
  {
    id: 4,
    studentId: 4,
    studentName: 'Pham Thi D',
    classId: 2,
    className: 'Machine Learning Basics',
    semesterId: 1,
    semesterName: 'Fall 2024',
    enrollmentDate: '2024-09-01',
    status: 'Enrolled'
  },
  {
    id: 5,
    studentId: 5,
    studentName: 'Hoang Van E',
    classId: 3,
    className: 'Database Design',
    semesterId: 1,
    semesterName: 'Fall 2024',
    enrollmentDate: '2024-09-01',
    status: 'Enrolled'
  }
];

export const mockAcademicAssignments = [
  {
    id: 1,
    lecturerId: 1,
    lecturerName: 'Dr. Nguyen Van Lecturer',
    classId: 1,
    className: 'Web Development Fundamentals',
    semesterId: 1,
    semesterName: 'Fall 2024',
    assignmentDate: '2024-08-15',
    status: 'Active'
  },
  {
    id: 2,
    lecturerId: 2,
    lecturerName: 'Dr. Tran Thi Professor',
    classId: 2,
    className: 'Machine Learning Basics',
    semesterId: 1,
    semesterName: 'Fall 2024',
    assignmentDate: '2024-08-15',
    status: 'Active'
  },
  {
    id: 3,
    lecturerId: 3,
    lecturerName: 'Dr. Le Van Assistant',
    classId: 3,
    className: 'Database Design',
    semesterId: 1,
    semesterName: 'Fall 2024',
    assignmentDate: '2024-08-15',
    status: 'Active'
  },
  {
    id: 4,
    lecturerId: 1,
    lecturerName: 'Dr. Nguyen Van Lecturer',
    classId: 4,
    className: 'Advanced Web Development',
    semesterId: 2,
    semesterName: 'Spring 2025',
    assignmentDate: '2024-12-01',
    status: 'Scheduled'
  },
  {
    id: 5,
    lecturerId: 4,
    lecturerName: 'Dr. IoT Specialist',
    classId: 5,
    className: 'Internet of Things Fundamentals',
    semesterId: 1,
    semesterName: 'Fall 2024',
    assignmentDate: '2024-08-20',
    status: 'Active'
  },
  {
    id: 6,
    lecturerId: 5,
    lecturerName: 'Dr. Sensor Expert',
    classId: 6,
    className: 'IoT Sensor Networks',
    semesterId: 1,
    semesterName: 'Fall 2024',
    assignmentDate: '2024-08-25',
    status: 'Active'
  },
  {
    id: 7,
    lecturerId: 6,
    lecturerName: 'Dr. Embedded Systems',
    classId: 7,
    className: 'Embedded Systems Design',
    semesterId: 2,
    semesterName: 'Spring 2025',
    assignmentDate: '2024-12-05',
    status: 'Scheduled'
  },
  {
    id: 8,
    lecturerId: 7,
    lecturerName: 'Dr. Security Analyst',
    classId: 8,
    className: 'IoT Security and Privacy',
    semesterId: 2,
    semesterName: 'Spring 2025',
    assignmentDate: '2024-12-10',
    status: 'Scheduled'
  }
];

export const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-15 09:30:00',
    user: 'academic@fpt.edu.vn',
    action: 'Created Semester',
    details: 'Fall 2024 semester created',
    status: 'Success'
  },
  {
    id: 2,
    timestamp: '2024-01-15 10:15:00',
    user: 'academic@fpt.edu.vn',
    action: 'Added Student',
    details: 'Student Nguyen Van A (SE123456) added',
    status: 'Success'
  },
  {
    id: 3,
    timestamp: '2024-01-15 11:00:00',
    user: 'academic@fpt.edu.vn',
    action: 'Assigned Lecturer',
    details: 'Dr. Nguyen Van Lecturer assigned to Web Development Fundamentals',
    status: 'Success'
  },
  {
    id: 4,
    timestamp: '2024-01-15 14:30:00',
    user: 'academic@fpt.edu.vn',
    action: 'Enrolled Student',
    details: 'Student Nguyen Van A enrolled in Web Development Fundamentals',
    status: 'Success'
  },
  {
    id: 5,
    timestamp: '2024-01-16 08:45:00',
    user: 'academic@fpt.edu.vn',
    action: 'Updated Class',
    details: 'Machine Learning Basics capacity increased to 25',
    status: 'Success'
  },
  {
    id: 6,
    timestamp: '2024-01-16 15:20:00',
    user: 'academic@fpt.edu.vn',
    action: 'Deleted Student',
    details: 'Student John Doe (SE123999) removed',
    status: 'Success'
  }
];

// Mock transaction history for admin portal
export const mockTransactions = [
  {
    id: 1,
    transactionId: 'TXN-2024-001',
    userId: 3,
    userName: 'Student User',
    userEmail: 'student@fpt.edu.vn',
    userRole: 'student',
    type: 'RENTAL_PAYMENT',
    amount: 70000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Payment for IoT Starter Kit rental (7 days)',
    kitId: 1,
    kitName: 'IoT Starter Kit',
    rentalId: 1,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-01 10:30:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'RENT-2024-001',
    notes: 'Standard rental payment'
  },
  {
    id: 2,
    transactionId: 'TXN-2024-002',
    userId: 8,
    userName: 'John Doe',
    userEmail: 'john.doe@fpt.edu.vn',
    userRole: 'student',
    type: 'RENTAL_PAYMENT',
    amount: 280000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Payment for Advanced IoT Kit rental (14 days)',
    kitId: 2,
    kitName: 'Advanced IoT Kit',
    rentalId: 2,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-02 14:15:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'RENT-2024-002',
    notes: 'Research project rental'
  },
  {
    id: 3,
    transactionId: 'TXN-2024-003',
    userId: 9,
    userName: 'Jane Smith',
    userEmail: 'jane.smith@fpt.edu.vn',
    userRole: 'lecturer',
    type: 'RENTAL_PAYMENT',
    amount: 500000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Payment for Professional IoT Kit rental (30 days)',
    kitId: 3,
    kitName: 'Professional IoT Kit',
    rentalId: 3,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-03 09:45:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'RENT-2024-003',
    notes: 'Teaching course development'
  },
  {
    id: 4,
    transactionId: 'TXN-2024-004',
    userId: 3,
    userName: 'Student User',
    userEmail: 'student@fpt.edu.vn',
    userRole: 'student',
    type: 'FINE_PAYMENT',
    amount: 50000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Late return fine for IoT Starter Kit',
    kitId: 1,
    kitName: 'IoT Starter Kit',
    rentalId: 1,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-05 16:20:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'FINE-2024-001',
    notes: '2 days late return'
  },
  {
    id: 5,
    transactionId: 'TXN-2024-005',
    userId: 8,
    userName: 'John Doe',
    userEmail: 'john.doe@fpt.edu.vn',
    userRole: 'student',
    type: 'DAMAGE_FINE',
    amount: 150000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Damage fine for Advanced IoT Kit - Broken sensor',
    kitId: 2,
    kitName: 'Advanced IoT Kit',
    rentalId: 2,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-06 11:30:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'DAMAGE-2024-001',
    notes: 'Temperature sensor damaged during use'
  },
  {
    id: 6,
    transactionId: 'TXN-2024-006',
    userId: 10,
    userName: 'Alice Johnson',
    userEmail: 'alice.johnson@fpt.edu.vn',
    userRole: 'student',
    type: 'RENTAL_PAYMENT',
    amount: 350000,
    currency: 'VND',
    status: 'PENDING',
    description: 'Payment for IoT Development Kit rental (21 days)',
    kitId: 4,
    kitName: 'IoT Development Kit',
    rentalId: 4,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-07 13:45:00',
    processedBy: null,
    reference: 'RENT-2024-004',
    notes: 'Pending approval'
  },
  {
    id: 7,
    transactionId: 'TXN-2024-007',
    userId: 11,
    userName: 'Bob Wilson',
    userEmail: 'bob.wilson@fpt.edu.vn',
    userRole: 'student',
    type: 'REFUND',
    amount: -70000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Refund for cancelled IoT Starter Kit rental',
    kitId: 1,
    kitName: 'IoT Starter Kit',
    rentalId: 5,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-08 10:15:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'REFUND-2024-001',
    notes: 'Cancelled due to schedule conflict'
  },
  {
    id: 8,
    transactionId: 'TXN-2024-008',
    userId: 12,
    userName: 'Carol Davis',
    userEmail: 'carol.davis@fpt.edu.vn',
    userRole: 'lecturer',
    type: 'RENTAL_PAYMENT',
    amount: 400000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Payment for IoT Research Kit rental (28 days)',
    kitId: 5,
    kitName: 'IoT Research Kit',
    rentalId: 6,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-09 15:30:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'RENT-2024-005',
    notes: 'Research project rental'
  },
  {
    id: 9,
    transactionId: 'TXN-2024-009',
    userId: 13,
    userName: 'David Brown',
    userEmail: 'david.brown@fpt.edu.vn',
    userRole: 'student',
    type: 'DEPOSIT',
    amount: 200000,
    currency: 'VND',
    status: 'COMPLETED',
    description: 'Wallet deposit',
    kitId: null,
    kitName: null,
    rentalId: null,
    paymentMethod: 'BANK_TRANSFER',
    transactionDate: '2024-05-10 09:00:00',
    processedBy: 'admin@fpt.edu.vn',
    reference: 'DEPOSIT-2024-001',
    notes: 'Initial wallet funding'
  },
  {
    id: 10,
    transactionId: 'TXN-2024-010',
    userId: 14,
    userName: 'Eva Garcia',
    userEmail: 'eva.garcia@fpt.edu.vn',
    userRole: 'student',
    type: 'RENTAL_PAYMENT',
    amount: 120000,
    currency: 'VND',
    status: 'FAILED',
    description: 'Payment for Basic IoT Kit rental (10 days)',
    kitId: 6,
    kitName: 'Basic IoT Kit',
    rentalId: 7,
    paymentMethod: 'WALLET',
    transactionDate: '2024-05-11 14:20:00',
    processedBy: null,
    reference: 'RENT-2024-006',
    notes: 'Insufficient wallet balance'
  }
];

// Mock fines data for admin portal
export const mockFines = [
  {
    id: 1,
    kitName: 'Advanced IoT Kit',
    studentName: 'John Doe',
    studentEmail: 'john.doe@fpt.edu.vn',
    leaderName: 'Leader User',
    leaderEmail: 'leader@fpt.edu.vn',
    fineAmount: 150000,
    status: 'pending',
    createdAt: '2024-05-06T11:30:00.000Z',
    dueDate: '2024-05-20T11:30:00.000Z',
    damageAssessment: {
      'Temperature Sensor': { damaged: 1, value: 100000 },
      'WiFi Module': { damaged: 1, value: 50000 }
    },
    rentalId: 2,
    kitId: 2
  },
  {
    id: 2,
    kitName: 'Professional IoT Kit',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@fpt.edu.vn',
    leaderName: 'Leader User',
    leaderEmail: 'leader@fpt.edu.vn',
    fineAmount: 80000,
    status: 'paid',
    createdAt: '2024-05-05T10:15:00.000Z',
    paidDate: '2024-05-10T14:30:00.000Z',
    dueDate: '2024-05-19T10:15:00.000Z',
    damageAssessment: {
      'OLED Display': { damaged: 1, value: 80000 }
    },
    rentalId: 3,
    kitId: 3
  }
];

// Mock lecturer fines/refunds data
export const mockLecturerFines = [
  {
    id: 1,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'IoT Starter Kit',
    rentalId: 'RENT-2024-001',
    fineAmount: 50000,
    fineType: 'late_return',
    status: 'paid',
    createdAt: '2024-05-01T10:30:00.000Z',
    paidDate: '2024-05-03T14:20:00.000Z',
    dueDate: '2024-05-15T10:30:00.000Z',
    reason: 'Returned kit 2 days late',
    description: 'Kit was returned 2 days after the due date'
  },
  {
    id: 2,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Advanced IoT Kit',
    rentalId: 'RENT-2024-002',
    fineAmount: 100000,
    fineType: 'damage',
    status: 'pending',
    createdAt: '2024-05-05T15:45:00.000Z',
    paidDate: null,
    dueDate: '2024-05-20T15:45:00.000Z',
    reason: 'Minor damage to temperature sensor',
    description: 'Temperature sensor shows signs of wear and tear'
  },
  {
    id: 3,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Professional IoT Kit',
    rentalId: 'RENT-2024-005',
    fineAmount: 75000,
    fineType: 'late_return',
    status: 'paid',
    createdAt: '2024-04-28T09:15:00.000Z',
    paidDate: '2024-05-01T16:30:00.000Z',
    dueDate: '2024-05-10T09:15:00.000Z',
    reason: 'Returned kit 3 days late',
    description: 'Kit was returned 3 days after the due date due to project extension'
  },
  {
    id: 4,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Robotics Kit',
    rentalId: 'RENT-2024-006',
    fineAmount: 120000,
    fineType: 'damage',
    status: 'pending',
    createdAt: '2024-05-08T11:20:00.000Z',
    paidDate: null,
    dueDate: '2024-05-22T11:20:00.000Z',
    reason: 'Motor damage during demonstration',
    description: 'One DC motor stopped working during class demonstration'
  },
  {
    id: 5,
    lecturerEmail: 'iot.specialist@fpt.edu.vn',
    kitName: 'IoT Starter Kit',
    rentalId: 'RENT-2024-007',
    fineAmount: 30000,
    fineType: 'late_return',
    status: 'paid',
    createdAt: '2024-04-20T14:00:00.000Z',
    paidDate: '2024-04-22T10:15:00.000Z',
    dueDate: '2024-05-05T14:00:00.000Z',
    reason: 'Returned kit 1 day late',
    description: 'Kit was returned 1 day after the due date'
  },
  {
    id: 6,
    lecturerEmail: 'sensor.expert@fpt.edu.vn',
    kitName: 'Advanced IoT Kit',
    rentalId: 'RENT-2024-008',
    fineAmount: 80000,
    fineType: 'damage',
    status: 'pending',
    createdAt: '2024-05-10T13:45:00.000Z',
    paidDate: null,
    dueDate: '2024-05-24T13:45:00.000Z',
    reason: 'Sensor calibration issue',
    description: 'Temperature sensor requires recalibration'
  }
];

export const mockLecturerRefunds = [
  {
    id: 1,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Raspberry Pi Kit',
    rentalId: 'RENT-2024-003',
    originalAmount: 200000,
    refundAmount: 200000,
    refundType: 'early_return',
    status: 'approved',
    requestDate: '2024-05-02T09:15:00.000Z',
    approvalDate: '2024-05-03T11:30:00.000Z',
    refundDate: '2024-05-04T10:00:00.000Z',
    reason: 'Project completed early, returning kit ahead of schedule',
    approvedBy: 'admin@fpt.edu.vn',
    qrCode: 'REFUND-LECT-001'
  },
  {
    id: 2,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Professional IoT Kit',
    rentalId: 'RENT-2024-004',
    originalAmount: 500000,
    refundAmount: 450000,
    refundType: 'partial_damage',
    status: 'pending',
    requestDate: '2024-05-08T14:20:00.000Z',
    approvalDate: null,
    refundDate: null,
    reason: 'Kit returned with minor damage to one component',
    approvedBy: null,
    qrCode: null,
    damageAssessment: {
      'ESP32': { damaged: 1, value: 50000 }
    }
  },
  {
    id: 3,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'IoT Starter Kit',
    rentalId: 'RENT-2024-009',
    originalAmount: 150000,
    refundAmount: 150000,
    refundType: 'early_return',
    status: 'approved',
    requestDate: '2024-04-25T08:30:00.000Z',
    approvalDate: '2024-04-26T10:45:00.000Z',
    refundDate: '2024-04-27T09:20:00.000Z',
    reason: 'Course ended early, no longer need the kit',
    approvedBy: 'admin@fpt.edu.vn',
    qrCode: 'REFUND-LECT-002'
  },
  {
    id: 4,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Advanced IoT Kit',
    rentalId: 'RENT-2024-010',
    originalAmount: 300000,
    refundAmount: 250000,
    refundType: 'partial_damage',
    status: 'approved',
    requestDate: '2024-05-01T16:15:00.000Z',
    approvalDate: '2024-05-02T14:30:00.000Z',
    refundDate: '2024-05-03T11:45:00.000Z',
    reason: 'Kit returned with damaged WiFi module',
    approvedBy: 'admin@fpt.edu.vn',
    qrCode: 'REFUND-LECT-003',
    damageAssessment: {
      'WiFi Module': { damaged: 1, value: 50000 }
    }
  },
  {
    id: 5,
    lecturerEmail: 'iot.specialist@fpt.edu.vn',
    kitName: 'Professional IoT Kit',
    rentalId: 'RENT-2024-011',
    originalAmount: 400000,
    refundAmount: 400000,
    refundType: 'early_return',
    status: 'pending',
    requestDate: '2024-05-12T10:30:00.000Z',
    approvalDate: null,
    refundDate: null,
    reason: 'Research project completed ahead of schedule',
    approvedBy: null,
    qrCode: null
  },
  {
    id: 6,
    lecturerEmail: 'sensor.expert@fpt.edu.vn',
    kitName: 'Robotics Kit',
    rentalId: 'RENT-2024-012',
    originalAmount: 250000,
    refundAmount: 200000,
    refundType: 'partial_damage',
    status: 'approved',
    requestDate: '2024-04-30T12:00:00.000Z',
    approvalDate: '2024-05-01T15:20:00.000Z',
    refundDate: '2024-05-02T09:30:00.000Z',
    reason: 'Kit returned with damaged wheel',
    approvedBy: 'admin@fpt.edu.vn',
    qrCode: 'REFUND-LECT-004',
    damageAssessment: {
      'Wheel': { damaged: 1, value: 50000 }
    }
  }
];

// Mock Vietnamese banks for top-up functionality
export const mockVietnameseBanks = [
  {
    id: 1,
    code: 'VCB',
    name: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
    shortName: 'Vietcombank',
    logo: 'https://logo.clearbit.com/vietcombank.com.vn',
    supported: true
  },
  {
    id: 2,
    code: 'BID',
    name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    shortName: 'BIDV',
    logo: 'https://logo.clearbit.com/bidv.com.vn',
    supported: true
  },
  {
    id: 3,
    code: 'CTG',
    name: 'Ngân hàng TMCP Công Thương Việt Nam',
    shortName: 'VietinBank',
    logo: 'https://logo.clearbit.com/vietinbank.com.vn',
    supported: true
  },
  {
    id: 4,
    code: 'ACB',
    name: 'Ngân hàng TMCP Á Châu',
    shortName: 'ACB',
    logo: 'https://logo.clearbit.com/acb.com.vn',
    supported: true
  },
  {
    id: 5,
    code: 'TCB',
    name: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    shortName: 'Techcombank',
    logo: 'https://logo.clearbit.com/techcombank.com',
    supported: true
  },
  {
    id: 6,
    code: 'MBB',
    name: 'Ngân hàng TMCP Quân đội',
    shortName: 'MB Bank',
    logo: 'https://logo.clearbit.com/mbbank.com.vn',
    supported: true
  },
  {
    id: 7,
    code: 'VPB',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    shortName: 'VPBank',
    logo: 'https://logo.clearbit.com/vpbank.com.vn',
    supported: true
  },
  {
    id: 8,
    code: 'TPB',
    name: 'Ngân hàng TMCP Tiên Phong',
    shortName: 'TPBank',
    logo: 'https://logo.clearbit.com/tpbank.com.vn',
    supported: true
  },
  {
    id: 9,
    code: 'HDB',
    name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh',
    shortName: 'HDBank',
    logo: 'https://logo.clearbit.com/hdbank.com.vn',
    supported: true
  },
  {
    id: 10,
    code: 'VIB',
    name: 'Ngân hàng TMCP Quốc tế Việt Nam',
    shortName: 'VIB',
    logo: 'https://logo.clearbit.com/vib.com.vn',
    supported: true
  },
  {
    id: 11,
    code: 'MSB',
    name: 'Ngân hàng TMCP Hàng Hải',
    shortName: 'MSB',
    logo: 'https://logo.clearbit.com/msb.com.vn',
    supported: true
  },
  {
    id: 12,
    code: 'OCB',
    name: 'Ngân hàng TMCP Phương Đông',
    shortName: 'OCB',
    logo: 'https://logo.clearbit.com/ocb.com.vn',
    supported: true
  },
  {
    id: 13,
    code: 'SHB',
    name: 'Ngân hàng TMCP Sài Gòn - Hà Nội',
    shortName: 'SHB',
    logo: 'https://logo.clearbit.com/shb.com.vn',
    supported: true
  },
  {
    id: 14,
    code: 'STB',
    name: 'Ngân hàng TMCP Sài Gòn Thương Tín',
    shortName: 'Sacombank',
    logo: 'https://logo.clearbit.com/sacombank.com.vn',
    supported: true
  },
  {
    id: 15,
    code: 'EIB',
    name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam',
    shortName: 'Eximbank',
    logo: 'https://logo.clearbit.com/eximbank.com.vn',
    supported: true
  }
];

// Mock OTP verification function
export const mockOTPVerification = {
  generateOTP: () => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  
  verifyOTP: (inputOTP, generatedOTP) => {
    return inputOTP === generatedOTP;
  },
  
  sendOTP: async (phoneNumber) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const otp = mockOTPVerification.generateOTP();
    console.log(`OTP sent to ${phoneNumber}: ${otp}`); // For demo purposes
    return { success: true, otp };
  }
};

// Mock top-up transaction function
export const mockTopUpTransaction = async (userId, amount, bankCode, otp) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock validation
  if (!otp || otp.length !== 6) {
    throw new Error('Invalid OTP');
  }
  
  if (amount < 10000) {
    throw new Error('Minimum top-up amount is 10,000 VND');
  }
  
  if (amount > 10000000) {
    throw new Error('Maximum top-up amount is 10,000,000 VND');
  }
  
  // Mock successful transaction
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`,
    amount: amount,
    bankCode: bankCode,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
};

// Mock penalty fees data
export const mockPenaltyFees = [
  {
    id: 1,
    userId: 1,
    userEmail: 'leader@fpt.edu.vn',
    userRole: 'leader',
    penaltyType: 'late_return',
    kitName: 'IoT Starter Kit',
    rentalId: 'RENT-2024-001',
    amount: 50000,
    dueDate: '2024-05-20',
    status: 'pending',
    reason: 'Returned kit 2 days late',
    createdAt: '2024-05-15',
    description: 'Late return penalty for IoT Starter Kit'
  },
  {
    id: 2,
    userId: 2,
    userEmail: 'lecturer@fpt.edu.vn',
    userRole: 'lecturer',
    penaltyType: 'damage',
    kitName: 'Advanced IoT Kit',
    rentalId: 'RENT-2024-002',
    amount: 100000,
    dueDate: '2024-05-25',
    status: 'pending',
    reason: 'Minor damage to temperature sensor',
    createdAt: '2024-05-18',
    description: 'Damage penalty for Advanced IoT Kit'
  },
  {
    id: 3,
    userId: 1,
    userEmail: 'leader@fpt.edu.vn',
    userRole: 'leader',
    penaltyType: 'late_return',
    kitName: 'Professional IoT Kit',
    rentalId: 'RENT-2024-003',
    amount: 75000,
    dueDate: '2024-05-22',
    status: 'pending',
    reason: 'Returned kit 3 days late',
    createdAt: '2024-05-19',
    description: 'Late return penalty for Professional IoT Kit'
  },
  {
    id: 4,
    userId: 2,
    userEmail: 'lecturer@fpt.edu.vn',
    userRole: 'lecturer',
    penaltyType: 'damage',
    kitName: 'Robotics Kit',
    rentalId: 'RENT-2024-004',
    amount: 120000,
    dueDate: '2024-05-28',
    status: 'pending',
    reason: 'Motor damage during demonstration',
    createdAt: '2024-05-20',
    description: 'Damage penalty for Robotics Kit'
  },
  {
    id: 5,
    userId: 1,
    userEmail: 'leader@fpt.edu.vn',
    userRole: 'leader',
    penaltyType: 'damage',
    kitName: 'Professional IoT Kit',
    rentalId: 'RENT-2024-005',
    amount: 1000000,
    dueDate: '2024-05-30',
    status: 'pending',
    reason: 'Severe damage to multiple components - ESP32, OLED Display, and GPS Module',
    createdAt: '2024-05-22',
    description: 'Major damage penalty for Professional IoT Kit'
  }
];

// Mock penalty payment function
export const mockPenaltyPayment = async (userId, penaltyId, walletBalance) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const penalty = mockPenaltyFees.find(p => p.id === penaltyId);
  if (!penalty) {
    throw new Error('Penalty not found');
  }
  
  // Check if balance is sufficient
  if (walletBalance < penalty.amount) {
    throw new Error('Insufficient wallet balance');
  }
  
  // Mock successful payment
  return {
    success: true,
    paymentId: `PAY-${Date.now()}`,
    penaltyId: penaltyId,
    amount: penalty.amount,
    timestamp: new Date().toISOString(),
    status: 'completed',
    remainingBalance: walletBalance - penalty.amount
  };
};

// Mock function to get user's pending penalties
export const mockGetUserPenalties = (userEmail) => {
  return mockPenaltyFees.filter(penalty => 
    penalty.userEmail === userEmail && penalty.status === 'pending'
  );
};

// Mock QR code generation function
export const mockGenerateQRCode = (rentalData) => {
  // Generate a unique rental ID
  const rentalId = `RENT-${Date.now()}`;
  
  // Create QR code data
  const qrData = {
    rentalId: rentalId,
    kitId: rentalData.kitId,
    kitName: rentalData.kitName,
    userId: rentalData.userId,
    userEmail: rentalData.userEmail,
    startDate: rentalData.startDate,
    endDate: rentalData.endDate,
    totalCost: rentalData.totalCost,
    status: 'PENDING_APPROVAL',
    generatedAt: new Date().toISOString()
  };
  
  // Return QR code data and a mock QR code URL
  return {
    rentalId: rentalId,
    qrData: qrData,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`,
    qrCodeText: JSON.stringify(qrData, null, 2)
  };
};

// Mock refund to wallet function
export const mockRefundToWallet = async (userEmail, amount, reason) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful refund to wallet
  return {
    success: true,
    transactionId: `REF-${Date.now()}`,
    userEmail: userEmail,
    amount: amount,
    reason: reason,
    timestamp: new Date().toISOString(),
    status: 'completed',
    message: `Refund of ${amount.toLocaleString()} VND has been added to ${userEmail}'s wallet`
  };
};

// Mock lecturer borrow status tracking
export const mockLecturerBorrowStatus = [
  {
    id: 1,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'IoT Starter Kit',
    kitId: 1,
    rentalId: 'RENT-2024-001',
    borrowDate: '2024-04-25T10:00:00.000Z',
    dueDate: '2024-05-02T10:00:00.000Z',
    returnDate: '2024-05-04T14:30:00.000Z',
    status: 'returned',
    duration: 9,
    totalCost: 90000,
    purpose: 'Teaching IoT fundamentals course',
    groupId: 1,
    groupName: 'Group 1',
    notes: 'Kit used for hands-on demonstrations'
  },
  {
    id: 2,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Advanced IoT Kit',
    kitId: 2,
    rentalId: 'RENT-2024-002',
    borrowDate: '2024-05-01T09:00:00.000Z',
    dueDate: '2024-05-08T09:00:00.000Z',
    returnDate: null,
    status: 'borrowed',
    duration: 7,
    totalCost: 140000,
    purpose: 'Research project on smart home automation',
    groupId: 2,
    groupName: 'IoT Project Team',
    notes: 'Currently using for research'
  },
  {
    id: 3,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Professional IoT Kit',
    kitId: 3,
    rentalId: 'RENT-2024-003',
    borrowDate: '2024-05-10T11:00:00.000Z',
    dueDate: '2024-05-17T11:00:00.000Z',
    returnDate: null,
    status: 'overdue',
    duration: 7,
    totalCost: 350000,
    purpose: 'Advanced IoT development course',
    groupId: 3,
    groupName: 'Advanced Robotics',
    notes: 'Overdue - need to return soon'
  },
  {
    id: 4,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Raspberry Pi Kit',
    kitId: 2,
    rentalId: 'RENT-2024-004',
    borrowDate: '2024-04-20T08:30:00.000Z',
    dueDate: '2024-04-27T08:30:00.000Z',
    returnDate: '2024-04-25T15:45:00.000Z',
    status: 'returned',
    duration: 5,
    totalCost: 100000,
    purpose: 'Student project demonstration',
    groupId: 1,
    groupName: 'Group 1',
    notes: 'Early return - project completed'
  },
  {
    id: 5,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Robotics Kit',
    kitId: 4,
    rentalId: 'RENT-2024-005',
    borrowDate: '2024-04-15T14:00:00.000Z',
    dueDate: '2024-04-22T14:00:00.000Z',
    returnDate: '2024-04-25T10:20:00.000Z',
    status: 'returned',
    duration: 10,
    totalCost: 300000,
    purpose: 'Robotics workshop for students',
    groupId: 3,
    groupName: 'Advanced Robotics',
    notes: 'Late return - extended workshop'
  },
  {
    id: 6,
    lecturerEmail: 'lecturer@fpt.edu.vn',
    kitName: 'Professional IoT Kit',
    kitId: 3,
    rentalId: 'RENT-2024-006',
    borrowDate: '2024-05-05T13:15:00.000Z',
    dueDate: '2024-05-12T13:15:00.000Z',
    returnDate: null,
    status: 'borrowed',
    duration: 7,
    totalCost: 350000,
    purpose: 'IoT security research',
    groupId: 2,
    groupName: 'IoT Project Team',
    notes: 'Using for security testing'
  },
  {
    id: 7,
    lecturerEmail: 'iot.specialist@fpt.edu.vn',
    kitName: 'IoT Starter Kit',
    kitId: 1,
    rentalId: 'RENT-2024-007',
    borrowDate: '2024-04-18T09:00:00.000Z',
    dueDate: '2024-04-25T09:00:00.000Z',
    returnDate: '2024-04-26T11:30:00.000Z',
    status: 'returned',
    duration: 8,
    totalCost: 80000,
    purpose: 'IoT fundamentals course',
    groupId: 4,
    groupName: 'Smart Home IoT',
    notes: 'Late return - 1 day overdue'
  },
  {
    id: 8,
    lecturerEmail: 'iot.specialist@fpt.edu.vn',
    kitName: 'Advanced IoT Kit',
    kitId: 2,
    rentalId: 'RENT-2024-008',
    borrowDate: '2024-05-08T10:30:00.000Z',
    dueDate: '2024-05-15T10:30:00.000Z',
    returnDate: null,
    status: 'borrowed',
    duration: 7,
    totalCost: 140000,
    purpose: 'Environmental monitoring project',
    groupId: 5,
    groupName: 'Environmental Monitoring',
    notes: 'Currently deployed for data collection'
  },
  {
    id: 9,
    lecturerEmail: 'sensor.expert@fpt.edu.vn',
    kitName: 'Professional IoT Kit',
    kitId: 3,
    rentalId: 'RENT-2024-009',
    borrowDate: '2024-04-28T11:45:00.000Z',
    dueDate: '2024-05-05T11:45:00.000Z',
    returnDate: '2024-05-03T16:20:00.000Z',
    status: 'returned',
    duration: 5,
    totalCost: 250000,
    purpose: 'Sensor network research',
    groupId: 6,
    groupName: 'Industrial IoT',
    notes: 'Early return - research completed'
  },
  {
    id: 10,
    lecturerEmail: 'sensor.expert@fpt.edu.vn',
    kitName: 'Robotics Kit',
    kitId: 4,
    rentalId: 'RENT-2024-010',
    borrowDate: '2024-05-12T08:00:00.000Z',
    dueDate: '2024-05-19T08:00:00.000Z',
    returnDate: null,
    status: 'borrowed',
    duration: 7,
    totalCost: 210000,
    purpose: 'Industrial automation demo',
    groupId: 6,
    groupName: 'Industrial IoT',
    notes: 'Using for automation demonstration'
  }
];