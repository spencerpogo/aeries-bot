import { getClient } from "../aeries";

async function main() {
  const client = getClient();
  await client.login("demo", "demo");
  console.log(await client.getAssignments("class/1"));
}

main();
