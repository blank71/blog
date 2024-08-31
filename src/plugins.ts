import { alert } from "npm:@mdit/plugin-alert@0.12.0";
import basePath from "lume/plugins/base_path.ts";
import date, { Options as DateOptions } from "lume/plugins/date.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import footnotes from "https://deno.land/x/lume_markdown_plugins@v0.7.0/footnotes.ts";
// import image from "https://deno.land/x/lume_markdown_plugins@v0.7.0/image.ts";
import katex from "lume/plugins/katex.ts";
import { merge } from "lume/core/utils/object.ts";
import metas from "lume/plugins/metas.ts";
import ogImages, { Options as ogOptions } from "lume/plugins/og_images.ts";
import pagefind, { Options as PagefindOptions } from "lume/plugins/pagefind.ts";
import postcss from "lume/plugins/postcss.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
// import resolveUrls from "lume/plugins/resolve_urls.ts";
import satori, { SatoriOptions } from "lume/deps/satori.ts";
// import sitemap from "lume/plugins/sitemap.ts";
// import terser from "lume/plugins/terser.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.7.0/toc.ts";

import { read } from "lume/core/utils/read.ts";
import { ja } from "https://esm.sh/date-fns@3.6.0/locale/ja";

import "lume/types.ts";

// import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
// import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";
// import { readAll } from "io/read_all.ts";

// await download(
//   "https://github.com/googlefonts/morisawa-biz-ud-gothic/releasesdownload/v1.051/BIZUDGothic.zip",
//   {
//     dir: ".",
//     file: "download.zip",
//   },
// );
// const destination = await decompress("./download.zip", ".");

// const fontFile = await Deno.open(destination);
// const fontBuf = await readAll(fontFile);
// fontFile.close();

export interface Options {
  date?: Partial<DateOptions>;
  feed?: Partial<FeedOptions>;
  feedblog?: Partial<FeedOptions>;
  feeddiary?: Partial<FeedOptions>;
  og?: Partial<ogOptions>;
  pagefind?: Partial<PagefindOptions>;
  prism?: Partial<PrismOptions>;
  satoriOp?: SatoriOptions;
}

export const defaults: Options = {
  feed: {
    output: ["/feed.rss"],
    query: "type*=blog|diary",
    sort: "date=desc",
    info: {
      title: "=metas.site",
      description: "=metas.description",
      lang: "=metas.lang",
      generator: "=metas.generator",
    },
    items: {
      published: "=date",
    },
  },
  feedblog: {
    output: ["/blog.rss"],
    query: "type=blog",
    sort: "date=desc",
    info: {
      title: "=metas.site",
      description: "=metas.description",
      lang: "=metas.lang",
      generator: "=metas.generator",
    },
    items: {
      title: "=title",
    },
  },
  feeddiary: {
    output: ["/diary.rss"],
    query: "type=diary",
    sort: "date=desc",
    info: {
      title: "=metas.site",
      description: "=metas.description",
      lang: "=metas.lang",
      generator: "=metas.generator",
    },
    items: {
      title: "=title",
    },
  },
  satoriOp: {
    width: 1200,
    height: 600,
    fonts: [{
      name: "Noto Sans JP",
      weight: 400,
      style: "normal",
      data: await read(
        "https://cdn.jsdelivr.net/npm/@openfonts/noto-sans-jp_japanese@1.44.5/files/noto-sans-jp-japanese-400.woff",
        true,
      ),
    }, {
      name: "Noto Sans JP",
      weight: 600,
      style: "normal",
      data: await read(
        "https://cdn.jsdelivr.net/npm/@openfonts/noto-sans-jp_japanese@1.44.5/files/noto-sans-jp-japanese-700.woff",
        true,
      ),
    }],
  },
};

export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site
      .use(basePath())
      .use(date({ locales: { ja } }))
      .use(feed(options.feed))
      .use(feed(options.feedblog))
      .use(feed(options.feeddiary))
      .use(footnotes())
      // .use(image())
      .use(katex())
      .use(ogImages({
        extensions: [".html"],
        cache: false,
        satori: options.satoriOp,
      })) // needs before metas
      .use(metas())
      .use(pagefind(options.pagefind))
      .use(postcss())
      .use(prism(options.prism))
      // .use(resolveUrls())
      // .use(sitemap())
      // .use(terser())
      .use(toc());

    // Alert plugin
    site.hooks.addMarkdownItPlugin(alert);
  };
}
