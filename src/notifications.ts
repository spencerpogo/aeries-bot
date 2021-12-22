import { Embed } from "@discordjs/builders";
import { User } from "@prisma/client";
import { EmbedFieldData, Util } from "discord.js";
import { getClient } from "./aeries.js";
import { client } from "./client.js";
import { compareData } from "./compareData.js";
import { prisma } from "./db.js";
import { ClassSummary } from "./types.js";

// TODO: support assignments
type GradesData = {
  classes: ClassSummary[];
};

function formatClass(c: ClassSummary): string {
  return (
    Util.escapeMarkdown(c.name ?? "?") +
    " - " +
    Util.escapeMarkdown(c.teacher ?? "?")
  );
}

function codeblock(lang: string, val: string) {
  return `\`\`\`${lang}\n${Util.escapeCodeBlock(val)}\n\`\`\``;
}

function parseGradeSummary(gradeSummary: string): number | null {
  const m = /.*\(((\d*\.)?\d+)%\)/g.exec(gradeSummary);
  if (!m) return null;
  const n = Number(m[1]);
  return isNaN(n) ? null : n;
}

function formatRemoved(c: ClassSummary): EmbedFieldData {
  return {
    name: "Class Removed",
    value: codeblock("diff", `- ${formatClass(c)}`),
  };
}

function formatAdded(c: ClassSummary): EmbedFieldData {
  return {
    name: "Class Added",
    value: codeblock("diff", `+ ${formatClass(c)}`),
  };
}

function formatChanged(old: ClassSummary, c: ClassSummary): EmbedFieldData[] {
  // we only care about grade changes for now
  if (
    !old.gradeSummary ||
    !c.gradeSummary ||
    old.gradeSummary === c.gradeSummary
  )
    return [];

  const oldGrade = parseGradeSummary(old.gradeSummary);
  const newGrade = parseGradeSummary(c.gradeSummary);
  let prefix = "Grade changed";
  if (oldGrade !== null && newGrade !== null) {
    if (newGrade > oldGrade) {
      prefix = "📈 Grade increase";
    } else if (newGrade < oldGrade) {
      prefix = "📉 Grade decrease";
    }
  }
  return [
    {
      name: `${prefix} in ${formatClass(c)}`,
      value: `${Util.escapeMarkdown(old.gradeSummary)} :arrow_right: ${
        c.gradeSummary
      }`,
    },
  ];
}

async function processUser(user: User): Promise<EmbedFieldData[]> {
  const client = getClient();
  await client.login(user.portalUsername, user.portalPassword);
  const classes = await client.getClasses();

  if (!user.notificationsCache) {
    const newData: GradesData = { classes };
    await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationsCache: JSON.stringify(newData),
      },
    });
    return [];
  }
  const oldData: GradesData = JSON.parse(user.notificationsCache);
  const { removed, added, changed } = compareData(oldData, classes);
  const embeds = removed
    .map(formatRemoved)
    .concat(added.map(formatAdded))
    .concat(changed.flatMap(([a, b]) => formatChanged(a, b)));
  return embeds;
}

async function sendAlert(discordId: string, embeds: EmbedFieldData[]) {
  if (!embeds.length) return;
  const user = await client.users.fetch(discordId);
  await user.send({
    content: "Grade alert",
    embeds: [new Embed().addFields(...embeds)],
  });
}

export async function sendNotifications() {
  const toProcess = await prisma.user.findMany({
    where: { notificationsEnabled: true },
  });
  for (const user of toProcess) {
    try {
      const embeds = await processUser(user);
      // send the embeds, 10 at a time
      const MAX_EMBEDS = 1;
      for (let i = 0; i < embeds.length; i += MAX_EMBEDS) {
        const chunk = embeds.slice(i, i + MAX_EMBEDS);
        await sendAlert(user.discordId, chunk);
      }
    } catch (e) {
      // Don't crash the entire process on error
      // TODO: log these with a webhook
      console.error(e);
      continue;
    }
  }
}
