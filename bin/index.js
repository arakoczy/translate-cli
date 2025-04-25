#! /usr/bin/env node

import chalk from "chalk";
import boxen from "boxen";
import translate from "@vitalets/google-translate-api";
import yargs from "yargs";
import figlet from "figlet";
import { hideBin } from "yargs/helpers";
import ora from "ora";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const usage = "Usage: translate -l <language> -s <sentence>";

const parser = yargs(hideBin(process.argv))
  .usage(usage)
  .option("l", {
    alias: "language",
    describe: "Translate to language",
    type: "string",
  })
  .option("s", {
    alias: "sentence",
    describe: "Sentence to be translated",
    type: "string",
  })
  .version(version)
  .help(true);

const argv = parser.argv;

const language = argv.language || argv.l;
const sentence = argv.sentence || argv.s;

if (!sentence || !language) {
  console.log(
    chalk.yellow(
      figlet.textSync(`Translate CLI v${version}`, {
        horizontalLayout: "full",
      })
    )
  );

  console.log(
    boxen(chalk.green("Translates a sentence into a specific language 🌍"), {
      padding: 1,
      margin: 1,
      borderColor: "green",
      dimBorder: true,
      align: "left",
    })
  );
  parser.showHelp();
  process.exit(1);
}

const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"];

let colorIndex = 0;
const spinner = ora({
  text: `Translating "${sentence}" to ${language}...`,
  spinner: "grenade",
  color: colors[colorIndex],
}).start();

const colorInterval = setInterval(() => {
  colorIndex = (colorIndex + 1) % colors.length;
  spinner.color = colors[colorIndex];
}, 100);

translate(sentence, { to: language.toLowerCase() })
  .then((res) => {
    clearInterval(colorInterval);
    spinner.succeed("Translation completed!");
    console.log(
      "\n" +
        boxen(chalk.green(`${sentence}\n\n${res.text}`), {
          padding: 1,
          borderColor: "green",
          dimBorder: true,
          borderStyle: "classic",
        }) +
        "\n"
    );
  })
  .catch((err) => {
    clearInterval(colorInterval);
    spinner.fail("Translation failed.");
    console.error(chalk.red("Error:"), err);
  });
