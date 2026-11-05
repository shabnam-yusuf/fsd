const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Club = require('../models/Club');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_clubs_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at', mongoUri);

    // Drop existing database to ensure clean schema and remove any legacy indexes
    console.log('[Seed] Dropping old database & indexes...');
    await mongoose.connection.db.dropDatabase();

    console.log('[Seed] Creating demo users...');
    // 1. Faculty Advisor
    const faculty = await User.create({
      name: 'Dr. Robert Harrison',
      email: 'faculty@campus.edu',
      password: 'faculty123',
      role: 'faculty_advisor',
      department: 'Computer Science & Engineering',
      studentId: 'FAC-ENG-101',
      phone: '+1 (555) 234-8901',
      bio: 'Faculty Advisor overseeing technical and student cultural forums. Passionate about empowering student leadership.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    });

    // 2. Club Presidents
    const presidentTech = await User.create({
      name: 'Sarah Jenkins',
      email: 'president.tech@campus.edu',
      password: 'president123',
      role: 'club_president',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2023-8821',
      phone: '+1 (555) 345-6712',
      bio: 'Final year CS major, president of Google Developer Student Club. Building scalable student tech solutions.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    });

    const presidentArts = await User.create({
      name: 'Liam Vance',
      email: 'president.arts@campus.edu',
      password: 'president123',
      role: 'club_president',
      department: 'Visual Arts & Media',
      studentId: 'STU-2023-9014',
      phone: '+1 (555) 456-7823',
      bio: 'President of Design & Creative Arts Forum. Creative technologist and UI/UX enthusiast.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    });

    // 3. Students
    const studentAlex = await User.create({
      name: 'Alex Morgan',
      email: 'student.alex@campus.edu',
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU-2024-1102',
      phone: '+1 (555) 567-8934',
      bio: 'Junior CS student passionate about full-stack web engineering, algorithms, and open source development.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    });

    const studentPriya = await User.create({
      name: 'Priya Sharma',
      email: 'student.priya@campus.edu',
      password: 'student123',
      role: 'student',
      department: 'Electronics & Communication',
      studentId: 'STU-2024-3409',
      phone: '+1 (555) 678-9045',
      bio: 'Design enthusiast & IoT tinkerer. Loves participating in creative hackathons and collegiate forums.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    });

    const studentMarcus = await User.create({
      name: 'Marcus Chen',
      email: 'student.marcus@campus.edu',
      password: 'student123',
      role: 'student',
      department: 'Mechanical Engineering',
      studentId: 'STU-2024-5541',
      phone: '+1 (555) 789-0156',
      bio: 'Freshman curious about robotics, automotive tech, and collegiate public debates.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    });

    console.log('[Seed] Creating clubs...');
    // Clubs
    const gdscClub = await Club.create({
      name: 'Google Developer Student Club (GDSC)',
      slug: 'gdsc-coding-society',
      tagline: 'Connect, Learn, and Grow with fellow student developers.',
      description: 'The premier developer community on campus. We host weekly hands-on workshops on full-stack web, mobile, artificial intelligence, cloud computing, competitive programming challenges, and our annual flagship hackathon.',
      category: 'Technical',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      presidentId: presidentTech._id,
      facultyAdvisorId: faculty._id,
      foundedYear: 2021,
      meetingSchedule: 'Every Wednesday at 4:30 PM in Tech Lab B-204',
      contactEmail: 'gdsc@campus.edu',
      socialLinks: {
        website: 'https://gdsc.campus.edu',
        instagram: '@gdsc_campus',
        github: 'github.com/gdsc-campus',
        linkedin: 'linkedin.com/company/gdsc-campus',
      },
      tags: ['Web Dev', 'AI & ML', 'Cloud', 'Algorithms', 'Hackathons'],
      status: 'active',
    });

    const artsClub = await Club.create({
      name: 'Design & Creative Arts Collective',
      slug: 'design-creative-arts',
      tagline: 'Transforming ideas into captivating visual experiences.',
      description: 'A vibrant collective for UI/UX creators, digital artists, graphic designers, and photographers. We conduct design sprints, Figma masterclasses, portfolio critique sessions, and campus-wide art exhibitions.',
      category: 'Cultural',
      logo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      presidentId: presidentArts._id,
      facultyAdvisorId: faculty._id,
      foundedYear: 2022,
      meetingSchedule: 'Every Thursday at 5:00 PM in Studio Hall 3',
      contactEmail: 'design@campus.edu',
      socialLinks: {
        website: 'https://design.campus.edu',
        instagram: '@campus_designers',
        linkedin: 'linkedin.com/company/campus-design',
      },
      tags: ['UI/UX', 'Figma', 'Graphic Design', 'Visual Arts', 'Digital Media'],
      status: 'active',
    });

    const roboticsClub = await Club.create({
      name: 'Robotics & Autonomous Systems Forum',
      slug: 'robotics-autonomous-forum',
      tagline: 'Building the robots and autonomous machines of tomorrow.',
      description: 'Dedicated to hands-on mechatronics, microcontrollers, ROS robotics, drone mechanics, and combat robot tournaments.',
      category: 'Technical',
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      presidentId: presidentTech._id,
      facultyAdvisorId: faculty._id,
      foundedYear: 2020,
      meetingSchedule: 'Tuesdays & Fridays at 5:30 PM in Robotics Bay 1',
      contactEmail: 'robotics@campus.edu',
      tags: ['Robotics', 'ROS', 'Arduino', 'Drones', 'Hardware'],
      status: 'active',
    });

    const debateClub = await Club.create({
      name: 'Literary & Parliamentary Debating Society',
      slug: 'literary-debating-society',
      tagline: 'Where ideas collide and articulacy leads the way.',
      description: 'Host of annual inter-collegiate British Parliamentary debates, poetry slams, Model United Nations conferences, and creative writing seminars.',
      category: 'Literary',
      logo: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      presidentId: presidentArts._id,
      facultyAdvisorId: faculty._id,
      foundedYear: 2019,
      meetingSchedule: 'Mondays at 4:00 PM in Humanities Auditorium',
      contactEmail: 'debate@campus.edu',
      tags: ['Debate', 'Public Speaking', 'Model UN', 'Literature'],
      status: 'active',
    });

    const sportsClub = await Club.create({
      name: 'Campus Athletics & Sports League',
      slug: 'campus-athletics-sports',
      tagline: 'Excellence in athletic spirit, team sports, and fitness.',
      description: 'Organizing intra-university championships across Football, Basketball, Volleyball, Track & Field, and Badminton.',
      category: 'Sports',
      logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
      presidentId: presidentTech._id,
      facultyAdvisorId: faculty._id,
      foundedYear: 2018,
      meetingSchedule: 'Saturdays at 7:00 AM at Campus Sports Arena',
      contactEmail: 'sports@campus.edu',
      tags: ['Football', 'Basketball', 'Fitness', 'Tournaments'],
      status: 'active',
    });

    const ecellClub = await Club.create({
      name: 'E-Cell: Entrepreneurship & Venture Hub',
      slug: 'ecell-entrepreneurship-hub',
      tagline: 'Fostering the next generation of founders and ventures.',
      description: 'Connecting student innovators with venture capital mentors, startup incubators, pitch competitions, and angel investors.',
      category: 'Entrepreneurship',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=200&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
      presidentId: presidentArts._id,
      facultyAdvisorId: faculty._id,
      foundedYear: 2021,
      meetingSchedule: 'Fridays at 3:30 PM in Incubation Centre',
      contactEmail: 'ecell@campus.edu',
      tags: ['Startups', 'Venture Capital', 'Pitching', 'Leadership'],
      status: 'active',
    });

    console.log('[Seed] Creating memberships...');
    // Alex memberships
    await Membership.create({
      clubId: gdscClub._id,
      studentId: studentAlex._id,
      role: 'core_team',
      status: 'approved',
      joinReason: 'Passionate about full-stack web and excited to help mentor juniors.',
      reviewedBy: presidentTech._id,
      reviewedAt: new Date(),
    });

    await Membership.create({
      clubId: artsClub._id,
      studentId: studentAlex._id,
      role: 'member',
      status: 'pending',
      joinReason: 'Looking to learn Figma and design better web user experiences.',
    });

    // Priya memberships
    await Membership.create({
      clubId: artsClub._id,
      studentId: studentPriya._id,
      role: 'member',
      status: 'approved',
      joinReason: 'Excited about branding, graphics and typography.',
      reviewedBy: presidentArts._id,
      reviewedAt: new Date(),
    });

    await Membership.create({
      clubId: gdscClub._id,
      studentId: studentPriya._id,
      role: 'member',
      status: 'approved',
      joinReason: 'Interested in IoT microcontrollers and AI integration.',
      reviewedBy: presidentTech._id,
      reviewedAt: new Date(),
    });

    // Marcus memberships
    await Membership.create({
      clubId: gdscClub._id,
      studentId: studentMarcus._id,
      role: 'member',
      status: 'pending',
      joinReason: 'Freshman eager to join coding study groups.',
    });

    console.log('[Seed] Creating events...');
    // Event 1: Approved & Upcoming (GDSC)
    const event1 = await Event.create({
      title: 'Full-Stack Modern Web & Cloud Architecture Summit',
      description: 'Deep dive into modern web architectures: React 19, Node microservices, containerization with Docker, and cloud deployments. Includes live coding labs and Q&A with industry tech leads.',
      clubId: gdscClub._id,
      category: 'Workshop',
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      venue: 'Auditorium 1 & Virtual Live Stream',
      locationType: 'hybrid',
      meetingLink: 'https://meet.google.com/xyz-gdsc-tech',
      bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      capacity: 120,
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      tags: ['React', 'Node.js', 'Cloud', 'Architecture'],
      status: 'approved',
      isPublished: true,
      submittedBy: presidentTech._id,
      reviewedBy: faculty._id,
      approvalDate: new Date(),
    });

    // Event 2: Approved & Upcoming (Design)
    const event2 = await Event.create({
      title: 'UI/UX Design Sprint & Figma Design Systems Masterclass',
      description: 'Learn modern design tokens, auto-layout, interactive prototypes, and atomic design systems. Participants will design and test a mobile app flow from scratch.',
      clubId: artsClub._id,
      category: 'Workshop',
      eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '02:00 PM',
      endTime: '05:30 PM',
      venue: 'Design Studio Lab 4',
      locationType: 'on_campus',
      bannerImage: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1000&q=80',
      capacity: 60,
      tags: ['Figma', 'UI/UX', 'Design Systems'],
      status: 'approved',
      isPublished: true,
      submittedBy: presidentArts._id,
      reviewedBy: faculty._id,
      approvalDate: new Date(),
    });

    // Event 3: Pending Approval (Awaiting Faculty Review)
    const event3 = await Event.create({
      title: 'Autonomous Drone Racing & Computer Vision Showcase',
      description: 'Live outdoor autonomous drone speed trials, obstacle navigation using onboard OpenCV, and exhibition flights for college students.',
      clubId: roboticsClub._id,
      category: 'Competition',
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: '11:00 AM',
      endTime: '04:00 PM',
      venue: 'Central Campus Quadrangle',
      locationType: 'on_campus',
      bannerImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
      capacity: 200,
      tags: ['Drones', 'Computer Vision', 'Robotics', 'Hardware'],
      status: 'pending_approval',
      isPublished: false,
      submittedBy: presidentTech._id,
    });

    // Event 4: Past Approved Event with Attendance
    const eventPast = await Event.create({
      title: 'Hands-on Tailwind CSS & Component Systems Workshop',
      description: 'Foundations of utility-first CSS, responsive breakpoints, accessible UI components, and modern frontend styling patterns.',
      clubId: gdscClub._id,
      category: 'Workshop',
      eventDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      startTime: '03:00 PM',
      endTime: '06:00 PM',
      venue: 'Computer Center Room 102',
      locationType: 'on_campus',
      bannerImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      capacity: 80,
      tags: ['CSS', 'Tailwind', 'Frontend'],
      status: 'approved',
      isPublished: true,
      submittedBy: presidentTech._id,
      reviewedBy: faculty._id,
      approvalDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    });

    // Event 5: Rejected Event (with reason)
    const eventRejected = await Event.create({
      title: 'Overnight LAN & Esports Tournament',
      description: 'Overnight collegiate esports tournament spanning Friday night to Saturday morning.',
      clubId: sportsClub._id,
      category: 'Competition',
      eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      startTime: '09:00 PM',
      endTime: '06:00 AM',
      venue: 'Student Activity Complex',
      locationType: 'on_campus',
      capacity: 150,
      status: 'rejected',
      isPublished: false,
      submittedBy: presidentTech._id,
      reviewedBy: faculty._id,
      rejectionReason: 'Overnight events require prior written security approval from the Dean of Student Welfare and mandatory faculty chaperone presence.',
    });

    console.log('[Seed] Creating registrations & attendance...');
    // Registrations for Event 1 (Upcoming)
    await EventRegistration.create({
      eventId: event1._id,
      studentId: studentAlex._id,
      status: 'registered',
      attendanceStatus: 'pending',
    });

    await EventRegistration.create({
      eventId: event1._id,
      studentId: studentPriya._id,
      status: 'registered',
      attendanceStatus: 'pending',
    });

    // Registrations for Past Event
    await EventRegistration.create({
      eventId: eventPast._id,
      studentId: studentAlex._id,
      status: 'registered',
      attendanceStatus: 'present',
    });

    await EventRegistration.create({
      eventId: eventPast._id,
      studentId: studentPriya._id,
      status: 'registered',
      attendanceStatus: 'present',
    });

    await EventRegistration.create({
      eventId: eventPast._id,
      studentId: studentMarcus._id,
      status: 'registered',
      attendanceStatus: 'absent',
    });

    // Attendance records for Past Event
    await Attendance.create({
      eventId: eventPast._id,
      clubId: gdscClub._id,
      studentId: studentAlex._id,
      status: 'present',
      markedBy: presidentTech._id,
      remarks: 'Active participant during coding exercise',
    });

    await Attendance.create({
      eventId: eventPast._id,
      clubId: gdscClub._id,
      studentId: studentPriya._id,
      status: 'present',
      markedBy: presidentTech._id,
      remarks: 'Completed all responsive design tasks',
    });

    await Attendance.create({
      eventId: eventPast._id,
      clubId: gdscClub._id,
      studentId: studentMarcus._id,
      status: 'absent',
      markedBy: presidentTech._id,
      remarks: 'Did not check in at registration desk',
    });

    console.log('[Seed] Creating announcements...');
    await Announcement.create({
      clubId: gdscClub._id,
      authorId: presidentTech._id,
      title: '🚀 Fall Hackathon 2026 Team Registrations Open!',
      content: 'We are thrilled to announce that registration for CodeWave 2026 is officially live. Form your teams of 3-4 and start brainstorming your problem statements. Mentorship slots with top tech alumni are available.',
      priority: 'urgent',
      isPinned: true,
    });

    await Announcement.create({
      clubId: gdscClub._id,
      authorId: presidentTech._id,
      title: 'Weekly Tech Coffee & Open Source Office Hours',
      content: 'Have questions about your project or Git pull requests? Join the core team every Friday at 4 PM in Lab B-204 for casual coding and coffee.',
      priority: 'normal',
      isPinned: false,
    });

    await Announcement.create({
      clubId: artsClub._id,
      authorId: presidentArts._id,
      title: '🎨 Free Figma Education Licenses Dispatched',
      content: 'All approved members of the Design Collective have received Figma Education invite links in their college emails. Please verify your student status to activate your premium fonts and library features.',
      priority: 'important',
      isPinned: true,
    });

    console.log('[Seed] Creating notifications...');
    // Notifications for Faculty Advisor
    await Notification.create({
      recipientId: faculty._id,
      senderId: presidentTech._id,
      title: 'New Event Approval Request',
      message: 'Robotics Club submitted "Autonomous Drone Racing & Computer Vision Showcase" for your review and approval.',
      type: 'event_approval_request',
      link: '/dashboard/faculty/approvals',
      isRead: false,
    });

    // Notifications for Club President Tech
    await Notification.create({
      recipientId: presidentTech._id,
      senderId: studentMarcus._id,
      title: 'New Membership Request',
      message: 'Marcus Chen requested to join Google Developer Student Club (GDSC).',
      type: 'membership_request',
      link: '/dashboard/president/members',
      isRead: false,
    });

    await Notification.create({
      recipientId: presidentTech._id,
      senderId: faculty._id,
      title: 'Event Proposal Approved! 🎉',
      message: 'Faculty Advisor Dr. Robert Harrison approved your event "Full-Stack Modern Web & Cloud Architecture Summit".',
      type: 'event_approved',
      link: '/dashboard/president/events',
      isRead: true,
    });

    // Notifications for Student Alex
    await Notification.create({
      recipientId: studentAlex._id,
      senderId: presidentTech._id,
      title: 'Membership Approved!',
      message: 'Congratulations! Your membership for "Google Developer Student Club (GDSC)" has been approved as core team member.',
      type: 'membership_approved',
      link: '/dashboard/student/my-clubs',
      isRead: true,
    });

    await Notification.create({
      recipientId: studentAlex._id,
      title: 'Event Registration Confirmed',
      message: 'You are registered for "Full-Stack Modern Web & Cloud Architecture Summit". Venue: Auditorium 1.',
      type: 'event_registration',
      link: '/dashboard/student/events',
      isRead: false,
    });

    await Notification.create({
      recipientId: studentAlex._id,
      senderId: presidentTech._id,
      title: 'Attendance Marked',
      message: 'Your attendance for "Hands-on Tailwind CSS & Component Systems Workshop" has been marked as PRESENT.',
      type: 'attendance_marked',
      link: '/dashboard/student/attendance',
      isRead: false,
    });

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS READY FOR EVALUATION:');
    console.log('------------------------------------------------------');
    console.log('1. FACULTY ADVISOR:');
    console.log('   Email:    faculty@campus.edu');
    console.log('   Password: faculty123');
    console.log('------------------------------------------------------');
    console.log('2. CLUB PRESIDENT (Tech):');
    console.log('   Email:    president.tech@campus.edu');
    console.log('   Password: president123');
    console.log('------------------------------------------------------');
    console.log('3. CLUB PRESIDENT (Arts):');
    console.log('   Email:    president.arts@campus.edu');
    console.log('   Password: president123');
    console.log('------------------------------------------------------');
    console.log('4. STUDENT (Alex):');
    console.log('   Email:    student.alex@campus.edu');
    console.log('   Password: student123');
    console.log('------------------------------------------------------');
    console.log('5. STUDENT (Priya):');
    console.log('   Email:    student.priya@campus.edu');
    console.log('   Password: student123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
