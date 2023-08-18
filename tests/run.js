const { Jtt808Server } = require("@chan1sook/jtt808-server");

const jtt808Server = new Jtt808Server();

jtt808Server.on("start", (port) => {
  console.log(`JT/T808 Server Start at port ${port}`);
});
jtt808Server.on("close", () => {
  console.log("JT/T808 Server Closed");
});

jtt808Server.listen(7999);
