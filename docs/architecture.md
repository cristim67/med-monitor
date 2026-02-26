# Conceptual and Functional Modeling

## 1. Overview

This project aims to create a complex web application for monitoring a patient within a medical facility, including modules for scheduling, consultation, diagnosis, and treatment, as well as a prescription issuance and tracking system in relation to pharmacies.

## 2. Functional Modeling

### 2.1 Actors

- **Patient:** Schedules appointments, views consultation results, and prescriptions.
- **Doctor:** Manages consultations, establishes diagnosis, prescribes medications, and monitors patients.
- **Admin:** Manages the database of doctors, medical departments, and facilities.
- **Pharmacist (Extension):** Dispenses prescriptions and verifies their validity.

### 2.2 Workflow

1. **Scheduling:** The patient creates an appointment through the web interface with a specific department/doctor.
2. **Consultation and Diagnosis:** The doctor records specific data and diagnoses the condition during the visit.
3. **Treatment Issuance:** The doctor issues a prescription in the system. The prescription gets a status (Not Dispensed).
4. **Pharmaceutical Validation:** The prescription is fulfilled by the pharmacy (status changes to "Dispensed").

## 3. Technical Architecture (Principle Modeling)

We apply a Modern Client-Server architectural pattern (SPA Backend + REST API):

- **Frontend (Web UI client):** Developed with React (TypeScript), providing UI components for admin, doctor, and patient.
- **Backend (API Service):** Developed in **Go (Golang)** with the Gin framework, managing requests, routing, and integrating permission verification. It incorporates the **Casbin** system for authorization (RBAC - Role Based Access Control).
- **Database (Persistence):** Relational database on a **PostgreSQL** setup.
- **Development & Deployment:** Everything is orchestrated in an integrated Docker environment, easily triggered with `docker-compose`.

## 4. Database Models (Core Entities)

- **Users**: (Identifiers, access roles: admin, doctor, patient, pharmacist)
- **Departments/Medical Units**: (Specific units and departments of hospitals)
- **Doctors**: (Additional specializations of users)
- **Patients**: (Primary medical details, patient record)
- **Appointments**: (The scheduling link between patient and doctor)
- **Consultations / Medical Records**: (Visit results, medical history)
- **Prescriptions**: (Prescription issued by the doctor with details per pharmaceutical product and its dispensing status)
