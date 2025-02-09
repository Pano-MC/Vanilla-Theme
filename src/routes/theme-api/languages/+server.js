import fs from "fs";
import path from "path";

/** @type {import("@sveltejs/kit").RequestHandler} */
export async function GET() {
  const languagesDir = path.resolve("src/lib/lang");
  const files = fs.readdirSync(languagesDir);
  const languages = {};

  files.forEach(file => {
    const filePath = path.join(languagesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const locale = path.basename(file, ".json");
    languages[locale] = {
      locale,
      name: content.name,
      "date-fns-code": content["date-fns-code"],
      derivatives: content.derivatives || []
    };
  });

  return new Response(JSON.stringify(languages), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
