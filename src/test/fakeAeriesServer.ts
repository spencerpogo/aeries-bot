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

type ClassData = {
  id: number;
  data: SummaryData;
};

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
  };
}

const classes = [...Array(2).keys()].map(makeFakeClass);

function getClassData(): SummaryData[] {
  return classes.map((c) => c.data);
}

app.get(`/${portalName}/Widgets/ClassSummary/GetClassSummary`, (req, res) => {
  if (!authed(req)) return res.status(401).end("auth pls");
  const data: SummaryData[] = getClassData();
  res.json(data);
});

app.listen(4337, () => console.log("http://127.0.0.1:4337/"));
