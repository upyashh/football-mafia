"use client";

import { useStands } from "@/lib/use-stands";
import { StandListItem } from "@/components/stand-list-item";

export default function StandsPage() {
  const { yourStands, discoverStands, toggleJoin } = useStands();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-page/95 px-4 py-3.5 backdrop-blur-sm">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          Stands
        </h1>
      </header>

      {yourStands.length > 0 && (
        <section className="flex flex-col gap-2 px-4">
          <h2 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Your Stands
          </h2>
          <div className="flex flex-col gap-2">
            {yourStands.map((stand) => (
              <StandListItem
                key={stand.id}
                stand={stand}
                actionLabel="Leave"
                actionVariant="secondary"
                onAction={() => toggleJoin(stand.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2 px-4">
        <h2 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
          Discover public stands
        </h2>
        <div className="flex flex-col gap-2">
          {discoverStands.map((stand) => (
            <StandListItem
              key={stand.id}
              stand={stand}
              actionLabel="Join"
              actionVariant="default"
              onAction={() => toggleJoin(stand.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
