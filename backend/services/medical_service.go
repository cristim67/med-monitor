package services

import (
	"time"

	"github.com/cristim67/med-monitor/backend/models"
	"github.com/cristim67/med-monitor/backend/repository"
)

type MedicalService interface {
	// Departments
	GetDepartments() ([]models.Department, error)
	CreateDepartment(name, desc string) error
	UpdateDepartment(id uint, name, desc string) error
	DeleteDepartment(id uint) error

	// Doctors
	GetDoctors() ([]models.Doctor, error)

	// Patients
	GetPatients() ([]models.Patient, error)
	GetPatient(id uint) (*models.Patient, error)

	// Appointments
	BookAppointment(patientID, doctorID uint, date string) (*models.Appointment, error)
	GetPatientAppointments(patientID uint) ([]models.Appointment, error)
	GetDoctorAppointments(doctorID uint) ([]models.Appointment, error)
	GetAllAppointments() ([]models.Appointment, error)
	CompleteAppointment(apptID uint, diagnosis, notes string, medications []models.Prescription) error
	CancelAppointment(apptID uint) error
	DeleteAppointment(apptID uint) error

	// Prescriptions
	GetPatientPrescriptions(patientID uint) ([]models.Prescription, error)
	GetDoctorPrescriptions(doctorID uint) ([]models.Prescription, error)
	UpdatePrescriptionStatus(prescID uint, status string) error

	// History
	GetPatientHistory(patientID uint) (map[string]interface{}, error)
}

type medicalService struct {
	repo repository.MedicalRepository
}

func NewMedicalService(repo repository.MedicalRepository) MedicalService {
	return &medicalService{repo: repo}
}

func (s *medicalService) GetDepartments() ([]models.Department, error) {
	return s.repo.GetAllDepartments()
}

func (s *medicalService) CreateDepartment(name, desc string) error {
	return s.repo.CreateDepartment(&models.Department{Name: name, Description: desc})
}

func (s *medicalService) UpdateDepartment(id uint, name, desc string) error {
	dept, err := s.repo.GetDepartmentByID(id)
	if err != nil {
		return err
	}
	dept.Name = name
	dept.Description = desc
	return s.repo.UpdateDepartment(dept)
}

func (s *medicalService) DeleteDepartment(id uint) error {
	return s.repo.DeleteDepartment(id)
}

func (s *medicalService) GetDoctors() ([]models.Doctor, error) {
	return s.repo.GetAllDoctors()
}

func (s *medicalService) GetPatients() ([]models.Patient, error) {
	return s.repo.GetAllPatients()
}

func (s *medicalService) GetPatient(id uint) (*models.Patient, error) {
	return s.repo.GetPatientByID(id)
}

func (s *medicalService) BookAppointment(patientID, doctorID uint, date string) (*models.Appointment, error) {
	parsedDate, err := time.Parse(time.RFC3339, date)
	if err != nil {
		// Try alternative layout if RFC3339 fails (e.g. from datetime-local input usually has T but maybe not Z or offsets)
		parsedDate, err = time.Parse("2006-01-02T15:04", date)
		if err != nil {
			return nil, err
		}
	}

	appt := &models.Appointment{
		PatientID:       patientID,
		DoctorID:        doctorID,
		AppointmentDate: parsedDate,
		Status:          models.StatusScheduled,
	}

	err = s.repo.CreateAppointment(appt)
	return appt, err
}

func (s *medicalService) CancelAppointment(apptID uint) error {
	appt, err := s.repo.GetAppointmentByID(apptID)
	if err != nil {
		return err
	}
	appt.Status = models.StatusCancelled
	return s.repo.UpdateAppointment(appt)
}

func (s *medicalService) GetPatientAppointments(patientID uint) ([]models.Appointment, error) {
	return s.repo.GetAppointmentsByPatient(patientID)
}

func (s *medicalService) GetDoctorAppointments(doctorID uint) ([]models.Appointment, error) {
	return s.repo.GetAppointmentsByDoctor(doctorID)
}

func (s *medicalService) GetAllAppointments() ([]models.Appointment, error) {
	return s.repo.GetAllAppointments()
}

func (s *medicalService) DeleteAppointment(apptID uint) error {
	return s.repo.DeleteAppointment(apptID)
}

func (s *medicalService) CompleteAppointment(apptID uint, diagnosis, notes string, medications []models.Prescription) error {
	appt, err := s.repo.GetAppointmentByID(apptID)
	if err != nil {
		return err
	}

	appt.Status = models.StatusCompleted
	if err := s.repo.UpdateAppointment(appt); err != nil {
		return err
	}

	cons := &models.Consultation{
		AppointmentID: apptID,
		Diagnosis:     diagnosis,
		Notes:         notes,
	}
	if err := s.repo.CreateConsultation(cons); err != nil {
		return err
	}

	for _, m := range medications {
		m.ConsultationID = cons.ID
		m.Status = models.StatusIssued
		if err := s.repo.CreatePrescription(&m); err != nil {
			return err
		}
	}

	return nil
}

func (s *medicalService) GetPatientPrescriptions(patientID uint) ([]models.Prescription, error) {
	return s.repo.GetPrescriptionsByPatient(patientID)
}

func (s *medicalService) GetDoctorPrescriptions(doctorID uint) ([]models.Prescription, error) {
	return s.repo.GetPrescriptionsByDoctor(doctorID)
}

func (s *medicalService) UpdatePrescriptionStatus(prescID uint, status string) error {
	// Simplified update
	presc := &models.Prescription{ID: prescID, Status: models.PrescriptionStatus(status)}
	return s.repo.UpdatePrescription(presc)
}

func (s *medicalService) GetPatientHistory(patientID uint) (map[string]interface{}, error) {
	appts, err := s.repo.GetAppointmentsByPatient(patientID)
	if err != nil {
		return nil, err
	}

	prescs, err := s.repo.GetPrescriptionsByPatient(patientID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"appointments":  appts,
		"prescriptions": prescs,
	}, nil
}
