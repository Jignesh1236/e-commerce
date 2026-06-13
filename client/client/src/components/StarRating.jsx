export default function StarRating({ value = 0, max = 5, onChange, size = 20 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          style={{ fontSize: size, lineHeight: 1, background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 0 }}
        >
          <span style={{ color: i < value ? '#f5a623' : 'var(--border)' }}>★</span>
        </button>
      ))}
    </div>
  )
}
