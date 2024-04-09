const { Route53Client } = require("@aws-sdk/client-route-53");
require("dotenv").config();

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const client = new Route53Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});
module.exports = client;
