import { mergeNewClassSummary } from "../notifications.js";
import { Assignment, ClassSummary } from "../types.js";

function fakeClass(n: number): ClassSummary {
  return {
    name: `class ${n}`,
    teacher: `teacher ${n}`,
    gradebookUrl: "",
    period: n.toString(),
    gradeSummary: "F",
    missing: "0",
  };
}

function fakeAssignment(n: number): Assignment {
  return {
    name: `assignment ${n}`,
    category: "yo",
    points: 5,
    maxPoints: 10,
    percent: "50.0%",
    gradingComplete: true,
  };
}

const class1: ClassSummary = fakeClass(1);
const assignment1: Assignment = fakeAssignment(1);
const assignment2: Assignment = fakeAssignment(2);

console.log(
  (
    await mergeNewClassSummary(
      [{ ...class1, assignments: [assignment1, assignment2] }],
      [{ ...class1, gradeSummary: "A" }],
      async () => [assignment2]
    )
  ).get(class1.name)
);
