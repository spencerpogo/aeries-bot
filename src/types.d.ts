import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
} from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js/node_modules/discord-api-types";

export interface CommandMeta {
  name: string;
  toJSON: () => RESTPostAPIApplicationCommandsJSONBody;
}

export type CommandType = {
  meta: CommandMeta;
  handler: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;
};

export interface Assignment {
  name: string;
  category: string;
  points: number | null;
  maxPoints: number | null;
  percent: string;
  gradingComplete: boolean;
  // there are more fields possible but we don't use them for now...
}

export interface ClassSummary {
  gradebookUrl: string; // parse(Gradebook)
  name: string; // CourseName
  teacher: string; // TeacherName
  period: string; // PeriodTitle or Period.toString()
  gradeSummary: string; // CurrentMarkAndScore
  missing: string; // regex match ">(.*)<" or getTextFromHtml(MissingAssignments)
}

export type ClassWithAssignments = ClassSummary & { assignments: Assignment[] };

export type CategoryData = {
  cat: string;
  percOfGrade: number;
  points: number;
  max: number;
};

export type GradebookDetails = {
  assignments: Assignment[];
  categories: CategoryData[];
};
