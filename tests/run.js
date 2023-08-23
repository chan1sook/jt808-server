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
    console.log(data, data.toJSON());
  } catch (err) {
    console.log(err.message);
  }
}
