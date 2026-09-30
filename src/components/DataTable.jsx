// columns: [{ key, label, render?(row), className? }]
// pager (optional): { page, pages, total, onPage }
export default function DataTable({ caption, columns, rows, rowKey = "id", rowClass, loading, empty = "Nothing to show.", pager }) {
  return (
    <>
      <div className={"scroll" + (loading ? " dim" : "")} aria-busy={loading}>
        <table>
          <caption className="sr">{caption}</caption>
          <thead>
            <tr>{columns.map((c) => <th scope="col" key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[rowKey]} className={rowClass ? rowClass(r) : ""}>
                {columns.map((c) => <td key={c.key} className={c.className}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={columns.length} className="none">{empty}</td></tr>}
          </tbody>
        </table>
      </div>
      {pager && (
        <div className="pager">
          <span>{pager.total} total</span>
          <button disabled={pager.page <= 1} onClick={() => pager.onPage(pager.page - 1)}>Prev</button>
          <span aria-live="polite">Page {pager.page} of {pager.pages}</span>
          <button disabled={pager.page >= pager.pages} onClick={() => pager.onPage(pager.page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}