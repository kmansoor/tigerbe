const express = require('express');
const router = express.Router();

const encryption = require('../shared/encryption');
const db = require('../services/queries');
const helper = require('../shared/helper');
const constants = require('../shared/constants');

router.post('/location', function(req, res, next) {
  const parentUuid = req.body.authToken;
  const latitude = req.body.lat;
  const longitude = req.body.lng;

  db.saveLocation(latitude, longitude, parentUuid)
    .then(resp => res.json({data: true}))
    .catch(error => res.status(500).json({errors: error}));
});

router.get('/location', function(req, res, next) {
  let token = req.headers['x-access-token'];
  console.log(token);
  // if (!token) throw error?????

  db.readLocation()
    .then(data => helper.toParentLocationObjectStructure(data))
    .then(parents => res.json(parents))
    .catch(error => res.status(500).json({errors: error}));
});

router.post('/', function(req, res, next) {
  const parent = helper.parentFromRequest(req);
  const errors = helper.isParentInvalid(parent);
  if (errors) {
    res.status(400).json({errors: errors})
    return;
  }

  encryption.encrypt(parent.password)
    .then(encrypted => {
      parent.password = encrypted;
      return parent;
    })
    .then(parent => {
      return db.createParent(parent);
    })
    .then(resp => {
      res.json({token: resp});
    })
    .catch(error => {
      res
        .status(500)
        .json({errors: error});
    });

});

router.get('/status/:token', function(req, res, next) {
  const token = req.params.token;

  db.getParentStatus(token)
    .then(resp => {
      if (resp === constants.STATUS_ACTIVE) {
        return db.getCampusByParent(token);
      } else {
        return resp;
      }
    })
    .then(resp => {
      if (Array.isArray(resp)) {
        res.json({ status: constants.STATUS_ACTIVE, regions: [...resp] });
      } else {
        res.json({ status: resp, regions: [] });
      }

    })
    .catch(error => {
      res
        .status(500)
        .json({errors: error});
    });
});

module.exports = router;
