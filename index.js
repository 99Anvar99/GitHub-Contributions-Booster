const m_jsonfile = require("jsonfile");
const m_moment = require("moment");
const m_simpleGit = require("simple-git");
const readline = require("readline");
const fs = require("fs");

const FILE_PATH = "./data.json";
const DATE_FORMAT = "YYYY-MM-DD";

console.log(`
███████╗ ██╗████████╗██╗  ██╗██╗   ██╗██████╗      ██████╗ ██████╗ ███╗   ██╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗███████╗     ██████╗  ██████╗  ██████╗ ███████╗████████╗███████╗██████╗
██╔════╝ ██║╚══██╔══╝██║  ██║██║   ██║██╔══██╗    ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝     ██╔══██╗██╔═══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██║  ███╗██║   ██║   ███████║██║   ██║██████╔╝    ██║     ██║   ██║██╔██╗ ██║   ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║███████╗     ██████╔╝██║   ██║██║   ██║███████╗   ██║   █████╗  ██████╔╝
██║   ██║██║   ██║   ██╔══██║██║   ██║██╔══██╗    ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║     ██╔══██╗██║   ██║██║   ██║╚════██║   ██║   ██╔══╝  ██╔══██╗
╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██████╔╝    ╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║███████║     ██████╔╝╚██████╔╝╚██████╔╝███████║   ██║   ███████╗██║  ██║
 ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝      ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝     ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝

 ┳┓    ┳┳┓•      ┏┓┏┓┏┓┏┓
 ┣┫┓┏  ┃┃┃┓┏╋┏┓┏┓┗┫┗┫┣┫┏┛
 ┻┛┗┫  ┛ ┗┗┛┗┗ ┛ ┗┛┗┛┗┛┗━
    ┛
 `);

 console.log('"Press Ctrl+C to exit at any time"\n');

async function makeCommits(startDate, endDate, commitsPerDay) {
  let currentDate = m_moment(startDate);
  const git = m_simpleGit();
  const RANDOMIZE = commitsPerDay.toLowerCase() === "random";

  while (currentDate.isSameOrBefore(endDate)) {
    const DATE = currentDate.format(DATE_FORMAT);
    const log = await git.log({ "--since": DATE, "--until": DATE });

    if (log.total === 0) {
      const commits = RANDOMIZE
        ? Math.floor(Math.random() * 10) + 1
        : parseInt(commitsPerDay, 10);
      for (let i = 0; i < commits; i++) {
        await m_jsonfile.writeFile(FILE_PATH, { date: DATE }, { flag: "a" });
        await git.add(FILE_PATH).commit(DATE, { "--date": DATE });
        console.log(`Data committed for ${DATE}`);
      }
    } else {
      console.log(`Already committed for ${DATE}, skipping...`);
    }

    currentDate.add(1, "days");
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "What start date would you like to set from (YYYY-MM-DD)? ",
  (startDate) => {
    if (!m_moment(startDate, DATE_FORMAT, true).isValid()) {
      console.error("Invalid start date format.");
      rl.close();
      return;
    }

    rl.question(
      "What end date would you like to set to (YYYY-MM-DD)? ",
      (endDate) => {
        if (!m_moment(endDate, DATE_FORMAT, true).isValid()) {
          console.error("Invalid end date format.");
          rl.close();
          return;
        }

        rl.question(
          'How many commits a day (or type "random" to randomize up to 10)? ',
          async (commitsPerDay) => {
            if (
              commitsPerDay.toLowerCase() !== "random" &&
              isNaN(parseInt(commitsPerDay, 10))
            ) {
              console.error("Invalid number of commits.");
              rl.close();
              return;
            }

            await makeCommits(startDate, endDate, commitsPerDay).catch(
              console.error
            );

            rl.question(
              "Are you ready to push the commits? (yes/no) ",
              async (answer) => {
                if (answer.toLowerCase() === "yes") {
                  const git = m_simpleGit();
                  await git.push().catch(console.error);
                  console.log("Commits pushed successfully.");

                  fs.writeFileSync(FILE_PATH, JSON.stringify([]));
                  console.log("data.json file cleared.");

                  await git
                    .add(FILE_PATH)
                    .commit("Cleared data.json")
                    .push()
                    .catch(console.error);
                  console.log("Cleared data.json commit pushed successfully.");
                } else {
                  console.log("Commits not pushed.");
                }
                rl.close();
              }
            );
          }
        );
      }
    );
  }
);