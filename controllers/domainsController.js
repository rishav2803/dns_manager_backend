const {
  CreateHostedZoneCommand,
  ListHostedZonesCommand,
  ListResourceRecordSetsCommand,
} = require("@aws-sdk/client-route-53");

const client = require("../helpers/route53");

module.exports.fetchRecordTypes = async (req, res) => {
  try {
    console.log("Hello World");
    const listCommand = new ListHostedZonesCommand({});
    const { HostedZones } = await client.send(listCommand);

    const userID = req.params.user_id;
    const userHostedZones = HostedZones.filter((zone) => {
      return zone.CallerReference.startsWith(`userID_${userID}_`);
    });

    const recordTypes = {};

    for (const hostedZone of userHostedZones) {
      const listRecordSetsCommand = new ListResourceRecordSetsCommand({
        HostedZoneId: hostedZone.Id,
      });
      const { ResourceRecordSets } = await client.send(listRecordSetsCommand);

      ResourceRecordSets.forEach((recordSet) => {
        const type = recordSet.Type;
        if (recordTypes[type]) {
          recordTypes[type]++;
        } else {
          recordTypes[type] = 1;
        }
      });
    }

    const domainData = Object.keys(recordTypes).map((type) => ({
      type,
      count: recordTypes[type],
    }));

    res.status(200).json(domainData);
  } catch (error) {
    console.error("Error fetching hosted zones and records:", error);
    res.status(500).json({ error: "Error fetching hosted zones and records" });
  }
};

module.exports.fetchDomains = async (req, res) => {
  try {
    console.log("Hello World");
    const listCommand = new ListHostedZonesCommand({});
    const { HostedZones } = await client.send(listCommand);

    const userID = req.params.user_id;
    console.log(userID);

    const userHostedZones = HostedZones.filter((zone) => {
      return zone.CallerReference.startsWith(`userID_${userID}_`);
    });

    res.status(200).json({
      userHostedZones,
    });
  } catch (error) {
    console.error("Error fetching hosted zones:", error);
    res.status(500).json({ error: "Error fetching hosted zones" });
  }
};

module.exports.createSingleDomain = async (req, res) => {
  try {
    const { mssg, user_id } = req.body;

    const listCommand = new ListHostedZonesCommand({});
    const { HostedZones } = await client.send(listCommand);

    const { domainName, type, desc } = mssg;
    if (
      HostedZones.find(
        (zone) =>
          zone.Name.toLowerCase() == (domainName + ".").toLowerCase() ||
          zone.Name.toLowerCase() == domainName.toLowerCase()
      )
    ) {
      res.status(404).json({
        mssg: "Domain Already Exist",
      });
      return;
    }

    const params = {
      Name: domainName,
      CallerReference: `userID_${user_id}_${Date.now()}`,
      HostedZoneConfig: {
        Comment: desc || " ",
        PrivateZone: type.toLowerCase() === "public" ? false : true,
      },
    };

    const command = new CreateHostedZoneCommand(params);
    const { HostedZone } = await client.send(command);

    const numRecords = HostedZone.ResourceRecordSetCount;
    const zoneType = HostedZone.Config.PrivateZone ? "Private" : "Public";

    res.status(200).json({
      mssg: {
        Id: HostedZone.Id,
        Name: HostedZone.Name,
        Config: {
          Comment: HostedZone.Config.Comment,
          PrivateZone: HostedZone.Config.PrivateZone,
        },
        ResourceRecordSetCount: numRecords,
        zoneType: zoneType,
      },
    });
  } catch (error) {
    console.error("Error creating hosted zones:", error);
    res.status(500).json({ error: "Error creating hosted zones" });
  }
};

module.exports.createDomain = async (req, res) => {
  try {
    const { domainList, user_id } = req.body;

    const command = new ListHostedZonesCommand({});
    const { HostedZones } = await client.send(command);

    const successRes = [];
    const unSuccessRes = [];
    console.log(domainList);

    for (const domain of domainList.records) {
      const { domainName, type, desc } = domain;
      if (
        HostedZones.find(
          (zone) =>
            zone.Name.toLowerCase() == (domainName + ".").toLowerCase() ||
            zone.Name.toLowerCase() == domainName.toLowerCase()
        )
      ) {
        console.log(`Hosted zone '${name}' already exists. Skipping creation.`);
        unSuccessRes.push(domainName);
        continue;
      }
      const params = {
        Name: domainName,
        CallerReference: `userID_${user_id}_${Date.now()}`,
        HostedZoneConfig: {
          Comment: desc || " ",
          PrivateZone: type.toLowerCase() === "public" ? false : true,
        },
      };

      const command = new CreateHostedZoneCommand(params);
      const { HostedZone } = await client.send(command);

      const numRecords = HostedZone.ResourceRecordSetCount;
      const zoneType = HostedZone.Config.PrivateZone ? "Private" : "Public";

      successRes.push({
        Id: HostedZone.Id,
        Name: HostedZone.Name,
        Config: {
          Comment: HostedZone.Config.Comment,
          PrivateZone: HostedZone.Config.PrivateZone,
        },
        ResourceRecordSetCount: numRecords,
        zoneType: zoneType,
      });
    }

    if (successRes.length < 0) {
      res.status(400).json({
        mssg: "No domain is created because it already exist",
      });
    }

    res.status(200).json({
      mssg: successRes,
    });

    console.log(
      successRes.length === 0
        ? "No domain is created because all are already exist"
        : `these Hosted zones created successfully ${successRes}`
    );
  } catch (error) {
    console.error("Error creating hosted zones:", error);
    res.status(500).json({ error: "Error creating hosted zones" });
  }
};
