#  JanSetu

### AI-Powered Citizen Infrastructure Request & Decision Support Platform

JanSetu is a multilingual digital platform designed to connect **citizens with government decision-makers** by collecting infrastructure-related requests and transforming citizen feedback into meaningful insights.

The platform uses **AI, demographic data, infrastructure indicators, and citizen requests** to identify demand hotspots and help policymakers prioritize infrastructure projects.

Website Preview
https://jansetucitizen-govt.netlify.app/login
---

## 🚀 Key Features

### 👤 Citizen Portal

* Secure citizen login
* Submit infrastructure requests and complaints
* Submit requests using **text or voice**
* Track submitted requests
* View request status and updates
* Multilingual support
* View nearby and relevant infrastructure information

### 🏛️ Government Dashboard

* Government employee login
* Overview of citizen requests
* Request management and monitoring
* **Demand hotspot analysis**
* Region-wise request analysis
* AI-powered project recommendations
* Infrastructure priority insights
* Project monitoring
* Impact analysis
* Data source management

### 🤖 AI-Powered Analysis

JanSetu analyzes citizen feedback and infrastructure-related data to help identify:

* High-demand regions
* Infrastructure gaps
* Priority areas
* Recurring citizen needs
* Potential infrastructure projects

The AI insights are designed to **support government decision-making**, while final decisions remain with authorized policymakers.

---

## 🔄 How JanSetu Works

```text
Citizen
   ↓
Submit Request
(Text / Voice)
   ↓
JanSetu Platform
   ↓
Data Processing & Analysis
   ↓
AI Analysis
   ↓
Demand Hotspots
   ↓
Priority Recommendations
   ↓
Government Dashboard
   ↓
Infrastructure Planning
   ↓
Project Implementation
   ↓
Impact Monitoring
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* REST APIs

### Database & Services

* Supabase
* Authentication
* Database
* Data storage

### Maps & Geocoding

* Leaflet and React-Leaflet with OpenStreetMap tiles
* Nominatim address search and reverse geocoding

The location picker submits searches only when the citizen presses Search and serializes Nominatim requests at approximately one request per second. The browser supplies its normal User-Agent and page Referer; browser JavaScript cannot set a custom User-Agent header. Set the optional, public contact address `VITE_NOMINATIM_EMAIL` in the frontend environment to include it in Nominatim requests. For larger-scale use, follow the current [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) and consider an approved proxy or hosted geocoding provider with a suitable service policy. No Google Maps services or API keys are used.

### AI

* Generative AI
* Natural Language Processing
* Citizen feedback analysis
* Recommendation system

---

## 📂 Project Structure

```text
JanSetu/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── citizen/
│   │   └── government/
│   ├── layouts/
│   ├── services/
│   ├── assets/
│   └── App.tsx
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/HimaniPanigrahy286/JanSetu.git
```

### 2. Navigate to the project

```bash
cd JanSetu
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

---

## 👥 Team — NextGen Builders

| Role                    | Member   |
| ----------------------- | -------- |
| 🎨 Frontend Development | Ankita   |
| ⚙️ Backend Development  | Himani   |
| 🤖 AI Development       | Trishala |

### Team

**NextGen Builders**

A student developer team building technology-driven solutions for real-world public infrastructure challenges.

---

## 🎯 Project Objective

The objective of JanSetu is to create a scalable digital public infrastructure platform that can:

* Give citizens a simple way to communicate their infrastructure needs
* Convert citizen feedback into structured data
* Identify infrastructure demand hotspots
* Provide AI-assisted recommendations
* Help policymakers understand regional infrastructure requirements
* Improve transparency and citizen participation

---

## 🌍 Vision

> **Connecting citizens, data, and decision-makers to build better infrastructure.**

JanSetu aims to make infrastructure planning more **citizen-centric, data-driven, inclusive, and transparent**.

---

## 📌 Project Status

🚧 **Currently under development**

This project is being developed as part of a student innovation/hackathon project.

---

## 📜 License

This project is intended for educational, innovation, and hackathon purposes.
