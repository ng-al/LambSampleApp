var app = require("./server/app");

var port = process.env.PORT || "3000";
app.set("port", port);
app.server.listen(app.get("port"));

console.log("node.js server listening on port " + port);
