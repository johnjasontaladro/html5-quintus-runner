const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use("/", express.static(__dirname));


app.listen(1337, () => {
  console.log("Server listens on port 1337");
});
