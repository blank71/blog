import lume from "lume/mod.ts";
import plugins from "./src/plugins.ts";

const site = lume({
  location: new URL("https://blog.blank71.com/"),
  src: "./src",
  dest: "./output",
});

site.ignore(
  ".gitignore",
  "deno.json",
  "deno.lock",
  "README.md",
);

site.use(plugins());

export default site;
