import HomeVisit from '../models/HomeVisit.js';

export const createHomeVisit = async (req, res) => {
  try {
    const homeVisit = new HomeVisit(req.body);
    await homeVisit.save();
    res.status(201).json(homeVisit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllHomeVisits = async (req, res) => {
  try {
    const homeVisits = await HomeVisit.find();
    res.status(200).json(homeVisits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHomeVisitById = async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);
    if (!homeVisit) {
      return res.status(404).json({ error: 'Home visit not found' });
    }
    res.status(200).json(homeVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHomeVisit = async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!homeVisit) {
      return res.status(404).json({ error: 'Home visit not found' });
    }
    res.status(200).json(homeVisit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteHomeVisit = async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findByIdAndDelete(req.params.id);
    if (!homeVisit) {
      return res.status(404).json({ error: 'Home visit not found' });
    }
    res.status(200).json({ message: 'Home visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserHomeVisits = async (req, res) => {
  try {
    const { email } = req.user;
    const homeVisits = await HomeVisit.find({ adopterEmail: email });
    res.status(200).json(homeVisits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectHomeVisitsByForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const result = await HomeVisit.updateMany(
      { adoptionFormId: formId },
      { $set: { userResponse: 'rejected', status: 'rejected' } }
    );
    res.status(200).json({ message: 'Home visits rejected', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 