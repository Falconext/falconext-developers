import { Button } from "@/components/ui/button";
import { DeliveryRail } from "@/components/brand/delivery-rail";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="font-display text-[2.6rem] font-bold tracking-tight text-fg">
        Esta ruta no existe
      </h1>
      <p className="mt-4 text-muted">
        La página que buscas se movió o nunca llegó a destino. Volvamos a la ruta correcta.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/logistica/2025-07-01/getting-started">Ir a la documentación</Button>
        <Button href="/" variant="secondary">Volver al inicio</Button>
      </div>
      <div className="mt-16 w-full max-w-md">
        <DeliveryRail showEventChip={false} />
      </div>
    </div>
  );
}
