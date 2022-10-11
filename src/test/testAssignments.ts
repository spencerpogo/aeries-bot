import { getClient } from "../aeries.js";

async function main() {
  const client = getClient();
  await client.login("demo", "demo");
  console.log(await client.gradebookDetails("class/1"));
}

main();
