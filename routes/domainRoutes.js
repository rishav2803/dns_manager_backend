const express = require("express");

const {
  createDomain,
  createSingleDomain,
  fetchDomains,
  fetchRecordTypes,
} = require("../controllers/domainsController.js");

const router = express.Router();

router.get("/all/:user_id", fetchDomains);
router.post("/create/single", createSingleDomain);
router.post("/create/multiple", createDomain);
router.get("/all/:user_id/type", fetchRecordTypes);

module.exports = router;
