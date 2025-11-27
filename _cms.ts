import lumeCMS from "lume/cms/mod.ts";

const cms = lumeCMS({
  site: {
    url: "https://blog.blank71.com",
  },
});

cms.auth({
  admin: {
    password: "demo",
    name: "admin",
    email: "admin@example.com",
  },
  user1: {
    password: "demo",
    name: "user",
    email: "user@example.com",
  },
});
cms.git();

// URL フィールドのカスタム定義
const url = {
  name: "url",
  type: "text",
  description: "ページの公開 URL。空欄の場合はファイルパスが使用されます。",
  transform(value: string) {
    if (!value) {
      return;
    }
    if (!value.endsWith("/")) {
      value += "/";
    }
    if (!value.startsWith("/")) {
      value = "/" + value;
    }
    return value;
  },
};

// cms.document();

// ブログ投稿のコレクション
cms.collection(
  "posts: ブログ投稿",
  "src:post/**/*.md",
  [
    {
      name: "layout",
      type: "hidden",
      value: "layouts/post.vto",
    },
    {
      name: "type",
      type: "select",
      label: "タイプ",
      options: ["blog", "diary"],
      value: "blog",
    },
    {
      name: "title",
      type: "text",
      label: "タイトル",
    },
    url,
    {
      name: "description",
      type: "text",
      label: "説明",
    },
    {
      name: "date",
      type: "date",
      label: "公開日",
    },
    {
      name: "draft",
      type: "checkbox",
      label: "下書き",
      description: "チェックすると非公開になります。",
    },
    {
      name: "tags",
      type: "list",
      label: "タグ",
      // deno-lint-ignore no-explicit-any
      init(field: any, { data }: any) {
        field.options = data.site?.search.values("tags");
      },
    },
    {
      name: "content",
      type: "markdown",
      label: "本文",
      upload: "postMedia",
    },
  ],
);

// 投稿の画像アップロード先（手動でサブフォルダを指定）
cms.upload({
  name: "postMedia",
  description: "投稿用画像。アップロード時にサブフォルダを指定してください。",
  store: "src:post",
  publicPath: "/post",
  listed: false,
});

export default cms;
