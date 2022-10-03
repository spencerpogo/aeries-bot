import { inspect } from "util";
import { compareClasses, CompareResult } from "../compareData.js";
import { ClassSummary } from "../types.js";

function assert(cond: boolean) {
  if (!cond) throw new Error("Assertion failed");
}

function makeFakeSummary(data: string): ClassSummary {
  return {
    name: data,
    teacher: data,
    gradeSummary: data,
    gradebookUrl: data,
    period: data,
    missing: data,
  };
}

// given objects, a mapping of variable names to their values, will replace
//  instances of those objects in data with the variable name string.
function genSummary(
  data: Record<string, any>,
  objects: Record<string, any>
): Record<string, any> {
  const objStrings = new Map();
  for (const [k, v] of Object.entries(objects)) {
    objStrings.set(JSON.stringify(v), k);
  }

  const replacer = (v: any): any => {
    if (Array.isArray(v)) return v.map(replacer);

    const vString = JSON.stringify(v);
    return objStrings.get(vString) ?? v;
  };

  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, replacer(v)])
  );
}

function runTest() {
  const class1: ClassSummary = makeFakeSummary("1");
  const class2: ClassSummary = makeFakeSummary("2");
  const changedClass2: ClassSummary = { ...class2, gradeSummary: "F" };
  const class3: ClassSummary = makeFakeSummary("3");

  const got: CompareResult<ClassSummary> = compareClasses(
    [class1, class2],
    [class3, changedClass2]
  );
  // WARNING attribute order matters because we are comparing with JSON.stringify
  // (js is dumb)
  const expected: CompareResult<ClassSummary> = {
    removed: [class1],
    added: [class3],
    changed: [[class2, changedClass2]],
  };

  const objects = { class1, class2, changedClass2, class3 };
  console.log(
    inspect(
      {
        got: genSummary(got, objects),
        expected: genSummary(expected, objects),
      },
      { showHidden: false, depth: null, colors: true }
    )
  );
  assert(JSON.stringify(got) == JSON.stringify(expected));
}

runTest();
