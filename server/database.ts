import {
  Alert,
  AuditLog,
  EvidenceItem,
  ExamCentre,
  Incident,
  IoTDevice,
  Package,
  Paper,
  Question,
  SecurityPolicy,
  TransportRoute,
  User,
  UserRiskProfile,
} from '../src/types/index.ts';
import { blockchainService } from './blockchain.ts';
import { computePaperFingerprint, computeSha256, generateSecureQrPayload, getOrCreateKeypair, signPayload } from './crypto.ts';
import { iotService } from './iot.ts';

class Database {
  public users: Map<string, User> = new Map();
  public questions: Map<string, Question> = new Map();
  public papers: Map<string, Paper> = new Map();
  public packages: Map<string, Package> = new Map();
  public examCentres: Map<string, ExamCentre> = new Map();
  public transportRoutes: Map<string, TransportRoute> = new Map();
  public alerts: Map<string, Alert> = new Map();
  public incidents: Map<string, Incident> = new Map();
  public auditLogs: AuditLog[] = [];
  public userRiskProfiles: Map<string, UserRiskProfile> = new Map();
  public securityPolicy: SecurityPolicy = {
    authorizedAccessStartHour: 8,
    authorizedAccessEndHour: 19,
    maxFailedLoginsBeforeLock: 5,
    routeDeviationThresholdKm: 2.0,
    temperatureMaxCelsius: 38.0,
    temperatureMinCelsius: 10.0,
    shockThresholdG: 3.0,
    lightLuxThreshold: 100.0,
    mfaRequiredForConfidential: true,
    autoFreezeOnTamper: true,
  };

  constructor() {
    this.seedDatabase();
  }

  public seedDatabase() {
    this.users.clear();
    this.questions.clear();
    this.papers.clear();
    this.packages.clear();
    this.examCentres.clear();
    this.transportRoutes.clear();
    this.alerts.clear();
    this.incidents.clear();
    this.auditLogs = [];
    this.userRiskProfiles.clear();

    // 1. Seed Core Demo Users & 100 synthetic users
    this.seedUsers();

    // 2. Seed Question Bank
    this.seedQuestions();

    // 3. Seed Exam Centres & Routes
    this.seedCentresAndRoutes();

    // 4. Seed 50 Papers
    this.seedPapers();

    // 5. Seed 20 Packages
    this.seedPackages();

    // 6. Seed Alerts & Incidents
    this.seedAlertsAndIncidents();

    // 7. Seed Audit Logs
    this.seedAuditLogs();

    // 8. Seed User Risk Profiles
    this.seedUserRiskProfiles();
  }

  private seedUsers() {
    // Primary Demo Accounts
    const coreUsers: User[] = [
      {
        id: 'USR-001',
        name: 'Dr. Rajeshwar Sharma',
        email: 'admin@examshield.local',
        role: 'SUPER_ADMIN',
        department: 'National Examination Security Command',
        badgeNumber: 'ESC-ADMIN-01',
        status: 'ACTIVE',
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'USR-002',
        name: 'Prof. Ananya Sen',
        email: 'authority@examshield.local',
        role: 'EXAM_AUTHORITY',
        department: 'Question Formulation & Cryptographic Oversight',
        badgeNumber: 'ESC-AUTH-14',
        status: 'ACTIVE',
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'USR-003',
        name: 'Vikramaditya Verma',
        email: 'security@examshield.local',
        role: 'SECURITY_OFFICER',
        department: 'Physical & Cyber Operations',
        badgeNumber: 'ESC-SEC-89',
        status: 'ACTIVE',
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'USR-004',
        name: 'Rajinder Singh Gill',
        email: 'transport@examshield.local',
        role: 'TRANSPORT_OFFICER',
        department: 'Armored Fleet & Logistics Command',
        badgeNumber: 'ESC-LOG-302',
        status: 'ACTIVE',
        mfaEnabled: false,
        lastLogin: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'USR-005',
        name: 'Meenakshi Iyer',
        email: 'investigator@examshield.local',
        role: 'INVESTIGATOR',
        department: 'Forensic Intelligence & Threat Incident Response',
        badgeNumber: 'ESC-INV-55',
        status: 'ACTIVE',
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: 'USR-006',
        name: 'Harish Chandra',
        email: 'superintendent@examshield.local',
        role: 'CENTRE_SUPERINTENDENT',
        department: 'Examination Centre Operations (Delhi Central)',
        badgeNumber: 'ESC-SUP-101',
        status: 'ACTIVE',
        assignedCentreId: 'CTR-DEL-01',
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'USR-007',
        name: 'Pooja Nair',
        email: 'printing@examshield.local',
        role: 'PRINTING_OFFICER',
        department: 'High-Security Currency & Paper Press',
        badgeNumber: 'ESC-PRT-22',
        status: 'ACTIVE',
        mfaEnabled: true,
      },
      {
        id: 'USR-008',
        name: 'Karan Malhotra',
        email: 'auditor@examshield.local',
        role: 'AUDITOR',
        department: 'Independent Statutory Examination Audit Board',
        badgeNumber: 'ESC-AUD-07',
        status: 'ACTIVE',
        mfaEnabled: true,
      },
      {
        id: 'USR-009',
        name: 'Suresh Raina',
        email: 'paper@examshield.local',
        role: 'PAPER_MANAGER',
        department: 'Confidential Subject Cell',
        badgeNumber: 'ESC-MGR-33',
        status: 'ACTIVE',
        mfaEnabled: true,
      },
      {
        id: 'USR-010',
        name: 'Dinesh Karthik',
        email: 'storage@examshield.local',
        role: 'STORAGE_OFFICER',
        department: 'Vault Strongroom Operations',
        badgeNumber: 'ESC-STR-41',
        status: 'ACTIVE',
        mfaEnabled: false,
      },
      // High-risk insider demo account (Officer #382)
      {
        id: 'USR-382',
        name: 'Officer Pradeep Mathur',
        email: 'p.mathur@examshield.local',
        role: 'PAPER_MANAGER',
        department: 'Regional Archival Vault',
        badgeNumber: 'ESC-OFF-382',
        status: 'SUSPENDED',
        mfaEnabled: false,
        lastLogin: new Date(Date.now() - 600000).toISOString(),
      },
    ];

    coreUsers.forEach((u) => this.users.set(u.id, u));

    // Generate up to 100 realistic users across roles
    const roles: User['role'][] = [
      'PRINTING_OFFICER',
      'SECURITY_OFFICER',
      'TRANSPORT_OFFICER',
      'STORAGE_OFFICER',
      'CENTRE_SUPERINTENDENT',
      'INVESTIGATOR',
      'AUDITOR',
    ];
    const firstNames = ['Arun', 'Rohan', 'Sneha', 'Sunita', 'Dev', 'Farhan', 'Gurpreet', 'Nikhil', 'Priyanka', 'Aarti', 'Kavita', 'Sanjay'];
    const lastNames = ['Gupta', 'Patel', 'Reddy', 'Chatterjee', 'Banerjee', 'Bose', 'Chopra', 'Saxena', 'Deshmukh', 'Mishra'];

    for (let i = 11; i <= 100; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 3) % lastNames.length];
      const role = roles[i % roles.length];
      const id = `USR-${String(i).padStart(3, '0')}`;
      this.users.set(id, {
        id,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@examshield.local`,
        role,
        department: `Regional Division ${Math.floor(i / 10) + 1}`,
        badgeNumber: `ESC-${role.slice(0, 3)}-${100 + i}`,
        status: i === 13 ? 'LOCKED' : 'ACTIVE',
        mfaEnabled: i % 2 === 0,
        lastLogin: new Date(Date.now() - (i % 24) * 3600000).toISOString(),
      });
    }
  }

  private seedQuestions() {
    const rawQuestions = [
      {
        subject: 'Physics',
        topic: 'Electromagnetic Induction',
        difficulty: 'HARD',
        text: 'A circular coil of radius 0.05m having 500 turns is rotated about its vertical diameter with an angular frequency of 50 rad/s in a uniform horizontal magnetic field of 0.03T. Calculate the maximum induced EMF and the average power dissipated if total resistance is 10 ohms.',
        options: ['(A) 5.89V, 1.73W', '(B) 11.78V, 6.94W', '(C) 2.94V, 0.43W', '(D) 15.21V, 11.57W'],
        answer: '(B) 11.78V, 6.94W',
        marks: 4,
      },
      {
        subject: 'Physics',
        topic: 'Optics & Wave Motion',
        difficulty: 'MEDIUM',
        text: 'In a Young double slit experiment with monochromatic light of wavelength 600nm, the fringe width obtained on a screen 1.5m away is 1.8mm. If the entire apparatus is immersed in water of refractive index 4/3, what will be the new fringe width?',
        options: ['(A) 1.35 mm', '(B) 2.40 mm', '(C) 0.90 mm', '(D) 1.20 mm'],
        answer: '(A) 1.35 mm',
        marks: 4,
      },
      {
        subject: 'Chemistry',
        topic: 'Coordination Compounds',
        difficulty: 'HARD',
        text: 'For the complex [Co(NH3)5(SO4)]Br and [Co(NH3)5Br]SO4, identify the type of isomerism displayed and determine the number of unpaired electrons in the t2g and eg orbitals under strong crystal field splitting.',
        options: ['(A) Linkage Isomerism, 0 unpaired', '(B) Ionisation Isomerism, 0 unpaired', '(C) Coordination Isomerism, 4 unpaired', '(D) Solvate Isomerism, 2 unpaired'],
        answer: '(B) Ionisation Isomerism, 0 unpaired',
        marks: 4,
      },
      {
        subject: 'Chemistry',
        topic: 'Chemical Thermodynamics',
        difficulty: 'MEDIUM',
        text: 'One mole of an ideal gas expands isothermally and reversibly from 10 L to 100 L at 300 K. Calculate the change in entropy of the system and the surroundings in J/(K·mol).',
        options: ['(A) Delta S_sys = +19.14, Delta S_surr = -19.14', '(B) Delta S_sys = +38.28, Delta S_surr = 0', '(C) Delta S_sys = -19.14, Delta S_surr = +19.14', '(D) Delta S_sys = 0, Delta S_surr = 0'],
        answer: '(A) Delta S_sys = +19.14, Delta S_surr = -19.14',
        marks: 4,
      },
      {
        subject: 'Biology',
        topic: 'Genetics & Evolution',
        difficulty: 'HARD',
        text: 'In a cross between individuals with genotypes AaBb and aabb, the progeny exhibited 42% AaBb, 42% aabb, 8% Aabb, and 8% aaBb. Calculate the recombination frequency between loci A and B and determine if genes are linked.',
        options: ['(A) 16% Recombination frequency, Linked in Cis', '(B) 84% Recombination frequency, Independent', '(C) 8% Recombination frequency, Trans linkage', '(D) 50% Recombination frequency, Unlinked'],
        answer: '(A) 16% Recombination frequency, Linked in Cis',
        marks: 4,
      },
      {
        subject: 'Biology',
        topic: 'Human Physiology',
        difficulty: 'MEDIUM',
        text: 'During strenuous exercise, which physiological trigger causes the Bohr effect to shift the oxygen-hemoglobin dissociation curve to the right, thereby facilitating oxygen release in active muscles?',
        options: ['(A) Decreased pCO2 and increased pH', '(B) Increased 2,3-BPG, higher temperature, and decreased pH', '(C) Lower body temperature and increased pO2', '(D) Inactivation of carbonic anhydrase'],
        answer: '(B) Increased 2,3-BPG, higher temperature, and decreased pH',
        marks: 4,
      },
      {
        subject: 'Mathematics',
        topic: 'Calculus & Integration',
        difficulty: 'HARD',
        text: 'Evaluate the definite integral from 0 to pi of (x * sin(x)) / (1 + cos^2(x)) dx using Cauchy-Riemann symmetry properties.',
        options: ['(A) pi^2 / 4', '(B) pi^2 / 2', '(C) pi / 4', '(D) 2 * pi'],
        answer: '(A) pi^2 / 4',
        marks: 4,
      },
      {
        subject: 'Computer Science',
        topic: 'Cryptography & Data Security',
        difficulty: 'HARD',
        text: 'In an RSA cryptosystem with prime modulus p=61, q=53, and public exponent e=17, calculate the private decryption exponent d using the Extended Euclidean Algorithm.',
        options: ['(A) d = 2753', '(B) d = 3120', '(C) d = 1019', '(D) d = 1751'],
        answer: '(A) d = 2753',
        marks: 4,
      },
    ];

    for (let i = 0; i < 40; i++) {
      const template = rawQuestions[i % rawQuestions.length];
      const qId = `QST-${String(i + 1).padStart(4, '0')}`;
      this.questions.set(qId, {
        id: qId,
        subject: template.subject,
        topic: `${template.topic} - Sec ${Math.floor(i / 8) + 1}`,
        difficulty: template.difficulty as any,
        type: 'MCQ',
        text: i >= 8 ? `${template.text} (Variation Batch ${Math.floor(i / 8) + 1})` : template.text,
        options: template.options,
        answer: template.answer,
        marks: template.marks,
        confidentiality: 'TOP_SECRET',
        version: 1,
        status: 'APPROVED',
        author: 'Prof. Ananya Sen',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      });
    }
  }

  private seedCentresAndRoutes() {
    const centres: ExamCentre[] = [
      {
        id: 'CTR-DEL-01',
        name: 'Delhi Public Institute of Advanced Technology',
        code: 'DEL-8801',
        city: 'New Delhi',
        state: 'Delhi NCR',
        address: 'Sector 14, Dwarka, New Delhi 110075',
        coords: [28.5921, 77.046],
        capacity: 1200,
        superintendentName: 'Harish Chandra',
        contactNumber: '+91-11-2803-9901',
        securityScore: 96,
        activePackages: 3,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-NOI-02',
        name: 'Greater Noida Knowledge Park Examination Complex',
        code: 'NOI-9402',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        address: 'Plot 42, Knowledge Park III, Greater Noida 201308',
        coords: [28.4744, 77.4933],
        capacity: 1500,
        superintendentName: 'Dr. Sunil Kashyap',
        contactNumber: '+91-120-232-4411',
        securityScore: 68,
        activePackages: 2,
        status: 'HIGH_ALERT',
      },
      {
        id: 'CTR-JAI-03',
        name: 'Jaipur Central Collegiate Security Centre',
        code: 'JAI-3011',
        city: 'Jaipur',
        state: 'Rajasthan',
        address: 'JL Marg, Malviya Nagar, Jaipur 302017',
        coords: [26.8522, 75.8054],
        capacity: 950,
        superintendentName: 'Prof. R.S. Rathore',
        contactNumber: '+91-141-271-8822',
        securityScore: 94,
        activePackages: 1,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-CHD-04',
        name: 'Chandigarh Union Testing Arena',
        code: 'CHD-1601',
        city: 'Chandigarh',
        state: 'Punjab & Haryana',
        address: 'Sector 11, Chandigarh 160011',
        coords: [30.7628, 76.7865],
        capacity: 800,
        superintendentName: 'Simran Kaur Sandhu',
        contactNumber: '+91-172-274-1234',
        securityScore: 98,
        activePackages: 1,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-LKO-05',
        name: 'Lucknow Gomti Nagar Secured Test Facility',
        code: 'LKO-2201',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        address: 'Vipin Khand, Gomti Nagar, Lucknow 226010',
        coords: [26.8504, 80.9992],
        capacity: 1100,
        superintendentName: 'Alok Srivastava',
        contactNumber: '+91-522-230-7788',
        securityScore: 91,
        activePackages: 2,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-MUM-06',
        name: 'Mumbai Central High-Integrity Test Hub',
        code: 'MUM-4001',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'BKC Complex, Bandra East, Mumbai 400051',
        coords: [19.0657, 72.8687],
        capacity: 2000,
        superintendentName: 'Anil Deshmukh',
        contactNumber: '+91-22-2659-0011',
        securityScore: 95,
        activePackages: 2,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-BLR-07',
        name: 'Bengaluru Tech Corridors Assessment Center',
        code: 'BLR-5601',
        city: 'Bengaluru',
        state: 'Karnataka',
        address: 'Electronic City Phase 1, Bengaluru 560100',
        coords: [12.8452, 77.6602],
        capacity: 1800,
        superintendentName: 'V. Ramanathan',
        contactNumber: '+91-80-2852-9900',
        securityScore: 97,
        activePackages: 2,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-CHE-08',
        name: 'Chennai Anna Salai Examination Fortress',
        code: 'CHE-6001',
        city: 'Chennai',
        state: 'Tamil Nadu',
        address: 'Guindy Institutional Area, Chennai 600025',
        coords: [13.0067, 80.2206],
        capacity: 1400,
        superintendentName: 'K. Balasubramanian',
        contactNumber: '+91-44-2235-4422',
        securityScore: 93,
        activePackages: 1,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-KOL-09',
        name: 'Kolkata Salt Lake Testing Pavilion',
        code: 'KOL-7001',
        city: 'Kolkata',
        state: 'West Bengal',
        address: 'Sector V, Salt Lake, Kolkata 700091',
        coords: [22.5804, 88.4378],
        capacity: 1350,
        superintendentName: 'Subhasis Roy',
        contactNumber: '+91-33-2357-1199',
        securityScore: 89,
        activePackages: 1,
        status: 'ACTIVE',
      },
      {
        id: 'CTR-HYD-10',
        name: 'Hyderabad Cyberabad Examination Complex',
        code: 'HYD-5001',
        city: 'Hyderabad',
        state: 'Telangana',
        address: 'Gachibowli Stadium Enclave, Hyderabad 500032',
        coords: [17.4435, 78.3489],
        capacity: 1600,
        superintendentName: 'S. Narsimha Rao',
        contactNumber: '+91-40-2300-8811',
        securityScore: 96,
        activePackages: 2,
        status: 'ACTIVE',
      },
    ];

    centres.forEach((c) => this.examCentres.set(c.id, c));

    // Routes
    const routes: TransportRoute[] = [
      {
        id: 'RT-DEL-NOI',
        name: 'National Press -> Greater Noida Knowledge Park Corridor',
        sourceName: 'Central Currency Press, New Delhi',
        sourceCoords: [28.6139, 77.209],
        destinationName: 'Greater Noida Knowledge Park',
        destinationCoords: [28.4744, 77.4933],
        waypoints: [
          [28.6139, 77.209],
          [28.582, 77.31],
          [28.5355, 77.391],
          [28.498, 77.442],
          [28.4744, 77.4933],
        ],
        corridorToleranceKm: 2.0,
        estimatedDurationMins: 65,
      },
      {
        id: 'RT-DEL-JAI',
        name: 'Delhi Strongroom -> Jaipur Security Center',
        sourceName: 'Delhi Vault',
        sourceCoords: [28.6139, 77.209],
        destinationName: 'Jaipur Centre',
        destinationCoords: [26.8522, 75.8054],
        waypoints: [
          [28.6139, 77.209],
          [28.4089, 77.0378],
          [27.9135, 76.5387],
          [27.352, 76.124],
          [26.8522, 75.8054],
        ],
        corridorToleranceKm: 3.5,
        estimatedDurationMins: 240,
      },
    ];

    routes.forEach((r) => this.transportRoutes.set(r.id, r));
  }

  private seedPapers() {
    const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];
    const sets: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const statuses: Paper['status'][] = [
      'APPROVED',
      'PRINTED',
      'SEALED',
      'IN_TRANSIT',
      'IN_STORAGE',
      'RECEIVED',
      'DRAFT',
    ];

    for (let i = 1; i <= 50; i++) {
      const subject = subjects[i % subjects.length];
      const set = sets[i % sets.length];
      const paperCode = `NEET-DEMO-2027-${subject.slice(0, 3).toUpperCase()}-${set}`;
      const id = `PAP-${String(i).padStart(3, '0')}`;
      const status = i === 1 ? 'IN_TRANSIT' : statuses[i % statuses.length];

      const keypair = getOrCreateKeypair('EXAM_AUTHORITY', 'Prof. Ananya Sen');
      const hash = computePaperFingerprint({
        paperCode,
        examination: 'National Eligibility Security Demo Examination 2027',
        subject,
        year: 2027,
        set,
        version: 1,
        questions: Array.from(this.questions.values()).slice(0, 10),
      });

      const signature = signPayload(hash, keypair.privateKey);
      const qrPayload = generateSecureQrPayload('PAPER', id);

      const paper: Paper = {
        id,
        paperCode,
        examination: 'National Eligibility Security Demo Examination 2027',
        subject,
        year: 2027,
        set,
        version: 1,
        status,
        creator: 'Prof. Ananya Sen',
        creatorRole: 'EXAM_AUTHORITY',
        approver: 'Dr. Rajeshwar Sharma',
        approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
        hash,
        signature,
        publicKeyId: keypair.id,
        confidentialityLevel: 'TOP_SECRET',
        qrPayload,
        questionsCount: 45,
        totalMarks: 180,
        durationMinutes: 180,
        currentCustodian: i === 1 ? 'Rajinder Singh Gill (Transport Officer)' : 'Central Vault Strongroom',
        custodianRole: i === 1 ? 'TRANSPORT_OFFICER' : 'STORAGE_OFFICER',
        location: i === 1 ? 'Armored Carrier DL-1VB-9921 (En route Greater Noida)' : 'Central Strongroom Vault 3, Delhi',
        printCount: status === 'DRAFT' ? 0 : 5000,
        isTampered: false,
      };

      this.papers.set(id, paper);

      // Record first paper in blockchain ledger
      if (i <= 5) {
        blockchainService.recordEvent({
          paperId: id,
          actor: paper.creator,
          actorRole: paper.creatorRole,
          action: 'PAPER_CREATED_AND_FINGERPRINTED',
          location: 'National Command Center, New Delhi',
          device: 'SECURE-TERMINAL-01',
          eventData: {
            paperCode,
            hash,
            signature,
            questionsCount: 45,
          },
        });
      }
    }
  }

  private seedPackages() {
    for (let i = 1; i <= 20; i++) {
      const id = `ES-PKG-${82930 + i}`;
      const isTarget = i === 1; // Demo package ES-PKG-82931
      const isTampered = i === 7;
      const status: Package['status'] = isTampered
        ? 'TAMPER_LOCKED'
        : isTarget
        ? 'IN_TRANSIT'
        : i % 3 === 0
        ? 'SEALED'
        : i % 3 === 1
        ? 'IN_TRANSIT'
        : 'RECEIVED';

      const pkg: Package = {
        id,
        packageCode: id,
        paperIds: [`PAP-${String(i).padStart(3, '0')}`],
        sealId: `SEAL-CRYPTO-RFID-${90000 + i}`,
        sensorDeviceId: `IOT-BOX-${String(i).padStart(3, '0')}`,
        transportOfficerId: 'USR-004',
        transportOfficerName: 'Rajinder Singh Gill',
        sourceFacility: 'Central Government Security Printing Press, New Delhi',
        destinationCentreId: isTarget ? 'CTR-NOI-02' : 'CTR-DEL-01',
        destinationCentreName: isTarget
          ? 'Greater Noida Knowledge Park Examination Complex'
          : 'Delhi Public Institute of Advanced Technology',
        status,
        tamperState: isTampered ? 'BREACHED' : 'INTACT',
        currentLocation: {
          lat: isTarget ? 28.5355 : 28.5921,
          lng: isTarget ? 77.391 : 77.046,
          address: isTarget ? 'Noida-Greater Noida Expressway Km 14' : 'Dwarka Sector 14, New Delhi',
          speedKmh: isTarget ? 48 : 0,
        },
        routeId: 'RT-DEL-NOI',
        routeDeviationKm: isTarget ? 0.4 : 0.1,
        eta: '45 mins (On Schedule)',
        qrPayload: generateSecureQrPayload('PACKAGE', id),
        lastTelemetry: {
          temperature: 24.2,
          reedSwitch: isTampered ? 'OPEN' : 'CLOSED',
          lightLux: isTampered ? 480 : 0.2,
          shockG: 1.02,
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        sealedAt: new Date(Date.now() - 86400000).toISOString(),
      };

      this.packages.set(id, pkg);

      if (i <= 5) {
        blockchainService.recordEvent({
          packageId: id,
          actor: 'Vikramaditya Verma',
          actorRole: 'SECURITY_OFFICER',
          action: 'PACKAGE_SEALED_AND_DISPATCHED',
          location: pkg.sourceFacility,
          device: 'SEAL-STATION-A4',
          eventData: {
            packageCode: id,
            sealId: pkg.sealId,
            sensorId: pkg.sensorDeviceId,
            destination: pkg.destinationCentreName,
          },
        });
      }
    }
  }

  private seedAlertsAndIncidents() {
    const rawAlerts: Omit<Alert, 'id'>[] = [
      {
        alertCode: 'ALT-CRIT-9921',
        severity: 'CRITICAL',
        type: 'PACKAGE_TAMPER',
        title: 'Smart Container Magnetic Seal Breach Detected',
        description: 'Physical reed switch state transitioned to OPEN and ambient light sensor spiked to 480 Lux outside authorized drop-off zone.',
        affectedResource: { type: 'PACKAGE', id: 'ES-PKG-82937', label: 'Secure Exam Package ES-PKG-82937' },
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        location: 'Industrial Bypass Road, Sector 82 (2.8km off corridor)',
        actor: 'Unknown / Physical Intruder',
        actorRole: 'UNAUTHORIZED_ACTOR',
        status: 'INVESTIGATING',
        assignedInvestigator: 'Meenakshi Iyer',
        riskScore: 96,
        reasons: ['Magnetic seal opened', 'Ambient light exposure >400 Lux', 'Corridor departure of 2.8 km'],
      },
      {
        alertCode: 'ALT-HIGH-8812',
        severity: 'HIGH',
        type: 'GPS_DEVIATION',
        title: 'Armored Transport Corridor Departure Threshold Exceeded',
        description: 'Transport vehicle carrying NEET Paper Sets deviated 2.8 km away from the approved geo-corridor.',
        affectedResource: { type: 'PACKAGE', id: 'ES-PKG-82931', label: 'NEET Demo Set A Transport Batch' },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        location: 'Noida Expressway Exit 6',
        actor: 'Rajinder Singh Gill',
        actorRole: 'TRANSPORT_OFFICER',
        status: 'ACKNOWLEDGED',
        assignedInvestigator: 'Meenakshi Iyer',
        riskScore: 84,
        reasons: ['Deviation exceeded 2.0 km tolerance policy', 'Speed dropped to 0 km/h for 12 minutes'],
      },
      {
        alertCode: 'ALT-CRIT-7734',
        severity: 'CRITICAL',
        type: 'AI_ANOMALY',
        title: 'High-Risk Behavioral Anomaly & Unscheduled Access',
        description: 'Officer Pradeep Mathur accessed 14 confidential paper cryptographic repositories at 02:41 AM from an unregistered laptop.',
        affectedResource: { type: 'USER', id: 'USR-382', label: 'Officer Pradeep Mathur (ESC-OFF-382)' },
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        location: 'External Residential IP (103.21.244.82)',
        actor: 'Officer Pradeep Mathur',
        actorRole: 'PAPER_MANAGER',
        status: 'INVESTIGATING',
        assignedInvestigator: 'Meenakshi Iyer',
        riskScore: 92,
        reasons: [
          'Access at 02:41 AM UTC (Outside 08:00-19:00 window)',
          'Unknown Device Hardware Fingerprint',
          'Excessive bulk download velocity',
        ],
      },
      {
        alertCode: 'ALT-MED-4411',
        severity: 'MEDIUM',
        type: 'UNAUTHORIZED_LOGIN',
        title: 'Repeated Failed Biometric & Password Authentication',
        description: '5 consecutive failed credential attempts logged on Vault Access Portal.',
        affectedResource: { type: 'CENTRE', id: 'CTR-NOI-02', label: 'Greater Noida Centre Vault' },
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        location: 'Greater Noida Knowledge Park',
        actor: 'Unknown',
        actorRole: 'EXTERNAL',
        status: 'RESOLVED',
        riskScore: 54,
        reasons: ['Brute force lockout triggered after 5 attempts'],
      },
      {
        alertCode: 'ALT-HIGH-3399',
        severity: 'HIGH',
        type: 'DOCUMENT_SIMILARITY',
        title: 'Suspected Question Leak - High Semantic Overlap',
        description: 'Uploaded social media forum snapshot demonstrated 94.2% semantic similarity with active Set A Physics question.',
        affectedResource: { type: 'PAPER', id: 'PAP-001', label: 'NEET-DEMO-2027-PHY-A' },
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        location: 'Early-Warning Threat Crawler',
        actor: 'Automated AI Early Warning Module',
        actorRole: 'AI_SYSTEM',
        status: 'INVESTIGATING',
        assignedInvestigator: 'Meenakshi Iyer',
        riskScore: 88,
        reasons: ['Question 12 & 14 exact numerical match', 'Cosine vector convergence > 0.90'],
      },
    ];

    rawAlerts.forEach((a, idx) => {
      const id = `ALT-${1000 + idx}`;
      this.alerts.set(id, { id, ...a });
    });

    // Seed Incidents
    const inc1: Incident = {
      id: 'INC-2027-001',
      incidentCode: 'INC-2027-001',
      title: 'Active Investigation: Noida Corridor Breach & Container Physical Tampering',
      severity: 'CRITICAL',
      status: 'UNDER_INVESTIGATION',
      affectedPaperId: 'PAP-001',
      affectedPackageId: 'ES-PKG-82937',
      affectedUserId: 'USR-382',
      assignedInvestigator: 'Meenakshi Iyer (Lead Cyber Forensic Officer)',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      description:
        'Correlated threat event: Unscheduled vault access by Officer Mathur followed by anomalous route departure and physical smart box reed switch opening on Noida Expressway.',
      timeline: [
        {
          timestamp: '10:01 AM',
          title: 'Unscheduled Confidential Paper Access',
          description: 'User Pradeep Mathur queried PAP-001 from unapproved IP.',
          actor: 'Pradeep Mathur',
          severity: 'HIGH',
          location: 'Remote IP 103.21.244.82',
        },
        {
          timestamp: '10:04 AM',
          title: 'Unknown Hardware Footprint Logged',
          description: 'Device fingerprint did not match registered institutional TPM.',
          actor: 'Security Daemon',
          severity: 'MEDIUM',
          location: 'Remote Session',
        },
        {
          timestamp: '10:07 AM',
          title: 'Package Dispatched from Strongroom',
          description: 'Package ES-PKG-82937 scanned and handed over to logistics carrier.',
          actor: 'Vikramaditya Verma',
          severity: 'INFO',
          location: 'Delhi Central Vault',
        },
        {
          timestamp: '10:12 AM',
          title: 'GPS Geofence Corridor Deviation',
          description: 'Carrier diverted 2.8 km away from approved expressway corridor.',
          actor: 'IoT Telemetry Unit',
          severity: 'HIGH',
          location: 'Sector 82 Industrial Bypass',
        },
        {
          timestamp: '10:16 AM',
          title: 'Physical Magnetic Seal Breach Triggered',
          description: 'Reed switch opened; photodiode detected 480 Lux interior illumination.',
          actor: 'ESP32 Smart Sensor Enclave',
          severity: 'CRITICAL',
          location: 'Sector 82 Warehouse Perimeter',
        },
        {
          timestamp: '10:17 AM',
          title: 'Automated Quarantine & Incident Escalation',
          description: 'Platform locked package custody status and dispatched emergency response.',
          actor: 'ExamShield Incident Engine',
          severity: 'CRITICAL',
          location: 'National Command Center',
        },
      ],
      evidence: [
        {
          id: 'EVD-01',
          incidentId: 'INC-2027-001',
          name: 'IoT Sensor Telemetry Memory Dump.bin',
          type: 'SENSOR_DUMP',
          fileHash: computeSha256('IoT Sensor Dump Payload Binary 0x99281726'),
          timestamp: new Date(Date.now() - 7000000).toISOString(),
          uploadedBy: 'IoT Autonomous Daemon',
          sizeBytes: 2048576,
          verified: true,
          description: 'Unmodified EEPROM non-volatile sensor telemetry log recording light & reed switch delta.',
        },
        {
          id: 'EVD-02',
          incidentId: 'INC-2027-001',
          name: 'Cryptographic Document Fingerprint Delta.json',
          type: 'DOCUMENT_HASH',
          fileHash: computeSha256('Original Hash vs Current Hash Compare Vector'),
          timestamp: new Date(Date.now() - 6500000).toISOString(),
          uploadedBy: 'Meenakshi Iyer',
          sizeBytes: 12400,
          verified: true,
          description: 'Side-by-side SHA-256 digital fingerprint comparison report.',
        },
        {
          id: 'EVD-03',
          incidentId: 'INC-2027-001',
          name: 'GPS Telemetry Waypoint Vector.gpx',
          type: 'GPS_LOG',
          fileHash: computeSha256('GPX Route Deviation Log Noida Bypass'),
          timestamp: new Date(Date.now() - 6000000).toISOString(),
          uploadedBy: 'Fleet Logistics Server',
          sizeBytes: 512000,
          verified: true,
          description: 'Sub-second GPS coordinate sequence confirming corridor deviation.',
        },
      ],
      resolutionPlaybook: [
        'Freeze physical package ES-PKG-82937 status and revoke handover authorization tokens.',
        'Issue emergency hold order on paper batch PAP-001 (Set A) for Greater Noida Centre.',
        'Suspend credential access for Officer Pradeep Mathur (USR-382) across all vaults.',
        'Despatch Rapid Integrity Inspection Unit with hardware cryptographic key verifiers.',
        'Switch examination center to contingency reserve Paper Set C with fresh digital seals.',
        'Preserve all blockchain transaction hashes (Blocks #1 to #5) for judicial submission.',
      ],
      graphNodes: [
        { id: 'USR-382', label: 'Pradeep Mathur (Paper Mgr)', type: 'USER', risk: 92 },
        { id: 'DEV-UNKNOWN', label: 'Unknown Device (MAC 8A:4F)', type: 'DEVICE', risk: 88 },
        { id: 'PAP-001', label: 'NEET Set A (PAP-001)', type: 'PAPER', risk: 85 },
        { id: 'PKG-82937', label: 'Exam Box ES-PKG-82937', type: 'PACKAGE', risk: 96 },
        { id: 'LOC-BYPASS', label: 'Noida Sec 82 Bypass', type: 'LOCATION', risk: 90 },
        { id: 'EVT-OPEN', label: 'Physical Breach Event', type: 'EVENT', risk: 98 },
        { id: 'ALT-CRIT', label: 'Critical Tamper Alert', type: 'ALERT', risk: 96 },
      ],
      graphEdges: [
        { from: 'USR-382', to: 'DEV-UNKNOWN', label: 'Logged in from' },
        { from: 'DEV-UNKNOWN', to: 'PAP-001', label: 'Queried metadata' },
        { from: 'PAP-001', to: 'PKG-82937', label: 'Packaged into' },
        { from: 'PKG-82937', to: 'LOC-BYPASS', label: 'Deviated to' },
        { from: 'LOC-BYPASS', to: 'EVT-OPEN', label: 'Opened at' },
        { from: 'EVT-OPEN', to: 'ALT-CRIT', label: 'Triggered' },
      ],
    };

    this.incidents.set(inc1.id, inc1);
  }

  private seedAuditLogs() {
    const actions = [
      'USER_LOGIN_SUCCESS',
      'PAPER_METADATA_ACCESSED',
      'CRYPTOGRAPHIC_HASH_VERIFIED',
      'DIGITAL_SIGNATURE_VALIDATED',
      'QR_CODE_SCANNED',
      'PACKAGE_TELEMETRY_RECORDED',
      'TWO_PARTY_HANDOVER_EXECUTED',
      'IMMUTABLE_LEDGER_BLOCK_COMMITTED',
      'AI_ANOMALY_EVALUATION_COMPLETED',
      'SECURITY_POLICY_AUDITED',
    ];

    const users = Array.from(this.users.values());

    for (let i = 1; i <= 150; i++) {
      const u = users[i % users.length];
      const action = actions[i % actions.length];
      const isDenied = i === 13 || i === 47;

      this.auditLogs.unshift({
        id: `AUD-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - (150 - i) * 300000).toISOString(),
        userId: u.id,
        userName: u.name,
        userRole: u.role,
        action: isDenied ? `${action}_DENIED` : action,
        resourceType: i % 2 === 0 ? 'PAPER' : 'PACKAGE',
        resourceId: i % 2 === 0 ? `PAP-00${(i % 50) + 1}` : `ES-PKG-${82930 + (i % 20) + 1}`,
        ipAddress: `10.142.${Math.floor(i / 10)}.${(i % 50) + 10}`,
        deviceFingerprint: `FINGERPRINT-SHA256-${computeSha256(`DEV-${u.id}-${i}`).slice(0, 12)}`,
        location: u.assignedCentreId ? 'Centre Precinct' : 'National Command HQ, New Delhi',
        status: isDenied ? 'DENIED' : 'SUCCESS',
        details: {
          protocol: 'TLSv1.3',
          cipherSuite: 'TLS_AES_256_GCM_SHA384',
          sessionValidity: 'VALID',
        },
      });
    }
  }

  private seedUserRiskProfiles() {
    // High risk insider
    this.userRiskProfiles.set('USR-382', {
      userId: 'USR-382',
      userName: 'Officer Pradeep Mathur',
      role: 'PAPER_MANAGER',
      riskScore: 92,
      riskLevel: 'CRITICAL',
      factors: {
        accessAnomaly: 91,
        timeAnomaly: 83,
        deviceAnomaly: 77,
        locationAnomaly: 64,
        downloadAnomaly: 95,
      },
      recentViolations: [
        'Confidential paper access outside authorized operations window (02:41 AM UTC)',
        'Access request originated from unregistered or untrusted hardware footprint',
        'Unusual bulk download volume (14 protected cryptographic assets extracted)',
        'Multiple consecutive authentication failures (4 attempts logged)',
      ],
      lastAssessed: new Date().toISOString(),
      status: 'SUSPENDED',
    });

    // Medium risk transport driver
    this.userRiskProfiles.set('USR-004', {
      userId: 'USR-004',
      userName: 'Rajinder Singh Gill',
      role: 'TRANSPORT_OFFICER',
      riskScore: 48,
      riskLevel: 'MEDIUM',
      factors: {
        accessAnomaly: 20,
        timeAnomaly: 35,
        deviceAnomaly: 15,
        locationAnomaly: 68,
        downloadAnomaly: 10,
      },
      recentViolations: [
        'Vehicle route deviation beyond 2.0 km corridor tolerance near Noida Expressway',
      ],
      lastAssessed: new Date().toISOString(),
      status: 'MONITORED',
    });

    // Low risk admin
    this.userRiskProfiles.set('USR-001', {
      userId: 'USR-001',
      userName: 'Dr. Rajeshwar Sharma',
      role: 'SUPER_ADMIN',
      riskScore: 12,
      riskLevel: 'LOW',
      factors: {
        accessAnomaly: 10,
        timeAnomaly: 8,
        deviceAnomaly: 5,
        locationAnomaly: 5,
        downloadAnomaly: 12,
      },
      recentViolations: [],
      lastAssessed: new Date().toISOString(),
      status: 'NORMAL',
    });
  }
}

export const db = new Database();
