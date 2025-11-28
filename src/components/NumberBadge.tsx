export function NumberBadge({ number }: { number: number }) {
  return (
    <div className="bg-background-primary text-secondary flex size-8 items-center justify-center rounded-full text-sm font-bold shadow-sm">
      {number}
    </div>
  );
}
