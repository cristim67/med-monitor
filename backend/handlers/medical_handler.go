package handlers

import (
	"net/http"
	"strconv"

	"github.com/cristim67/med-monitor/backend/models"
	"github.com/cristim67/med-monitor/backend/services"
	"github.com/gin-gonic/gin"
)

type MedicalHandler struct {
	service services.MedicalService
}

func NewMedicalHandler(service services.MedicalService) *MedicalHandler {
	return &MedicalHandler{service: service}
}

func (h *MedicalHandler) GetDepartments(c *gin.Context) {
	depts, err := h.service.GetDepartments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, depts)
}

func (h *MedicalHandler) CreateDepartment(c *gin.Context) {
	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.CreateDepartment(body.Name, body.Description); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Department created"})
}

func (h *MedicalHandler) UpdateDepartment(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)
	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.UpdateDepartment(uint(id), body.Name, body.Description); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Department updated"})
}

func (h *MedicalHandler) DeleteDepartment(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)
	if err := h.service.DeleteDepartment(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Department deleted"})
}

func (h *MedicalHandler) GetDoctors(c *gin.Context) {
	docs, err := h.service.GetDoctors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, docs)
}

func (h *MedicalHandler) GetPatients(c *gin.Context) {
	patients, err := h.service.GetPatients()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, patients)
}

func (h *MedicalHandler) GetMyAppointments(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("user_role")

	var appts []models.Appointment
	var err error

	if role == "admin" {
		appts, err = h.service.GetAllAppointments()
	} else if role == "doctor" {
		appts, err = h.service.GetDoctorAppointments(userID)
	} else {
		appts, err = h.service.GetPatientAppointments(userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, appts)
}

func (h *MedicalHandler) CreateAppointment(c *gin.Context) {
	var body struct {
		DoctorID uint   `json:"doctor_id"`
		Date     string `json:"date"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patientID := c.GetUint("user_id")
	appt, err := h.service.BookAppointment(patientID, body.DoctorID, body.Date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, appt)
}

func (h *MedicalHandler) CompleteAppointment(c *gin.Context) {
	apptIDStr := c.Param("id")
	apptID, _ := strconv.ParseUint(apptIDStr, 10, 32)

	var body struct {
		Diagnosis   string                `json:"diagnosis"`
		Notes       string                `json:"notes"`
		Medications []models.Prescription `json:"medications"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.CompleteAppointment(uint(apptID), body.Diagnosis, body.Notes, body.Medications)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment completed successfully"})
}

func (h *MedicalHandler) CancelAppointment(c *gin.Context) {
	apptIDStr := c.Param("id")
	apptID, _ := strconv.ParseUint(apptIDStr, 10, 32)

	err := h.service.CancelAppointment(uint(apptID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment cancelled"})
}

func (h *MedicalHandler) DeleteAppointment(c *gin.Context) {
	apptIDStr := c.Param("id")
	apptID, _ := strconv.ParseUint(apptIDStr, 10, 32)
	err := h.service.DeleteAppointment(uint(apptID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted"})
}

func (h *MedicalHandler) GetMyPrescriptions(c *gin.Context) {
	userID := c.GetUint("user_id")
	prescs, err := h.service.GetPatientPrescriptions(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, prescs)
}

func (h *MedicalHandler) UpdatePrescription(c *gin.Context) {
	prescIDStr := c.Param("id")
	prescID, _ := strconv.ParseUint(prescIDStr, 10, 32)

	var body struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.UpdatePrescriptionStatus(uint(prescID), body.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prescription updated"})
}

func (h *MedicalHandler) GetPatientHistory(c *gin.Context) {
	patientIDStr := c.Param("id")
	patientID, _ := strconv.ParseUint(patientIDStr, 10, 32)

	history, err := h.service.GetPatientHistory(uint(patientID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, history)
}
