const { ListHostedZonesCommand } = require("@aws-sdk/client-route-53");
const client = require("./route53");

module.exports.listDomains = async () => {
  try {
    const command = new ListHostedZonesCommand({});
    const { HostedZones } = await client.send(command);
    return HostedZones;
  } catch (error) {
    console.error("Error listing hosted zones:", error);
    throw error;
  }
};
