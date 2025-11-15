const DemandForecast = require('../demandForecast.model');

// CREATE
exports.createForecast = async (req, res) => {
  try {
    const forecast = new DemandForecast(req.body);
    await forecast.save();
    res.status(201).json(forecast);
  } catch (err) {
    console.error('❌ Error saving forecast:', err);
    res.status(500).json({ message: 'Error saving forecast', error: err });
  }
};
