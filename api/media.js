const { Router } = require('express');

const { reqAuthentication } = require('../lib/auth');


const { downloadSubmissionFileById, doesSubmissionFileExist } = require("../models/assignment");

const router = Router();

// Should we allow anybody to download any submission?
router.get('/submissions/:id', reqAuthentication, async (req, res, next) => {
  try {
    if (!await doesSubmissionFileExist(req.params.id)) {
      res.status(404).send({
        error: "Submission not found."
      })
      return
    }
    await downloadSubmissionFileById(req.params.id, res)
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch submission."
    })
  }
});

module.exports = router;