"use client";
export default function RatingStars({
  value, onChange, readOnly,
}: { value: number; onChange?: (n: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`text-xl ${n <= value ? "text-amber-500" : "text-slate-300"} ${readOnly ? "" : "hover:scale-110 transition"}`}
          aria-label={`${n} star`}
        >★</button>
      ))}
    </div>
  );
}
