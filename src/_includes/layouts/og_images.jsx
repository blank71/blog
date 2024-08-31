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
        backgroundColor: "#fff",
        fontSize: 32,
        fontWeight: 600,
      }}
    >
      <p
        style={{
          maxWidth: "900px",
          fontSize: "3.75rem",
        }}
      >
        {title}
      </p>
      <p
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "3rem",
          fontSize: "1.5rem",
        }}
      >
        {metas.site}
      </p>
      <div style={{ marginTop: 0 }}>{description}</div>
    </div>
  );
}
