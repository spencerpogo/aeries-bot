import { Cheerio, load as cheerioLoad } from "cheerio";
import fetchCookieWrapper from "fetch-cookie";
import nodeFetch, { Response } from "node-fetch";
import { stringify as queryStringify } from "qs";
import { CONFIG } from "./config.js";
import { Assignment, ClassSummary } from "./types";

type FetchFunction = typeof nodeFetch;

const userAgent = "AeriesDiscordBot/v1.0 (github.com/Scoder12)";

function validateUrl(urlString: string | null): boolean {
  if (!urlString) return false;
  let url;
  try {
    url = new URL(urlString);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const trim = (ele: Cheerio<any>) =>
  ele
    .text()
    .replace(/[\n\r\t]/gm, "")
    .trim();

export class LoginError extends Error {}

export class AeriesClient {
  readonly baseURL;
  readonly portalName;
  readonly fetch;

  constructor(baseURL: string, portalName: string, fetch: FetchFunction) {
    this.baseURL = baseURL;
    this.portalName = portalName;
    this.fetch = fetch;
  }

  static create(domain: string, portalName: string) {
    return new AeriesClient(
      domain + "/" + portalName,
      portalName,
      fetchCookieWrapper(nodeFetch)
    );
  }

  async _checkResponse(r: Response) {
    if (r.status != 200) {
      throw new Error(`Request failed with status code ${r.status}`);
    }
  }

  async login(username: string, password: string) {
    const body: string = queryStringify({
      checkCookiesEnabled: true,
      checkMobileDevice: false,
      checkStandaloneMode: false,
      checkTabletDevice: false,
      portalAccountUsername: username,
      portalAccountPassword: password,
      portalAccountUsernameLabel: "",
      "g-recaptcha-request-token": "",
    });
    const resp = await this.fetch(
      this.baseURL + "/LoginParent.aspx?page=Default.aspx",
      {
        method: "POST",
        body,
        redirect: "manual",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": userAgent,
        },
      }
    );
    if (
      resp.status != 302 ||
      resp.headers.get("location") != this.baseURL + "/Default.aspx"
    ) {
      throw new LoginError("Aeries login failed. Check your credentials.");
    }
  }

  async getRawClassSummary(): Promise<any> {
    const res = await this.fetch(
      this.baseURL + "/Widgets/ClassSummary/GetClassSummary?IsProfile=True",
      {
        headers: {
          "User-Agent": userAgent,
        },
        redirect: "manual",
      }
    );
    this._checkResponse(res);
    return await res.json();
  }

  // parse out the gradebook link from the HTML inside the returned JSON data
  parseGradebook(linkHTML: string): string | null {
    const $ = cheerioLoad(linkHTML);
    const linkHref = $("a.GradebookLink").first().attr("href");
    if (!linkHref) return null;
    if (!validateUrl(this.baseURL + linkHref)) return null;
    return linkHref;
  }

  async getClasses(): Promise<ClassSummary[]> {
    const data = await this.getRawClassSummary();
    const classes: ClassSummary[] = Array.from(data)
      .map((period: any): ClassSummary | null => {
        const {
          Gradebook,
          CourseName,
          TeacherName,
          PeriodTitle,
          CurrentMarkAndScore,
          NumMissingAssignments,
        } = period;
        const gradebookUrl = this.parseGradebook(Gradebook);
        if (!gradebookUrl) return null;
        const missing = Number(NumMissingAssignments);
        if (isNaN(missing)) return null;
        return {
          gradebookUrl,
          name: CourseName,
          teacher: TeacherName,
          period: PeriodTitle,
          gradeSummary: CurrentMarkAndScore,
          missing: missing.toString(),
        };
      })
      .filter((c): c is ClassSummary => c !== null);
    return classes;
  }

  async getAssignments(gradebookUrl: string): Promise<Assignment[]> {
    // Aeries is very weird and will throw an error if SC is not set, yet they don't
    //  include it in the URLs returned by the ClassSummary widget.
    const url = new URL(this.baseURL + "/" + gradebookUrl);
    url.searchParams.set("SC", "42");

    const res = await this.fetch(url.toString(), {
      headers: { "user-agent": userAgent },
    });
    this._checkResponse(res);
    const html = await res.text();
    const $ = cheerioLoad(html);
    const assignmentRows = $(
      "#ctl00_MainContent_subGBS_tblEverything " +
        "table.GradebookDetailsTable " +
        "tr.assignment-info"
    );
    const assignments = assignmentRows
      .get()
      .map((row): Assignment | null => {
        const cells = $(row).children("td");
        if (cells.length != 11) return null;
        // prettier-ignore
        const [
          , // id
          name,
          category,
          score, 
          // this is the "raw" score before it is compressed to fit into the amount of
          //  points the assignment is worth.most of the time it is the same as score.
          , 
          percent, // percentage
          , // comment
          , // date completed
          , // due date
          gcElem,
          , // documents
        ] = cells;
        // score is a table with a single row and 3 columns
        const scoreItems = $(score).find("td");
        let points = null;
        let maxPoints = null;
        if (scoreItems.length == 3) {
          points = Number(trim($(scoreItems[0])));
          // scoreItems[1].innerText == ' / '
          maxPoints = Number(trim($(scoreItems[2])));
        }
        // we default to yes when unsure
        const gradingComplete = trim($(gcElem)).toLowerCase() !== "no";
        return {
          name: trim($(name)),
          category: trim($(category)),
          points,
          maxPoints,
          percent: trim($(percent)),
          gradingComplete,
        };
      })
      .filter((i): i is Assignment => i !== null);
    return assignments;
  }
}

export function getClient() {
  return AeriesClient.create(CONFIG.AERIES_DOMAIN, "Student");
}
