import express, { Request } from "express";

const app = express();
app.use(express.urlencoded({ extended: false }));

const portalName = "Student";

app.get("/", (_, res) => res.end("fakeAeriesServer"));

// top 10 most secure apps 1993 (imagine installing cookieParser)
const authed = (req: Request) =>
  (req.headers.cookie || "").indexOf("authed") != -1;

app.post(`/${portalName}/LoginParent.aspx`, (req, res) => {
  if (authed(req)) return res.redirect("/");

  const { portalAccountUsername, portalAccountPassword } = req.body;
  if (portalAccountUsername == "demo" && portalAccountPassword == "demo") {
    res.cookie("authed", "true", { maxAge: 900000 });
    return res.redirect(
      `${req.protocol}://${req.headers.host || ""}/${portalName}/Default.aspx`
    );
  }
  res.status(400).end("Bad credz");
});

type SummaryData = {
  Gradebook: string;
  CourseName: string;
  TeacherName: string;
  PeriodTitle: string;
  CurrentMarkAndScore: string;
  NumMissingAssignments: number;
};

type Assignment = {
  id: number;
  name: string;
  category: string;
  points: number;
  maxPoints: number;
  comment: string;
  gradingComplete: boolean;
  documents: string;
};

type ClassData = {
  id: number;
  data: SummaryData;
  assignments: Assignment[];
};

function makeFakeAssignment(n: number): Assignment {
  return {
    id: n,
    name: `assignment ${n}`,
    category: "assignments",
    points: 8,
    maxPoints: 20,
    comment: "hi",
    gradingComplete: true,
    documents: "",
  };
}

function makeFakeClass(n: number): ClassData {
  return {
    id: n,
    data: {
      // TODO: Implement assignment checking
      Gradebook: `<a class="GradebookLink" href="/class/${n}">`,
      CourseName: `class ${n}`,
      TeacherName: `teacher ${n}`,
      PeriodTitle: n.toString(),
      CurrentMarkAndScore: "F (69.42%)",
      NumMissingAssignments: 42,
    },
    assignments: [...Array(2).keys()].map(makeFakeAssignment),
  };
}

const classes = [...Array(2).keys()].map(makeFakeClass);

function calcGrade(c: ClassData) {
  // we are assuming only one category so take the average of assignments scores.
  const scores = c.assignments.map((a) => a.points / a.maxPoints);
  return (scores.reduce((a, b) => a + b) / scores.length) * 100;
}

function formatGrade(grade: number) {
  // we aren't going to mess with letter grades
  return `A (${grade.toFixed(2)}%)`;
}

function getClassData(): SummaryData[] {
  return classes.map((c) => ({
    ...c.data,
    CurrentMarkAndScore: formatGrade(calcGrade(c)),
  }));
}

app.get(`/${portalName}/Widgets/ClassSummary/GetClassSummary`, (req, res) => {
  if (!authed(req)) return res.status(401).end("auth pls");
  const data: SummaryData[] = getClassData();
  res.json(data);
});

function formatScoreTable(points: number, maxPoints: Number) {
  const content = [points, " / ", maxPoints]
    .map((i) => `<td>${i}</td>`)
    .join("");
  return `<table><tbody><tr>${content}</tr></tbody></table>`;
}

function formatAssignmentAsRow(a: Assignment) {
  const score = formatScoreTable(a.points, a.maxPoints);
  const date = "01-01-2001";
  const items = [
    a.id,
    a.name,
    a.category,
    score,
    score,
    ((a.points / a.maxPoints) * 100).toFixed(2) + "%",
    a.comment,
    date,
    date,
    a.gradingComplete ? "Yes" : "No",
    a.documents,
  ];
  if (items.length !== 11)
    throw new Error("Should have 11 columns, got " + items.length);
  const cols = items.map((i) => `<td>${i}</td>`).join("\n");
  return `<tr class="assignment-info">${cols}</tr>`;
}

app.get(`/${portalName}/class/:id`, (req, res) => {
  if (!authed(req)) return res.status(401).end("auth pls");
  const id = Number(req.params.id);
  const matches = classes.filter((c) => c.id == id);
  if (matches.length !== 1) return res.status(404).end("Class not found");
  const [c] = matches;

  // we do a little bit of "XSS"
  const tableContent = c.assignments.map(formatAssignmentAsRow).join("\n");
  return res.send(`<div id="ctl00_MainContent_subGBS_tblEverything">
  <table class="GradebookDetailsTable">
  <tbody>
  ${tableContent}
  </tbody>
  </table>
  </div>`);
});

app.listen(4337, () => console.log("http://127.0.0.1:4337/"));
