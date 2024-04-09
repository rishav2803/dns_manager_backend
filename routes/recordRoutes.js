const express = require("express");

const {
  fetchDomainRecords,
  createRecord,
  createRecords,
  deleteRecord,
  updateRecord,
  // deleteDomain,
  // listDomain,
} = require("../controllers/recordsController");

const router = express.Router();

router.post("/all", fetchDomainRecords);

router.post("/create/single", createRecord);

router.post("/create/multiple", createRecords);

router.post("/update", updateRecord);

router.post("/delete", deleteRecord);

module.exports = router;
