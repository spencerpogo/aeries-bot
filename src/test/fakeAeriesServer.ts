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

type ClassData = {
  Gradebook: string;
  CourseName: string;
  TeacherName: string;
  PeriodTitle: string;
  CurrentMarkAndScore: string;
  NumMissingAssignments: number;
};

function getClassData(): ClassData[] {
  return [
    {
      Gradebook: '<a class="GradebookLink" href="/class1">',
      CourseName: "class",
      TeacherName: "teacher",
      PeriodTitle: "1",
      CurrentMarkAndScore: "F (69.42%)",
      NumMissingAssignments: 42,
    },
  ];
}

app.get(`${portalName}/Widgets/ClassSummary/GetClassSummary`, (req, res) => {
  if (!authed(req)) return res.status(401).end("auth pls");
  res.json(getClassData());
});

app.listen(4337, () => console.log("http://127.0.0.1:4337/"));
