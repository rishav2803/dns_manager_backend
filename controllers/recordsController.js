const {
  ListResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommand,
  CreateResourceRecordSetCommand,
} = require("@aws-sdk/client-route-53");

const client = require("../helpers/route53");

async function updateDomainRecord(
  domainId,
  recordName,
  recordType,
  recordValue,
  ttl
) {
  try {
    const resourceRecords = recordValue.map((value) => {
      return {
        Value: value.trim(),
      };
    });
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: "UPSERT",
            ResourceRecordSet: {
              Name: recordName,
              Type: recordType,
              TTL: ttl,
              ResourceRecords: resourceRecords,
            },
          },
        ],
      },
      HostedZoneId: domainId,
    };

    const command = new ChangeResourceRecordSetsCommand(params);
    const data = await client.send(command);

    if (data.ChangeInfo && data.ChangeInfo.Id) {
      console.log("Record updated successfully:", data.ChangeInfo.Id);
      return data.ChangeInfo.Id;
    } else {
      throw new Error("Failed to update record");
    }
  } catch (error) {
    console.error("Error updating record:", error);
    throw error;
  }
}

module.exports.updateRecord = async (req, res) => {
  try {
    const { domainId, recordName, type, values, ttl } = req.body;
    console.log(
      "Updating domain record:",
      domainId,
      recordName,
      type,
      values,
      ttl
    );

    const result = await updateDomainRecord(
      domainId,
      recordName,
      type,
      values,
      ttl
    );

    res.status(200).json({
      mssg: "Domain record updated successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error updating domain record:", error);
    res.status(500).json({ error: "Error updating domain record" });
  }
};

module.exports.createRecords = async (req, res) => {
  try {
    const { recordList, domainId, domainName } = req.body;

    const successRes = [];

    for (const record of recordList) {
      const { recordName, type, value, ttl } = record;

      const resourceRecords = value.map((value) => {
        return {
          Value: value.trim(),
        };
      });

      const params = {
        ChangeBatch: {
          Changes: [
            {
              Action: "CREATE",
              ResourceRecordSet: {
                Name: `${recordName}.${domainName}`,
                Type: type,
                TTL: ttl,
                ResourceRecords: resourceRecords,
              },
            },
          ],
        },
        HostedZoneId: domainId,
      };

      const command = new ChangeResourceRecordSetsCommand(params);
      try {
        const data = await client.send(command);
        if (data.ChangeInfo && data.ChangeInfo.Id) {
          console.log("Record created successfully:", data.ChangeInfo.Id);
          successRes.push({
            name: `${recordName}.${domainName}`,
            type: type,
            value: value,
            ttl: ttl,
          });
        }
      } catch (error) {
        console.error("Error creating record:", error);
      }
    }

    res.status(200).json({
      msg: successRes,
    });

    console.log(
      successRes.length === 0
        ? "No records created successfully."
        : "Records created successfully:",
      successRes
    );
  } catch (error) {
    console.error("Error creating records:", error);
    res.status(500).json({ error: "Error creating records" });
  }
};

async function deleteDomainRecord(
  domainId,
  recordName,
  recordType,
  ttl,
  values
) {
  try {
    const resourceRecords = values.map((value) => {
      return {
        Value: value.trim(),
      };
    });
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: "DELETE",
            ResourceRecordSet: {
              Name: recordName,
              Type: recordType,
              TTL: ttl,
              ResourceRecords: resourceRecords,
            },
          },
        ],
      },
      HostedZoneId: domainId,
    };

    const command = new ChangeResourceRecordSetsCommand(params);
    const data = await client.send(command);

    if (data.ChangeInfo && data.ChangeInfo.Id) {
      console.log("Record deleted successfully:", data.ChangeInfo.Id);
      return data.ChangeInfo.Id;
    } else {
      throw new Error("Failed to delete record");
    }
  } catch (error) {
    console.error("Error deleting record:", error);
    throw error;
  }
}

module.exports.deleteRecord = async (req, res) => {
  try {
    const { domainId, recordName, recordType, ttl, values } = req.body;
    console.log(
      "Deleting domain record:",
      domainId,
      recordName,
      recordType,
      ttl,
      values
    );

    const result = await deleteDomainRecord(
      domainId,
      recordName,
      recordType,
      ttl,
      values
    );

    res.status(200).json({
      message: "Domain record deleted successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error deleting domain record:", error);
    res.status(500).json({ error: "Error deleting domain record" });
  }
};

async function createDomainRecord(
  domainId,
  domainName,
  recordName,
  recordType,
  recordValue,
  ttl = 300
) {
  try {
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: "CREATE",
            ResourceRecordSet: {
              Name: `${recordName}.${domainName}`,
              Type: recordType,
              TTL: ttl,
              ResourceRecords: [
                {
                  Value: recordValue,
                },
              ],
            },
          },
        ],
      },
      HostedZoneId: domainId,
    };

    const command = new ChangeResourceRecordSetsCommand(params);
    const data = await client.send(command);

    if (data.ChangeInfo && data.ChangeInfo.Id) {
      console.log("Record created successfully:", data.ChangeInfo.Id);
      return data.ChangeInfo.Id;
    } else {
      throw new Error("Failed to create record");
    }
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
}

module.exports.createRecord = async (req, res) => {
  try {
    const { domainId, domainName, mssg } = req.body;
    console.log("Creating domain record:", domainName, mssg);

    const result = await createDomainRecord(
      domainId,
      domainName,
      mssg.recordName,
      mssg.type,
      mssg.value,
      mssg.ttl
    );

    res.status(200).json({
      msg: {
        name: `${mssg.recordName}.${domainName}`,
        type: mssg.type,
        ttl: mssg.ttl,
        value: mssg.value,
        id: result,
      },
    });
  } catch (error) {
    console.error("Error creating domain record:", error);
    res.status(500).json({ error: "Error creating domain record" });
  }
};

async function fetchDomainRecords(domainName, domainId) {
  console.log(domainId, domainName);
  try {
    const params = {
      HostedZoneId: domainId,
      StartRecordName: domainName,
      MaxItems: "10",
    };

    const command = new ListResourceRecordSetsCommand(params);
    const data = await client.send(command);

    const domainRecords = data.ResourceRecordSets.map((record) => ({
      name: record.Name,
      type: record.Type,
      ttl: record.TTL,
      value: record.ResourceRecords.map((rr) => rr.Value),
    }));

    return domainRecords;
  } catch (error) {
    console.error("Error fetching domain records:", error);
    throw error;
  }
}

module.exports.fetchDomainRecords = async (req, res) => {
  try {
    const { domainName, domainId } = req.body;
    console.log("Hellooooooooooooooooooo", domainId, domainName);
    const domainRecords = await fetchDomainRecords(domainName, domainId);

    res.status(200).json({
      domainName: domainName,
      domainRecords: domainRecords,
    });
  } catch (error) {
    console.error("Error fetching domain records:", error);
    res.status(500).json({ error: "Error fetching domain records" });
  }
};
