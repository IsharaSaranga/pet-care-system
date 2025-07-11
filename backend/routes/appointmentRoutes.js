import express from 'express';
import auth from '../middleware/authMiddleware.js';

import {
  createAppointment,
  getRefundRequests,
  cancelAppointment,
  cancelAppointmentWithRefund,
  getGroomerAppointments,
  getTrainerAppointments,
  createAvlReqAppointment,
  getVeterinarianAppointments,
  getAllCancelledAppointments,
  getVeterinarianAppointmentsRequest,
  getActiveAppointments,
  getGroomerAppointmentsRequest,
  getPetTrainerAppointmentsRequest,
  denyAppointment,
  acceptAppointment,
  updateRefundStatus,
  confirmPayment,
  getProfessionalAppointments,
  getAppointmentTypeDistribution,
  getAppointmentStatusOverTime,
  addMedicalRecord,
  getPetDetails,
  getPetDetailsForAppointment,
  addPetReport,
  deletePetReport,
  updatePetReport,
  endAppointment,
  getAppointmentFeeDistribution,
  getAppointmentDateDistribution,
  getPaymentStatusDistribution,
  getAppointmentTimeSlotDistribution,
  getPetsUsersReport,
  getMonthlyIncomeReport,
  getPetById,
  getActiveProfessionals,
  generateReports,
  getAllRefundRequests,
  proffAppointmentDisplayByFilter,


} from '../controllers/appointmentController.js';
import { authenticateProfessional } from '../middleware/professionalAuth.js';
import { profAuthcreate } from '../middleware/authProfessionalforcreate.js';
import { profAuth } from '../middleware/profMiddleware.js';

const router = express.Router();

// POST route to create a new appointment
router.post('/create', auth, createAppointment);
// GET route for payment confirmation
router.get('/confirm', auth, confirmPayment);

// Regular cancellation (without refund)
router.patch('/:id/cancel', auth, cancelAppointment);

// Cancellation with refund request
router.patch('/:id/cancel-with-refund', auth, cancelAppointmentWithRefund);


router.get('/groomer-appointments', getGroomerAppointments);
router.get('/trainer-appointments', getTrainerAppointments);
router.get('/veterinarian-appointments', getVeterinarianAppointments);
router.get('/all-cancelled-appointments', getAllCancelledAppointments);

// New route for fetching logged-in user's active appointments
router.get('/active', auth, getActiveAppointments);

router.post('/ReqAvlTemp', profAuthcreate, createAvlReqAppointment);

router.get('/veterinarian-Reqappointments', getVeterinarianAppointmentsRequest);
router.get('/groomer-Reqappointments', getGroomerAppointmentsRequest);
router.get('/pet-trainer-Reqappointments', getPetTrainerAppointmentsRequest);

router.get('/type-distribution', profAuthcreate, getAppointmentTypeDistribution);
router.get('/status-over-time', profAuthcreate, getAppointmentStatusOverTime);
router.get('/fee-distribution', profAuthcreate, getAppointmentFeeDistribution);
router.get('/date-distribution', profAuthcreate, getAppointmentDateDistribution);
router.get('/payment-status-distribution', profAuthcreate, getPaymentStatusDistribution);
router.get('/time-slot-distribution', profAuthcreate, getAppointmentTimeSlotDistribution);

router.patch('/:id/deny', denyAppointment);
router.patch('/:id/accept', acceptAppointment);



router.get('/appointment/:appointmentId/pet-details', authenticateProfessional, getPetDetails);
router.post('/medical-records', authenticateProfessional, addMedicalRecord);

router.get('/', authenticateProfessional, getProfessionalAppointments);
router.get('/:appointmentId/pet-details', authenticateProfessional, getPetDetailsForAppointment);
router.post('/:appointmentId/add-report', authenticateProfessional, addPetReport);
router.delete('/:appointmentId/reports/:reportId', authenticateProfessional, deletePetReport);
router.put('/:appointmentId/reports/:reportId', authenticateProfessional, updatePetReport);
router.patch('/:appointmentId/end', authenticateProfessional, endAppointment);

router.get('/income-report', profAuthcreate, getMonthlyIncomeReport);
router.get('/pets-users-report', profAuthcreate, getPetsUsersReport);

router.get('/pet/:petId', getPetById);

router.get('/active-professionals', getActiveProfessionals);

router.get('/list', proffAppointmentDisplayByFilter);

router.get('/reports/generate', generateReports);


router.patch('/refundrequests/:id/status', updateRefundStatus);
router.get('/refundrequestforreview', getAllRefundRequests);




export default router;