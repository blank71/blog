/** @jsxImportSource npm:react@18.2.0 */

export default function ({ title, description, metas }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e0ffff",
        fontSize: 32,
        fontWeight: 600,
      }}
    >
      <p
        style={{
          maxWidth: "900px",
          fontSize: "4rem",
        }}
      >
        {title}
      </p>
      <p
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "3rem",
          fontSize: "3rem",
        }}
      >
        {metas.site}
      </p>
      <div style={{ marginTop: 0 }}>{description}</div>
    </div>
  );
}
