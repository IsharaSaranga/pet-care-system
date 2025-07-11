const HomeVisit = require('../models/HomeVisit');
const asyncHandler = require('express-async-handler');

// @desc    Get all home visits
// @route   GET /api/homevisits
// @access  Private/Admin
const getHomeVisits = asyncHandler(async (req, res) => {
  const homeVisits = await HomeVisit.find().sort({ date: -1 });
  res.json(homeVisits);
});

// @desc    Get user's home visits
// @route   GET /api/homevisits/my-visits
// @access  Private
const getUserHomeVisits = asyncHandler(async (req, res) => {
  const homeVisits = await HomeVisit.find({ adopterEmail: req.user.email }).sort({ date: -1 });
  res.json(homeVisits);
});

// @desc    Create a new home visit
// @route   POST /api/homevisits
// @access  Private/Admin
const createHomeVisit = asyncHandler(async (req, res) => {
  const { adoptionFormId, adopterName, adopterEmail, petName, date, notes } = req.body;

  const homeVisit = await HomeVisit.create({
    adoptionFormId,
    adopterName,
    adopterEmail,
    petName,
    date,
    notes,
    status: 'pending',
    userResponse: 'pending'
  });

  res.status(201).json(homeVisit);
});

// @desc    Update a home visit
// @route   PUT /api/homevisits/:id
// @access  Private
const updateHomeVisit = asyncHandler(async (req, res) => {
  const homeVisit = await HomeVisit.findById(req.params.id);

  if (!homeVisit) {
    res.status(404);
    throw new Error('Home visit not found');
  }

  // Check if user is authorized to update this home visit
  if (homeVisit.adopterEmail !== req.user.email && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this home visit');
  }

  // If user is responding to the visit
  if (req.body.userResponse) {
    homeVisit.userResponse = req.body.userResponse;
    // If user is providing notes with their response
    if (req.body.userNotes) {
      homeVisit.userNotes = req.body.userNotes;
    }
  }

  // If admin is updating the visit
  if (req.user.role === 'admin' && req.body.status) {
    homeVisit.status = req.body.status;
  }

  const updatedHomeVisit = await homeVisit.save();
  res.json(updatedHomeVisit);
});

// @desc    Delete a home visit
// @route   DELETE /api/homevisits/:id
// @access  Private/Admin
const deleteHomeVisit = asyncHandler(async (req, res) => {
  const homeVisit = await HomeVisit.findById(req.params.id);

  if (!homeVisit) {
    res.status(404);
    throw new Error('Home visit not found');
  }

  await homeVisit.remove();
  res.json({ message: 'Home visit removed' });
});

module.exports = {
  getHomeVisits,
  getUserHomeVisits,
  createHomeVisit,
  updateHomeVisit,
  deleteHomeVisit
}; 