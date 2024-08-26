export const layout = "layouts/blog.vto";

export default function* ({ search, paginate, i18n }) {
  const posts = search.pages("type*=blog", "date=desc");

  for (
    const data of paginate(posts, { url, size: 10 })
  ) {
    // Show the first page in the menu
    if (data.pagination.page === 1) {
      data.menu = {
        visible: true,
        order: 2,
      };
    }

    yield {
      ...data,
      title: i18n.nav.blog_title,
    };
  }
}

function url(n) {
  if (n === 1) {
    return "/blog/";
  }

  return `/blog/${n}/`;
}
