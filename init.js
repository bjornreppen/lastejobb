const { log, processes } = require("./lib");
const fs = require("fs");

const exec = processes.exec;

const scripts = {
  download: "node index download",
  transform: "node index transform",
  build: "npm run download && npm run transform",
  deploy: "node index deploy"
};

function addScripts() {
  log.info("Add scripts to package.json");
  const pjson = JSON.parse(fs.readFileSync("package.json"));
  Object.keys(scripts).forEach(key => {
    if (pjson.scripts[key])
      return log.warn("Script '" + key + "' already exists.");
    pjson.scripts[key] = scripts[key];
  });
  fs.writeFileSync("package.json", JSON.stringify(pjson, null, " "));
}

function writeIndex() {
  log.info("Create index.js");
  if (fs.existsSync("index.js")) return log.warn("index.js already exists.");
  const index = [
    'if (!process.env.DEBUG) process.env.DEBUG = "*"',
    'const { kjørLastejobberUnder } = require("lastejobb")',
    "",
    'const scripPath = "stages/" + (process.argv[2] || "")',
    "kjørLastejobberUnder(scripPath)"
  ];
  fs.writeFileSync("index.js", index.join("\n"));
}

function addReadme() {
  log.info("Create README.md");
  if (fs.existsSync("README.md")) return log.warn("index.js already exists.");
  const filePath = __dirname + "/README.md";
  const readme = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync("README.md", readme);
}

function mkdir(path) {
  log.info("Make directory " + path);
  if (fs.existsSync(path)) return;
  fs.mkdirSync(path);
}

function makeDirs() {
  mkdir("stages");
  mkdir("stages/download");
  mkdir("stages/transform");
  mkdir("stages/deploy");
}

function installLastejobb() {
  log.info("Installing library lastejobb");
  exec("npm", ["install", "lastejobb"]);
}

function makeStep(fn) {
  log.info("Create " + fn);
  const script = [
    'const { log } = require("lastejobb");',
    "",
    'log.info("Processing...")'
  ];
  if (fs.existsSync(fn)) return log.warn(fn + " already exists");
  fs.writeFileSync(fn, script.join("\n"));
}

function makeSteps() {
  makeStep("stages/download/10_sample.js");
  makeStep("stages/transform/10_sample.js");
  makeStep("stages/deploy/10_sample.js");
}

async function npmInit() {
  if (fs.existsSync("package.json")) return;
  log.info("Initialize npm project");
  await exec("npm", ["init", "-y"]);
}

function gitInit() {
  if (fs.existsSync(".git")) return;
  log.info("Initialize Git repo");
  exec("git", ["init"]);
}

function makeGitIgnore() {
  if (fs.existsSync(".gitignore")) return;
  const ignore = ["node_modules", "temp", "build"];
  fs.writeFileSync(".gitignore", ignore.join("\n"));
}

async function init() {
  gitInit();
  makeGitIgnore();
  await npmInit();
  installLastejobb();
  addScripts();
  writeIndex();
  makeDirs();
  makeSteps();
  addReadme();
}

module.exports = { init };
