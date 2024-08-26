export const layout = "layouts/diary.vto";

export default function* ({ search, paginate, i18n }) {
  const posts = search.pages("type*=diary", "date=desc");

  for (
    const data of paginate(posts, { url, size: 10 })
  ) {
    // Show the first page in the menu
    if (data.pagination.page === 1) {
      data.menu = {
        visible: true,
        order: 3,
      };
    }

    yield {
      ...data,
      title: i18n.nav.diary_title,
    };
  }
}

function url(n) {
  if (n === 1) {
    return "/diary/";
  }

  return `/diary/${n}/`;
}
