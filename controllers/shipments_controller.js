// controllers/shipmentController.js
const Shipment = require('../models/shipment');
const User = require('../models/user');
const { validateShipmentNumber } = require('../validations/shipment_validation');
const { validateUserId } = require('../validations/user_validation');
const { makeApiRequest } = require('../utils/api_request');

const addShipmentToUser = async (userId, shipmentId) => {
  try {
    const existingUser = await User.findOne({ externalId: userId });

    if (existingUser) {
      await existingUser.updateOne({ $push: { shipments: shipmentId } });
    } else {
      const newUser = new User({
        externalId: userId,
        shipments: [shipmentId],
      });
      await newUser.save();
    }
  } catch (error) {
    throw new Error('Erro durante a operação: ' + error.message);
  }
};

const updateShipmentDetails = (shipmentId, eventos) => {
  return Shipment.updateOne({ _id: shipmentId }, { details: eventos }).exec();
};

exports.createShipment = async (req, res, next) => {
  const shipmentNumber = req.body.shipmentNumber.toUpperCase();
  const userId = req.body.userId;
  console.log(req)

  try {
    validateShipmentNumber(shipmentNumber);
    validateUserId(userId);

    const existingShipment = await Shipment.findOne({ shipmentNumber: shipmentNumber });

    if (existingShipment) {
      const user = await User.findOne({ externalId: userId, shipments: existingShipment._id });

      if (user) {
        return res.status(200).json({
          status: 'success',
          message: 'User already has this shipment. Ignoring duplicate.',
          shipment: existingShipment,
          apiRequestStatus: 'ignored',
        });
      } else {
        await addShipmentToUser(userId, existingShipment._id);

        return res.status(200).json({
          status: 'success',
          message: 'Shipment with the same number already exists. Ignoring duplicate.',
          shipment: existingShipment,
          apiRequestStatus: 'ignored',
        });
      }
    } else {
      const shipment = new Shipment({ shipmentNumber: shipmentNumber });
      const shipmentSaved = await shipment.save();
      await addShipmentToUser(userId, shipmentSaved._id);

      const apiOptions = {
        method: 'GET',
        url: `https://api.linketrack.com/track/json?user=gustavonoll78@gmail.com&token=c6f25096cf77608e913a7619335d1942c7784adb85ded9948328dd840bb882a8&codigo=${shipmentSaved.shipmentNumber}`,
        headers: {},
      };

      const response = await makeApiRequest(apiOptions);

      if (response.body == 'Unauthorized' || response.body.includes('Too Many Requests')) {
        return res.status(201).json({
          status: 'success',
          message: 'Shipment created successfully!',
          shipment: shipmentSaved,
          apiRequestStatus: 'fail',
        });
      }

      const parsedResponse = JSON.parse(response.body);
      await updateShipmentDetails(shipmentSaved.id, parsedResponse.eventos);

      return res.status(201).json({
        status: 'success',
        message: 'Shipment created successfully!',
        shipment: shipmentSaved,
        apiRequestStatus: 'success',
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message,
      apiRequestStatus: 'ignored',
    });
  }
};

exports.updateShipmentStatus = async (req, res, next) => {
  const shipmentNumber = req.body.shipmentNumber.toUpperCase();

  const apiOptions = {
    method: 'GET',
    url: `https://api.linketrack.com/track/json?user=gustavonoll78@gmail.com&token=c6f25096cf77608e913a7619335d1942c7784adb85ded9948328dd840bb882a8&codigo=${shipmentNumber}`,
    headers: {},
  };

  try {
    validateShipmentNumber(shipmentNumber);

    const shipment = await Shipment.findOne({ shipmentNumber: shipmentNumber });
    const response = await makeApiRequest(apiOptions);

    if (response.body.includes('Too Many Requests')) {
      return res.status(500).json({
        message: `Shipment updated fail!: ${response.body}`,
        apiRequestStatus: 'fail',
      });
    }

    const parsedResponse = JSON.parse(response.body);
    await updateShipmentDetails(shipment.id, parsedResponse.eventos);

    return res.status(201).json({
      status: 'success',
      message: 'Shipment updated successfully!',
      apiRequestStatus: 'success',
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: err.message 
    });
  }
};

exports.deleteShipment = async (req, res, next) => {
  const shipmentNumber = req.query.shipmentNumber.toUpperCase();
  const userId = req.query.userId;

  try {
    validateShipmentNumber(shipmentNumber);
    validateUserId(userId);

    const shipment = await Shipment.findOne({ shipmentNumber: shipmentNumber });

    if (!shipment) {
      return res.status(404).json({
        status: 'error',
        message: 'Shipment not found.',
      });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    const shipmentIndex = user.shipments.indexOf(shipment._id);

    if (shipmentIndex !== -1) {
      user.shipments.splice(shipmentIndex, 1);
      await user.save();
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Shipment not found in user\'s shipments.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Shipment removed from user successfully.',
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: err.message,
    });
  }
};

exports.getUserShipments = async (req, res, next) => {
  const userId = req.query.userId;
  const limit = parseInt(req.query.limit) || 20;

  try {
    validateUserId(userId);

    const user = await User.findOne({ externalId: userId }).exec();

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    const shipmentIds = user.shipments;

    const shipments = await Shipment.find({ _id: { $in: shipmentIds } });
    
    const userShipments = shipments.map(shipment => shipment.toObject());

    return res.status(200).json({
      status: 'success',
      message: 'User shipments retrieved successfully.',
      userShipments: userShipments,
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: err.message,
    });
  }
};
