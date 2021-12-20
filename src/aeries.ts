import { load as cheerioLoad } from "cheerio";
import fetchCookieWrapper from "fetch-cookie";
import nodeFetch, { Response } from "node-fetch";
import { stringify as queryStringify } from "qs";
import { CONFIG } from "./config.js";
import { ClassSummary } from "./types";

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
    const linkURL =
      typeof linkHref === "string" ? this.baseURL + linkHref : null;
    if (!validateUrl(linkURL)) return null;
    return linkURL;
  }

  async getClasses() {
    const data = await this.getRawClassSummary();
    return Array.from(data).map((period: any): ClassSummary => {
      const {
        Gradebook,
        CourseName,
        TeacherName,
        PeriodTitle,
        CurrentMarkAndScore,
        NumMissingAssignments,
      } = period;
      return {
        gradebookUrl: this.parseGradebook(Gradebook),
        name: CourseName,
        teacher: TeacherName,
        period: PeriodTitle,
        gradeSummary: CurrentMarkAndScore,
        missing:
          typeof NumMissingAssignments === "number"
            ? NumMissingAssignments.toString()
            : undefined,
      };
    });
  }
}

export function getClient() {
  return AeriesClient.create(CONFIG.AERIES_DOMAIN, "Student");
}
