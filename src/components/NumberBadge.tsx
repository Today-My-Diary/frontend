export function NumberBadge({ number }: { number: number }) {
  return (
    <div className="bg-primary-semilight text-primary flex size-8 items-center justify-center rounded-full text-sm font-bold">
      {number}
    </div>
  );
}
