import { ClassSummary } from "./types.js";

function classesToMap(classes: ClassSummary[]): Map<string, ClassSummary> {
  const m = new Map<string, ClassSummary>();
  for (const c of classes) {
    m.set(c.name ?? "", c);
  }
  return m;
}

export type CompareResult = {
  removed: ClassSummary[];
  added: ClassSummary[];
  changed: [ClassSummary, ClassSummary][];
};

export function compareData(
  // TODO: fix this type to be shared between notifications.ts and here
  oldData: { classes: ClassSummary[] },
  newData: ClassSummary[]
): CompareResult {
  const oldClasses = classesToMap(oldData.classes);
  const newClasses = classesToMap(newData);
  const added = new Map(newClasses);

  const removed = [];
  const remained = [];
  for (const [name, c] of oldClasses.entries()) {
    if (newClasses.has(name)) {
      remained.push(c);
      added.delete(name);
    } else {
      removed.push(c);
    }
  }
  const changed = remained
    .filter((c) => newClasses.get(c.name ?? "")! != c)
    .map((c): [ClassSummary, ClassSummary] => [
      c,
      newClasses.get(c.name ?? "")!,
    ]);
  return { removed, added: Array.from(added.values()), changed };
}
