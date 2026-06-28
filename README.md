# 🩸 HemoVault AI

<div align="center">
## 🎥 Project Demo

Watch the complete project demonstration here:

**▶️ https://youtu.be/DHl_9Apwuc4**
### Digital Blood Test Report Management System

**"Patients often spend valuable time waiting for printed blood test reports before they can begin treatment."**

A secure MERN Stack application that digitizes blood test reports, enabling patients, laboratories, doctors, and administrators to manage healthcare records efficiently.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

# 📖 Overview

HemoVault AI is a secure web application built using the MERN Stack to replace traditional paper-based blood test reports with a centralized digital platform.

The system enables patients to securely access their reports, laboratories to upload blood test results, doctors to review patient records, and administrators to manage the entire system through dedicated dashboards.

The goal is to improve accessibility, reduce paperwork, and simplify healthcare record management.
  
# 🚨 Problem Statement

Patients often spend valuable time waiting for printed blood test reports before they can begin treatment. Paper-based reports are difficult to manage, can be misplaced, and are not easily accessible during emergencies or follow-up consultations.

---

# 💡 Solution

HemoVault AI provides a secure digital platform that allows:

* Patients to access blood reports anytime.
* Laboratories to upload reports digitally.
* Doctors to review patient history efficiently.
* Administrators to manage users and medical records.

---

# ✨ Features

### 👤 Patient

* Secure Registration & Login
* Personal Dashboard
* View Blood Reports
* Download Reports
* Profile Management

### 🧪 Laboratory

* Laboratory Dashboard
* Upload Blood Reports
* Manage Patient Reports

### 🩺 Doctor

* Doctor Dashboard
* Access Patient Reports
* Review Medical History

### 🛡 Administrator

* Admin Dashboard
* User Management
* Report Management
* Audit Logs

---

# 🔐 Security Features

* JWT Authentication
* Password Encryption
* Protected Routes
* Role-Based Access Control
* Secure MongoDB Storage
* Environment Variable Configuration

---

# 🏗 System Architecture

```text
                Browser
                    │
            React + Vite Frontend
                    │
              REST API (Express)
                    │
              Node.js Backend
                    │
                 MongoDB
```

---

# 🔄 Application Workflow

```text
Patient Registration
        │
        ▼
Secure Login
        │
        ▼
Laboratory Uploads Report
        │
        ▼
Doctor Reviews Report
        │
        ▼
Patient Views & Downloads Report
```

---

# 💻 Technology Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication

* JWT

## Version Control

* Git
* GitHub

---

# 📂 Project Structure

```text
HemoVault-AI
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.jsx
│
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## Prerequisites

* Node.js
* MongoDB
* Git

## Clone Repository

```bash
git clone https://github.com/vinayaknili18626-dev/HemoVault-AI.git
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# ⚙ Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

# 🎯 Project Objectives

* Digitize blood test reports.
* Reduce dependency on paper records.
* Improve accessibility of medical information.
* Enable secure healthcare data management.
* Simplify report sharing between patients and healthcare providers.

---

# 🔮 Future Enhancements

* OCR-based Blood Report Scanner
* AI-assisted Report Analysis
* Email Notifications
* Mobile Application
* Appointment Scheduling
* Progressive Web App (PWA)
* Offline Report Access
* Multi-language Support

---

# 🤝 Contribution

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.

---

# 👨‍💻 Author

### Vinayak Nili

**B.Tech Computer Science Engineering**

**Full Stack Developer • MERN Stack • Java**

GitHub: https://github.com/vinayaknili8626-dev

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ❤️ Building Better Digital Healthcare Through Technology

**⭐ If you found this project helpful, consider giving it a Star on GitHub.**

</div>
