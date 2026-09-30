export default function StatCard({ label, value, tone = "" }) {
  return (
    <div className={"card " + tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}