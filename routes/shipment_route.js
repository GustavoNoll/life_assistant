const express = require('express');
const shipmentsController = require('../controllers/shipments_controller');
const router = express.Router();

router.post('/shipments', shipmentsController.createShipment);
router.post('/shipments/update_status', shipmentsController.updateShipmentStatus)
router.delete('/shipments', shipmentsController.deleteShipment)
router.get('/shipments', shipmentsController.getUserShipments)
module.exports = router;