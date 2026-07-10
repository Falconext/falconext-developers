import { EventCard } from "./event-card";
import { DeliveryRail } from "@/components/brand/delivery-rail";
import { Badge } from "@/components/ui/badge";
import { deliveryEvents } from "@/config/webhooks";

/** Catálogo de eventos de webhook embebible en MDX. Deriva de config/webhooks.ts. */
export function WebhookCatalog({ showRail = true }: { showRail?: boolean }) {
  return (
    <div className="my-8">
      {showRail && (
        <div className="mb-8 rounded-2xl border border-app bg-subtle/50 p-6 sm:p-8">
          <DeliveryRail />
        </div>
      )}
      <p className="mb-2 flex flex-wrap items-center gap-2 text-muted">
        <span>Eventos del ciclo de vida de un pedido.</span>
        <Badge tone="violet" mono>{deliveryEvents.length} eventos</Badge>
      </p>
      <div>
        {deliveryEvents.map((event) => (
          <EventCard key={event.name} event={event} />
        ))}
      </div>
    </div>
  );
}
