# Electroland - Retail Electronics Sales Management

A comprehensive, multi-level management system designed to streamline the operations of a retail electronics business. This platform connects the central owner with multiple branches, partner companies, a distributed sales force, and end customers, creating a seamless and efficient ecosystem.

---

## Authors
- Saichand  avula
- Naman  
- Narayana  
- Hemasai  
- Jahnavi  

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [Usage](#usage)

---

## Project Overview
Electroland solves the common challenges faced by multi-branch retail businesses, such as lack of centralized control, poor coordination between suppliers and sellers, and inaccurate commission calculations.

The system provides dedicated dashboards and functionalities for five distinct user roles:

### Owner (Admin)
The system administrator, whose account must be created manually in the database to initialize the application. This user has complete control over the entire system, from creating branches and managing partner companies to approving products and setting prices. A key function of the owner is to recruit and create accounts for all other employees (Sales Managers, Salesmen).

### Company
Partner companies can submit new products for approval, manage their inventory, track orders from branches, and handle customer service tasks like complaints and reviews.

### Sales Manager
Manages the operations of a single branch, including ordering stock, managing the sales team, tracking branch-specific sales, and adjusting prices for loyal customers.

### Salesman
The front-line employee who can add new sales, check product stock, view their sales performance, and track their salary and commissions.

### Customer
Can log in to view past purchases, submit reviews, track complaints, and see special offers from the owner.

---

## Key Features
- **Role-Based Access Control:** Secure login and dedicated dashboards for each user role.  
- **Centralized Management:** The owner can oversee all branches, products, and user accounts.  
- **Product & Inventory System:** Companies can propose new products; managers can order stock.  
- **Automated Commission Logic:** Calculates 2% commission for salesmen and 1% for managers.  
- **Order Management:** Smooth flow for order placement and tracking.  
- **Customer Engagement Portal:** Customers can track history, reviews, and offers.  
- **Secure Authentication:** JWT-secured sessions.  
- **OTP Verification:** Email-based OTP using Nodemailer.

---

## Technology Stack
| Component | Technology |
|------------|-------------|
| Frontend | HTML, CSS, JavaScript |
| View Engine | EJS (Embedded JavaScript templates) |
| Backend | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas) |
| Authentication | JSON Web Tokens (JWT) |
| Email Service | Nodemailer |

---

## Project Structure
```
/
├── .env                  # Environment variables for email
├── index.js              # Main server entry point
├── connection.js         # MongoDB database connection setup
├── package.json          # Project dependencies
│
├── public/               # Static assets (CSS, images, frontend JS)
├── views/                # EJS templates for all user roles
├── models/               # Mongoose schemas for the database
├── controllers/          # Business logic for handling requests
├── routes/               # Express route definitions
├── middlewares/          # Custom middlewares (e.g., auth checks)
└── service/              # Services like JWT generation/verification
```

---

## Setup and Installation

### Prerequisites
- Node.js and npm installed  
- MongoDB Atlas account (or local MongoDB instance)  
- Access to insert records in your database manually  

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/electroland.git
   cd electroland
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Application:**
   Set up database connection, JWT secret, and email credentials as shown below.

4. **Manually Create the Owner Account:**
   Insert an Owner record manually into the MongoDB `employees` collection before starting the app.  
   Ensure the password is hashed as per your signup logic.

5. **Start the server:**
   ```bash
   npm start
   ```
   The app runs at: [http://localhost:8000](http://localhost:8000)

---

## Configuration

### 1. Database Connection
Edit `connection.js`:
```js
mongoose.connect("mongodb+srv://<user>:<password>@cluster-url/electrolandDB")
```

### 2. JWT Secret Key
In `service/auth.js`:
```js
const secret = "your-super-secret-key";
```

### 3. Environment Variables
Create a `.env` file:
```
EMAIL="your-email@gmail.com"
APP_PASSWORD="your-google-app-password"
```

---

## Usage
Once the server is running:

- **Home Page:** [http://localhost:8000](http://localhost:8000)  
- **Login Pages:** Separate portals for Employees, Companies, and Customers.  
- **System Initialization:** The Owner logs in first to create branches and employee accounts.

---
