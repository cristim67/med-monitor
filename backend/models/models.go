package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin   UserRole = "admin"
	RoleDoctor  UserRole = "doctor"
	RolePatient UserRole = "patient"

	RFC3339NoNano = "2006-01-02T15:04:05Z07:00"
)

type AppointmentStatus string

const (
	StatusScheduled AppointmentStatus = "Scheduled"
	StatusCancelled AppointmentStatus = "Cancelled"
	StatusCompleted AppointmentStatus = "Completed"
)

type PrescriptionStatus string

const (
	StatusIssued    PrescriptionStatus = "Issued"
	StatusDispensed PrescriptionStatus = "Dispensed"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	GoogleID  string         `gorm:"uniqueIndex" json:"google_id"`
	Name      string         `json:"name"`
	Picture   string         `json:"picture"`
	Role      UserRole       `json:"role"` // admin, doctor, patient
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Department struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"unique;not null" json:"name"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Doctor struct {
	ID             uint           `gorm:"primaryKey" json:"id"` // Maps to User ID
	User           User           `gorm:"foreignKey:ID" json:"user"`
	DepartmentID   uint           `json:"department_id"`
	Department     Department     `gorm:"foreignKey:DepartmentID" json:"department"`
	Specialization string         `json:"specialization"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type Patient struct {
	ID          uint           `gorm:"primaryKey" json:"id"` // Maps to User ID
	User        User           `gorm:"foreignKey:ID" json:"user"`
	DateOfBirth *time.Time     `json:"date_of_birth"`
	Gender      string         `json:"gender"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Appointment struct {
	ID              uint              `gorm:"primaryKey" json:"id"`
	PatientID       uint              `json:"patient_id"`
	Patient         Patient           `gorm:"foreignKey:PatientID" json:"patient"`
	DoctorID        uint              `json:"doctor_id"`
	Doctor          Doctor            `gorm:"foreignKey:DoctorID" json:"doctor"`
	AppointmentDate time.Time         `json:"appointment_date"`
	Status          AppointmentStatus `json:"status"` // Scheduled, Cancelled, Completed
	CreatedAt       time.Time         `json:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at"`
	DeletedAt       gorm.DeletedAt    `gorm:"index" json:"-"`
}

type Consultation struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	AppointmentID uint           `json:"appointment_id"`
	Appointment   Appointment    `gorm:"foreignKey:AppointmentID" json:"appointment"`
	Diagnosis     string         `json:"diagnosis"`
	Notes         string         `json:"notes"`
	Date          time.Time      `json:"date"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Prescription struct {
	ID             uint               `gorm:"primaryKey" json:"id"`
	ConsultationID uint               `json:"consultation_id"`
	Consultation   Consultation       `gorm:"foreignKey:ConsultationID" json:"consultation"`
	Medication     string             `json:"medication"`
	Dosage         string             `json:"dosage"`
	Status         PrescriptionStatus `json:"status"` // Issued, Dispensed
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
	DeletedAt      gorm.DeletedAt     `gorm:"index" json:"-"`
}
