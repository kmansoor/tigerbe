const express = require('express');
const router = express.Router();

const encryption = require('../shared/encryption');
const db = require('../services/queries');
const helper = require('../shared/helper');

router.post('/', function(req, res, next) {
  const staff = helper.staffFromRequest(req);
  const errors = helper.isStaffInvalid(staff);
  if (errors) {
    res.status(400).json({errors: errors})
    return;
  }

  db.createStaff(staff)
    .then(resp => {
      res.json({token: resp});
    })
    .catch(error => {
      res
        .status(500)
        .json({errors: error});
    });
});

module.exports = router;
