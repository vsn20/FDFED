
- **Group ID:** 27  
- **Project Title:** Electroland - Retail Electronics Sales Management  
- **SPOC:** Saichand Avula, seshasaichand.a23@iiits.in, Roll No: S20230010031  

---

## Team Members & Roles

| Name | Roll No | Role |
|------|----------|------|
| Saichand Avula | S20230010031 | Team Lead / Backend Developer |
| Vuppala Sai Naman | S20230010262 | Frontend Developer |
| Narayana | S20230010059 | Database Manager |
| Hemasai | S20230010046 | API Integration & Testing |
| Jahnavi | S20230010209 | UI Designer & Documentation |

---

## How to Run (Local)

### Prerequisites
- Node.js and npm installed  
- MongoDB Atlas account or local MongoDB instance  
- Internet connection for email-based OTP (Nodemailer)  

### Steps
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/electroland.git
   cd electroland
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:  
   ```bash
   EMAIL="your-email@gmail.com"
   APP_PASSWORD="your-google-app-password"
   ```

4. Start MongoDB connection by editing `connection.js` with your MongoDB URI.

5. Insert an **Owner** account manually into the MongoDB `employees` collection.

6. Run the server:  
   ```bash
   npm start
   ```

7. Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Key Files and Functions

| File | Description |
|------|--------------|
| `/controllers/authController.js` | Handles login, signup, and JWT-based authentication. |
| `/controllers/validationController.js` | Manages server-side form validation and sanitization. |
| `/views/` | EJS templates for Owner, Company, Manager, Salesman, and Customer. |
| `/routes/employeeRoutes.js` | API endpoints for managing employees and branches. |
| `/service/auth.js` | Contains JWT token generation and verification logic. |
| `/public/js/dynamic.js` | Handles client-side dynamic rendering and AJAX updates. |

---

## Demo Link & Timestamps

🎥 **Video Reference:** [Click Here](https://drive.google.com/file/d/1wyd-1TX6Jk_rC9vHBPEA_enK3p1dqvJb/view?usp=drivesdk)

| Time Range | Section |
|-------------|----------|
| 0:00 – 0:10 | Title Slide |
| 0:10 – 1:37 | Architecture & Business Model |
| 1:38 – 3:07 | Form Validation |
| 3:08 – 4:20 | Dynamic HTML |
| 4:21 – 7:07 | Network Evidence |
| 7:08 – 8:17 | Contributions |
| 8:18 – 8:54 | Wrap-up & Updates |

---

## Evidence Locations

| Evidence Type | Path |
|----------------|------|
| Git Logs | `FDFED/git-logs.txt` |
| Test Plan | `FDFED/test_plan.md` |
| Network Evidence | `FDFED/Network_Evidence` |
| Form Validation Evidence | `FDFED/FormValidation_Evidence` |

---

## Notes
This project demonstrates end-to-end functionality for a retail electronics management system using Node.js, Express, MongoDB, and EJS.  
The architecture supports role-based dashboards, automated commission logic, and OTP-secured authentication.
