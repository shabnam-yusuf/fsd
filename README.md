# Campus Clubs & Forums Management System 🎓

A complete, modern, responsive full-stack web application designed for universities and colleges to manage student clubs, forum memberships, event approvals, verified attendance, and extracurricular governance.

---

## ⚡ Super-Simple Beginner Quick Start (One Command Setup)

You only need **ONE terminal** in VS Code.

### Step 1: Install All Dependencies (Single Command)
Open the project root folder in your terminal and run:
```bash
npm install
```
*(This automatically installs all root, backend, and frontend dependencies in one go!)*

### Step 2: Seed the Database with Realistic Demo Data
```bash
npm run seed
```
*(This creates 6 active clubs, approved events, pending proposals, registrations, and accounts for all 3 roles).*

### Step 3: Start the Complete Application (Single Command)
```bash
npm run dev
```
*(This runs both the **Express Backend** on port `5000` and the **React Vite Frontend** on port `5173` together!)*

Now open your browser:
- **Web Application (Opens directly to Login)**: [http://localhost:5173](http://localhost:5173)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🍃 MongoDB Configuration Guide

### Option A: Local MongoDB (Default)
By default, the application connects to local MongoDB on your computer:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/campus_clubs_db
```
Ensure your MongoDB service is running.

### Option B: Free MongoDB Atlas (Cloud - Recommended for Beginners)
If you don't have MongoDB installed locally, you can use MongoDB's free cloud database:
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Click **Create a Deployment** and choose the **M0 Free Cluster**.
3. Under **Database Access**, create a user with a username and password (e.g. `admin` / `YourPassword123`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** ➔ **Drivers** (Node.js) and copy your connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/campus_clubs_db?retryWrites=true&w=majority
   ```
6. Open `.env` in the root folder (and `server/.env`) and paste your string:
   ```env
   MONGODB_URI=mongodb+srv://admin:YourPassword123@cluster0.abcde.mongodb.net/campus_clubs_db?retryWrites=true&w=majority
   ```
7. Run `npm run seed` and then `npm run dev`!

---

## 🔑 Demo Accounts (1-Click Login Ready)

When you open [http://localhost:5173](http://localhost:5173), the **Login Page** appears first. You can use the **1-Click Demo Switcher** buttons to test any role instantly, or use these credentials:

| Role | Name | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty Advisor** | Dr. Robert Harrison | `faculty@campus.edu` | `faculty123` | Endorse/approve event proposals, reject with reasons, monitor supervised clubs, view participation stats |
| **Club President (Tech)** | Sarah Jenkins | `president.tech@campus.edu` | `president123` | Manage GDSC club info, review member applications, propose events, mark attendance sheets, post announcements |
| **Club President (Arts)** | Liam Vance | `president.arts@campus.edu` | `president123` | Manage Design Collective, manage members, create events, broadcast pinned bulletins |
| **Student** | Alex Morgan | `student.alex@campus.edu` | `student123` | Browse clubs, request membership, 1-click register for events, view attendance rate and history |
| **Student** | Priya Sharma | `student.priya@campus.edu` | `student123` | Active member in clubs, registered events, check attendance |

---

## 👥 Role-Based Portals & Modules

### 1. 🎓 Student Experience
- **First Page**: Access the login page immediately upon opening the app.
- **Role Tabs**: Switch between Student, President, and Advisor login modes.
- **Forgot Password**: Modal with instant account recovery information.
- **Show/Hide Password**: Eye toggle for comfortable credential typing.
- **Student Registration**: Dedicated registration form with department and student ID fields.
- **Personalized Dashboard**: View joined clubs count, registered upcoming events count, and verified attendance percentage.
- **Clubs Directory**: Live search by name or keyword, and filter by category pills.
- **Membership Application**: Apply to join any club with an applicant statement; track pending status or withdraw.
- **Events Calendar**: Browse upcoming approved workshops and hackathons, 1-click register/unregister with seat capacity limits.
- **Verified Attendance History**: Academic record table showing status (**Present / Absent**) and remarks from club leadership.
- **Notifications**: Interactive notification bell with unread badge counter.

### 2. ⚡ Club President Experience
- **President Dashboard**: Total members, pending membership requests, events organized, and pending faculty approvals.
- **Club Information Management**: Edit club description, category, meeting cadence, banner image, and social links.
- **Members & Requests**: Review student applications, approve into general or core team, or decline with feedback reasons.
- **Event Proposals**: Create new event proposals (*Workshop, Hackathon, Seminar, Competition*) with date, time, venue, and capacity. Proposals enter `pending_approval` status and alert the assigned Faculty Advisor.
- **Rejection Handling**: View structured feedback from the Faculty Advisor, edit the event proposal, and re-submit.
- **Attendance Manager**: Select active event, view registered attendees, toggle **Present/Absent** individually or via batch actions (*All Present / All Absent*), add lead remarks, and save attendance to MongoDB.
- **Announcements**: Post announcements with priority flags (*urgent, important, normal*) and top-pinning; automatically notifies all approved club members.

### 3. 🛡️ Faculty Advisor Experience
- **Faculty Dashboard**: Supervised clubs count, pending event approval requests count, approved events count, and active student participant numbers.
- **Event Approvals Queue**: Review event proposals submitted by student clubs. **Approve Event** (instantly publishes it to students and campus calendar) or **Decline Event** with mandatory structured feedback sent to the President.
- **Supervised Clubs**: Overview of assigned clubs, president contact details, member count, and direct view of official student rosters.
- **Participation Analytics**: Live database aggregation of club engagement, comparative member progress bars, and attendance statistics.

---

## 🛠️ Technology Stack Summary

- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide React icons, React Router DOM v6, Axios
- **Backend**: Node.js, Express.js REST API, JWT authentication, bcryptjs password hashing
- **Database**: MongoDB with Mongoose ODM (unique compound indexes, virtual populate, schema validation)
- **Dev Workflow**: Single unified `package.json` at root powered by `concurrently`

---

## 📡 REST API Health & Verification

- Health Check Endpoint: `GET http://localhost:5000/api/health`
- Response:
```json
{
  "status": "online",
  "message": "Campus Clubs & Forums API is running smoothly",
  "database": {
    "status": "connected",
    "host": "127.0.0.1",
    "name": "campus_clubs_db"
  },
  "uptime": 12.45,
  "timestamp": "2026-11-03T14:40:06.227Z"
}
```
