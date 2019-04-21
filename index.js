const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const git = require("./lib/git");
const http = require("./lib/http");
const io = require("./lib/io");
const json = require("./lib/json");
const log = require("log-less-fancy")();

if (!process.env.DEBUG) process.env.DEBUG = "*";

function kjørLastejobb(jsFile) {
  log.debug("Kjører " + jsFile);
  const r = spawnSync("node", ["--max_old_space_size=2096", `"${jsFile}"`], {
    encoding: "buffer",
    shell: true,
    stdio: [0, 1, 2]
  });
  if (r.status > 0) process.exit(1);
}

function kjørLastejobberUnder(rotkatalog) {
  let files = io.findFiles(rotkatalog, ".js");
  files = files.sort();
  log.info("Fant " + files.length + " lastejobber");
  files = files.filter(file => file.indexOf(".test") < 0);
  files.forEach(file => kjørLastejobb(file));
}

module.exports = {
  git,
  http,
  io,
  json,
  kjørLastejobberUnder,
  kjørLastejobb,
  log
};
