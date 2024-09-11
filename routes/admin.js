const express = require('express');
const router = express.Router();

const db = require('../services/queries');
const helper = require('../shared/helper');

router.get('/clients/pendingactivation', function(req, res, next) {

  db.loadParentsPendingActivation()
    .then(resp => {
      const parents = helper.toParentChildObjectStructure(resp);
      res.json(parents);
    })
    .catch(error => {
      res
        .status(500)
        .json({errors: error});
    });

});

router.post('/clients/application/status', function(req, res, next) {
  const status = req.body.status;
  const uuid = req.body.uuid;

  db.setApplicationStatus(uuid, status)
    .then(resp => {
      res.json({OK: true});
    })
    .catch(error => {
      res
        .status(500)
        .json({errors: error});
    });

});

module.exports = router;
