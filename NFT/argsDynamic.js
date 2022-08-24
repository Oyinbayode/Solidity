const fs = require("fs");

const one = fs.readFileSync("./images/dynamic/frown.svg", {
  encoding: "utf8",
});

const two = fs.readFileSync("./images/dynamic/happy.svg", {
  encoding: "utf8",
});

module.exports = ["0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", one, two];
