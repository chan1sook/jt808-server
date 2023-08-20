const {
  Jtt808ProtocolParser,
  Jtt808ProtocolData,
  Jtt808LocationReportData,
} = require("@chan1sook/jtt808-server");
const protocolDataList = require("./protocol_data");
const parser = new Jtt808ProtocolParser();

for (const data of protocolDataList.actualData) {
  const buffer = Buffer.from(data, "hex");
  try {
    const data = parser.parse(buffer);
    if (data instanceof Jtt808LocationReportData) {
      console.log(data, {
        deviceNumber: data.deviceNumber,
        networkType: data.networkType,
        latitude: data.latitude,
        longitude: data.longitude,
        altitudeMeter: data.altitudeMeter,
        speedKmHr: data.speedKmHr,
        directionDeg: data.directionDeg,
        timestamp: data.timestamp,
      });
    } else if (data instanceof Jtt808ProtocolData) {
      console.log(data, {
        messageType: data.messageType,
        deviceNumber: data.deviceNumber,
        length: data.messageLength,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
}
