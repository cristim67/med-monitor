package repository

import (
	"github.com/cristim67/med-monitor/backend/models"
	"gorm.io/gorm"
)

type MedicalRepository interface {
	// Departments
	GetAllDepartments() ([]models.Department, error)
	GetDepartmentByID(id uint) (*models.Department, error)
	CreateDepartment(dept *models.Department) error
	UpdateDepartment(dept *models.Department) error
	DeleteDepartment(id uint) error

	// Doctors
	GetAllDoctors() ([]models.Doctor, error)
	GetDoctorByID(id uint) (*models.Doctor, error)
	CreateDoctor(doctor *models.Doctor) error
	UpdateDoctor(doctor *models.Doctor) error

	// Patients
	GetAllPatients() ([]models.Patient, error)
	GetPatientByID(id uint) (*models.Patient, error)
	UpdatePatient(patient *models.Patient) error

	// Appointments
	CreateAppointment(appt *models.Appointment) error
	GetAppointmentsByPatient(patientID uint) ([]models.Appointment, error)
	GetAppointmentsByDoctor(doctorID uint) ([]models.Appointment, error)
	GetAppointmentByID(id uint) (*models.Appointment, error)
	UpdateAppointment(appt *models.Appointment) error
	GetAllAppointments() ([]models.Appointment, error)
	DeleteAppointment(id uint) error

	// Consultations & Prescriptions
	CreateConsultation(cons *models.Consultation) error
	GetConsultationByAppointment(apptID uint) (*models.Consultation, error)
	CreatePrescription(presc *models.Prescription) error
	GetPrescriptionsByConsultation(consID uint) ([]models.Prescription, error)
	GetPrescriptionsByPatient(patientID uint) ([]models.Prescription, error)
	UpdatePrescription(presc *models.Prescription) error
}

type medicalRepository struct {
	db *gorm.DB
}

func NewMedicalRepository(db *gorm.DB) MedicalRepository {
	return &medicalRepository{db: db}
}

func (r *medicalRepository) GetAllDepartments() ([]models.Department, error) {
	var depts []models.Department
	err := r.db.Find(&depts).Error
	return depts, err
}

func (r *medicalRepository) GetDepartmentByID(id uint) (*models.Department, error) {
	var dept models.Department
	err := r.db.First(&dept, id).Error
	return &dept, err
}

func (r *medicalRepository) CreateDepartment(dept *models.Department) error {
	return r.db.Create(dept).Error
}

func (r *medicalRepository) UpdateDepartment(dept *models.Department) error {
	return r.db.Save(dept).Error
}

func (r *medicalRepository) DeleteDepartment(id uint) error {
	return r.db.Delete(&models.Department{}, id).Error
}

func (r *medicalRepository) GetAllDoctors() ([]models.Doctor, error) {
	var docs []models.Doctor
	err := r.db.Preload("User").Preload("Department").Find(&docs).Error
	return docs, err
}

func (r *medicalRepository) GetDoctorByID(id uint) (*models.Doctor, error) {
	var doc models.Doctor
	err := r.db.Preload("User").Preload("Department").First(&doc, id).Error
	return &doc, err
}

func (r *medicalRepository) CreateDoctor(doctor *models.Doctor) error {
	return r.db.Create(doctor).Error
}

func (r *medicalRepository) UpdateDoctor(doctor *models.Doctor) error {
	return r.db.Model(doctor).Updates(map[string]interface{}{
		"department_id":  doctor.DepartmentID,
		"specialization": doctor.Specialization,
	}).Error
}

func (r *medicalRepository) GetAllPatients() ([]models.Patient, error) {
	var patients []models.Patient
	err := r.db.Preload("User").Joins("JOIN users ON users.id = patients.id").Where("users.role = ?", "patient").Find(&patients).Error
	return patients, err
}

func (r *medicalRepository) GetPatientByID(id uint) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.Preload("User").First(&patient, id).Error
	return &patient, err
}

func (r *medicalRepository) UpdatePatient(patient *models.Patient) error {
	return r.db.Save(patient).Error
}

func (r *medicalRepository) CreateAppointment(appt *models.Appointment) error {
	return r.db.Create(appt).Error
}

func (r *medicalRepository) GetAppointmentsByPatient(patientID uint) ([]models.Appointment, error) {
	var appts []models.Appointment
	err := r.db.Preload("Doctor.User").Preload("Doctor.Department").Where("patient_id = ?", patientID).Order("appointment_date desc").Find(&appts).Error
	return appts, err
}

func (r *medicalRepository) GetAppointmentsByDoctor(doctorID uint) ([]models.Appointment, error) {
	var appts []models.Appointment
	err := r.db.Preload("Patient.User").Where("doctor_id = ?", doctorID).Order("appointment_date desc").Find(&appts).Error
	return appts, err
}

func (r *medicalRepository) GetAppointmentByID(id uint) (*models.Appointment, error) {
	var appt models.Appointment
	err := r.db.Preload("Patient.User").Preload("Doctor.User").First(&appt, id).Error
	return &appt, err
}

func (r *medicalRepository) UpdateAppointment(appt *models.Appointment) error {
	return r.db.Save(appt).Error
}

func (r *medicalRepository) GetAllAppointments() ([]models.Appointment, error) {
	var appts []models.Appointment
	err := r.db.Preload("Patient.User").Preload("Doctor.User").Preload("Doctor.Department").Order("appointment_date desc").Find(&appts).Error
	return appts, err
}

func (r *medicalRepository) DeleteAppointment(id uint) error {
	return r.db.Delete(&models.Appointment{}, id).Error
}

func (r *medicalRepository) CreateConsultation(cons *models.Consultation) error {
	return r.db.Create(cons).Error
}

func (r *medicalRepository) GetConsultationByAppointment(apptID uint) (*models.Consultation, error) {
	var cons models.Consultation
	err := r.db.Where("appointment_id = ?", apptID).First(&cons).Error
	return &cons, err
}

func (r *medicalRepository) CreatePrescription(presc *models.Prescription) error {
	return r.db.Create(presc).Error
}

func (r *medicalRepository) GetPrescriptionsByConsultation(consID uint) ([]models.Prescription, error) {
	var prescs []models.Prescription
	err := r.db.Where("consultation_id = ?", consID).Find(&prescs).Error
	return prescs, err
}

func (r *medicalRepository) GetPrescriptionsByPatient(patientID uint) ([]models.Prescription, error) {
	var prescs []models.Prescription
	err := r.db.Joins("JOIN consultations ON consultations.id = prescriptions.consultation_id").
		Joins("JOIN appointments ON appointments.id = consultations.appointment_id").
		Preload("Consultation.Appointment.Doctor.User").
		Where("appointments.patient_id = ?", patientID).
		Order("prescriptions.created_at desc").
		Find(&prescs).Error
	return prescs, err
}

func (r *medicalRepository) UpdatePrescription(presc *models.Prescription) error {
	return r.db.Save(presc).Error
}
