import { KazakhstanMap, type MapPoint } from "@/components/map/KazakhstanMap";

/** Country overview plus a zoomed south-east inset, sharing one projection. */
export function MapOverview({ points }: { points: MapPoint[] }) {
  return (
    <div className="grid gap-10">
      <figure>
        <KazakhstanMap points={points} title="Schematic map of Kazakhstan showing where the destinations are" />
      </figure>
      <figure className="mx-auto w-full max-w-xl">
        <div className="border border-dashed border-fg/55 bg-page/60">
          <KazakhstanMap points={points} view="south-east" title="Detail of south-east Kazakhstan with five destinations" />
        </div>
        <figcaption className="mt-2 text-xs text-fg-muted">South-east detail, around Almaty and the northern Tian Shan.</figcaption>
      </figure>
    </div>
  );
}
