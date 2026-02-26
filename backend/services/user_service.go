package services

import (
	"errors"

	"github.com/cristim67/med-monitor/backend/models"
	"github.com/cristim67/med-monitor/backend/repository"
	"github.com/cristim67/med-monitor/backend/utils"
	"gorm.io/gorm"
)

type UserService interface {
	GetOrCreateUserByClaims(claims *utils.GoogleClaims) (*models.User, error)
	GetAllUsers() ([]models.User, error)
	UpdateUserRole(id uint, role string) error
}

type userService struct {
	repo    repository.UserRepository
	medRepo repository.MedicalRepository
}

func NewUserService(repo repository.UserRepository, medRepo repository.MedicalRepository) UserService {
	return &userService{repo: repo, medRepo: medRepo}
}

func (s *userService) GetAllUsers() ([]models.User, error) {
	return s.repo.GetAllUsers()
}

func (s *userService) UpdateUserRole(id uint, role string) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	user.Role = role
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	// Create specific profile if needed
	if role == "doctor" {
		_, err := s.medRepo.GetDoctorByID(id)
		if err != nil {
			// Create doctor profile
			doctor := &models.Doctor{
				ID:             id,
				Specialization: "Pending...",
			}
			return s.medRepo.CreateDoctor(doctor)
		}
	} else if role == "patient" {
		_, err := s.medRepo.GetPatientByID(id)
		if err != nil {
			patient := &models.Patient{
				ID: id,
			}
			return s.repo.CreatePatient(patient)
		}
	}

	return nil
}

func (s *userService) GetOrCreateUserByClaims(claims *utils.GoogleClaims) (*models.User, error) {
	user, err := s.repo.FindByEmail(claims.Email)
	if err == nil {
		// User exists, optionally update picture and name if they changed
		updated := false
		if user.Picture != claims.Picture && claims.Picture != "" {
			user.Picture = claims.Picture
			updated = true
		}
		if user.Name != claims.Name && claims.Name != "" {
			user.Name = claims.Name
			updated = true
		}

		if updated {
			if err := s.repo.UpdateUser(user); err != nil {
				return nil, err
			}
		}

		return user, nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create default admin for dev purposes (or patient as per actual business logic)
		newUser := &models.User{
			Email:   claims.Email,
			Name:    claims.Name,
			Picture: claims.Picture,
			Role:    "admin", // First user is admin
		}

		if err := s.repo.CreateUser(newUser); err != nil {
			return nil, err
		}

		patientDetails := &models.Patient{
			ID: newUser.ID,
		}
		if err := s.repo.CreatePatient(patientDetails); err != nil {
			return nil, err
		}

		return newUser, nil
	}

	return nil, err
}
