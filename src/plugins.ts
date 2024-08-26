import { alert } from "npm:@mdit/plugin-alert@0.12.0";
import basePath from "lume/plugins/base_path.ts";
import date, { Options as DateOptions } from "lume/plugins/date.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import footnotes from "https://deno.land/x/lume_markdown_plugins@v0.7.0/footnotes.ts";
// import image from "https://deno.land/x/lume_markdown_plugins@v0.7.0/image.ts";
import katex from "lume/plugins/katex.ts";
import { merge } from "lume/core/utils/object.ts";
import metas from "lume/plugins/metas.ts";
import pagefind, { Options as PagefindOptions } from "lume/plugins/pagefind.ts";
import postcss from "lume/plugins/postcss.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
// import resolveUrls from "lume/plugins/resolve_urls.ts";
// import sitemap from "lume/plugins/sitemap.ts";
import terser from "lume/plugins/terser.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.7.0/toc.ts";

import { ja } from "https://esm.sh/date-fns@3.6.0/locale/ja";

import "lume/types.ts";

export interface Options {
  date?: Partial<DateOptions>;
  feed?: Partial<FeedOptions>;
  feedblog?: Partial<FeedOptions>;
  feeddiary?: Partial<FeedOptions>;
  pagefind?: Partial<PagefindOptions>;
  prism?: Partial<PrismOptions>;
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
