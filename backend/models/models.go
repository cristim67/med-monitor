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
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"uniqueIndex;not null"`
	GoogleID  string `gorm:"uniqueIndex"`
	Name      string
	Picture   string
	Role      UserRole // admin, doctor, patient
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Department struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"unique;not null"`
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

type Doctor struct {
	ID             uint `gorm:"primaryKey"` // Maps to User ID
	User           User `gorm:"foreignKey:ID"`
	DepartmentID   uint
	Department     Department `gorm:"foreignKey:DepartmentID"`
	Specialization string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

type Patient struct {
	ID          uint `gorm:"primaryKey"` // Maps to User ID
	User        User `gorm:"foreignKey:ID"`
	DateOfBirth *time.Time
	Gender      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

type Appointment struct {
	ID              uint `gorm:"primaryKey"`
	PatientID       uint
	Patient         Patient `gorm:"foreignKey:PatientID"`
	DoctorID        uint
	Doctor          Doctor `gorm:"foreignKey:DoctorID"`
	AppointmentDate time.Time
	Status          AppointmentStatus // Scheduled, Cancelled, Completed
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`
}

type Consultation struct {
	ID            uint `gorm:"primaryKey"`
	AppointmentID uint
	Appointment   Appointment `gorm:"foreignKey:AppointmentID"`
	Diagnosis     string
	Notes         string
	Date          time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt `gorm:"index"`
}

type Prescription struct {
	ID             uint `gorm:"primaryKey"`
	ConsultationID uint
	Consultation   Consultation `gorm:"foreignKey:ConsultationID"`
	Medication     string
	Dosage         string
	Status         PrescriptionStatus // Issued, Dispensed
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}
