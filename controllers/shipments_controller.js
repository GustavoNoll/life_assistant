const Shipment = require('../models/shipment');
const User = require('../models/user');
const validations = require('../validations/shipment_validation');
const request = require('request');
exports.createShipment  = (req, res, next) => {
  const shipmentNumber = req.body.shipment_number.toUpperCase();
  const userId = req.body.user;

  try {
    validations.validateShipmentNumber(shipmentNumber);
    validations.validateUserId(userId);
    Shipment.findOne({ shipment_number: shipmentNumber })
    .then(existingShipment => {
      if (existingShipment) {
        // Se já existir, você pode optar por ignorar a criação ou realizar outra ação
        return User.findOne({ _id: userId, shipments: existingShipment._id })
          .then(user => {
            if (user) {
              return res.status(200).json({
                message: 'User already has this shipment. Ignoring duplicate.',
                shipment: existingShipment,
                api_request_status: 'ignored',
              });
            } else {
              // Adicione o ID do Shipment ao array de Shipments do usuário
              return User.findByIdAndUpdate(userId, { $push: { shipments: existingShipment._id } })
              .then(() => {
                res.status(200).json({
                  message: 'Shipment with the same number already exists. Ignoring duplicate.',
                  shipment: existingShipment,
                  api_request_status: 'ignored',
                });
              })
            }
          });
      }else{
        const shipment = new Shipment({
          shipment_number: shipmentNumber,
        });
        shipment.save()
          .then(shipmentSaved => {
            console.log('Shipment')
            const user = 'teste'
            const token = '1abcd00b2731640e886fb41a8a9671ad1434c599dbaa0a0de9a5aa619f29a83f'
            var options = {
              'method': 'GET',
              'url':  `https://api.linketrack.com/track/json?user=${user}&token=${token}&codigo=${shipmentSaved.shipment_number}`,
              'headers': {
              }
            };
            request(options, function (error, response) {
              if (error) {
                console.error('Erro na requisição da API:', error);
                return res.status(500).json({ error: 'Error making API request.' });
              }
      
              if (response.body.includes('Too Many Requests')){
                return res.status(201).json({
                  message: 'Shipment created successfully!',
                  shipment: shipmentSaved,
                  api_request_status: 'fail',
                });
              }
              const parsedResponse = JSON.parse(response.body)
              Shipment.updateOne({ _id: shipmentSaved.id }, { details: parsedResponse.eventos })
                .exec()
                .then(result => {
                    res.status(201).json({
                        message: 'Shipment created successfully!',
                        shipment: shipmentSaved,
                        api_request_status: 'success'
                    });
                })
                .catch(err => {
                    console.error('Erro ao atualizar o documento:', err);
                    res.status(500).json({ err });
                });
            });
          })
      }
    })
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      shipment: null,
      api_request_status: 'ignored',
    });
  }
}

exports.updateShipmentStatus = (req, res, next) => {
  const shipmentNumber = req.body.shipment_number.toUpperCase();
  const user = 'teste'
  const token = '1abcd00b2731640e886fb41a8a9671ad1434c599dbaa0a0de9a5aa619f29a83f'
  var options = {
    'method': 'GET',
    'url':  `https://api.linketrack.com/track/json?user=${user}&token=${token}&codigo=${shipmentNumber}`,
    'headers': {
    }
  };
  try {
    validations.validateShipmentNumber(shipmentNumber);
    Shipment.findOne({shipment_number: shipmentNumber})
      .then(shipment => {
        request(options, function (error, response) {
          if (error) throw new Error(error);
          if (response.body.includes('Too Many Requests')){
            return res.status(500).json({
              message: `Shipment updated fail!: ${response.body}`,
              shipment: shipment,
              api_request_status: 'fail',
            });
          }
          const parsedResponse = JSON.parse(response.body)
          console.log(parsedResponse);
          Shipment.updateOne({ shipment_number: shipmentNumber }, { details: parsedResponse.eventos })
            .exec()
            .then(result => {
                res.status(201).json({
                    message: 'Shipment updated successfully!',
                    shipment: shipment,
                    api_request_status: 'success'
                });
            })
            .catch(err => {
                res.status(500).json({ err });
            });
        });
      })
  } catch (err) {
    res.status(500).json({err})
  }
}

exports.deleteShipment = (req, res, next) => {
  const shipmentNumber = req.body.shipment_number.toUpperCase();
  const userId = req.body.user;

  try {
    validations.validateShipmentNumber(shipmentNumber);
    validations.validateUserId(userId);
    let shipmentToDelete
    // Encontre o ID do Shipment pelo número de rastreamento
    Shipment.findOne({ shipment_number: shipmentNumber })
      .then(shipment => {
        if (!shipment) {
          return res.status(404).json({
            message: 'Shipment not found.',
          });
        }
        shipmentToDelete = shipment
        // Encontre o usuário
        return User.findOne({ _id: userId });
      })
      .then(user => {
        if (!user) {
          return res.status(404).json({
            message: 'User not found.',
          });
        }

        // Encontre o índice do Shipment no array de Shipments do usuário
        const shipmentIndex = user.shipments.indexOf(shipmentToDelete._id);

        if (shipmentIndex !== -1) {
          // Remova o Shipment do array de Shipments do usuário
          user.shipments.splice(shipmentIndex, 1);

          // Salve as alterações no usuário
          return user.save();
        } else {
          return res.status(404).json({
            message: 'Shipment not found in user\'s shipments.',
            user: user,
          });
        }
      })
      .then(updatedUser => {
        if (!res.headersSent) {
          return res.status(200).json({
            message: 'Shipment removed from user successfully.',
            user: updatedUser,
          });
        }
      })
    } catch (err) {
      res.status(500).json({err})
    }
};