import { Assignment, ClassSummary, ClassWithAssignments } from "./types.js";

export type CompareResult<T> = {
  removed: T[];
  added: T[];
  changed: [T, T][];
};

// TODO: No need to do nullish coallescing anymore so this can be simplified
export function toMapGeneric<K extends keyof T, T extends {}, D>(
  keyProp: K,
  values: T[],
  defaultKey: NonNullable<D>
): Map<NonNullable<T[K]> | D, T> {
  const m = new Map<NonNullable<T[K] | D>, T>();
  for (const c of values) {
    m.set(c[keyProp] ?? defaultKey, c);
  }
  return m;
}

export function compareDataGeneric<K extends keyof T, T extends {}, D>(
  keyProp: K,
  defaultKey: NonNullable<D>,
  oldData: T[],
  newData: T[]
): CompareResult<T> {
  const oldMap = toMapGeneric(keyProp, oldData, defaultKey);
  const newMap = toMapGeneric(keyProp, newData, defaultKey);
  const added = new Map(newMap);

  const removed = [];
  const remained = [];
  for (const [k, v] of oldMap.entries()) {
    if (newMap.has(k)) {
      remained.push(v);
      added.delete(k);
    } else {
      removed.push(v);
    }
  }
  const changed = remained
    .filter(
      (v) =>
        JSON.stringify(newMap.get(v[keyProp] ?? defaultKey)!) !=
        JSON.stringify(v)
    )
    .map((v): [T, T] => [v, newMap.get(v[keyProp] ?? defaultKey)!]);
  return { removed, added: Array.from(added.values()), changed };
}

export function classesToMap(classes: ClassSummary[]) {
  return toMapGeneric("name", classes, "");
}

export function classesWithAssignmentsToMap(classes: ClassWithAssignments[]) {
  return toMapGeneric("name", classes, "");
}

export function assignmentsToMap(assignments: Assignment[]) {
  return toMapGeneric("name", assignments, "");
}

export function compareClasses(
  oldData: ClassSummary[],
  newData: ClassSummary[]
): CompareResult<ClassSummary> {
  return compareDataGeneric("name", "", oldData, newData);
}

export function compareAssignments(
  oldData: Assignment[],
  newData: Assignment[]
): CompareResult<Assignment> {
  return compareDataGeneric("name", "", oldData, newData);
}
