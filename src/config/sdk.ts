export type Sdk = {
  id: string;
  label: string;
  lang: string;
  install: string;
  installLang: string;
  createSnippet: string;
  status: "available" | "beta" | "planned";
};

/**
 * SDKs oficiales. Los snippets muestran el mismo caso (crear un pedido de entrega)
 * en cada lenguaje, de modo que el usuario compara "manzanas con manzanas".
 * Fachada en inglés sobre el dominio real (PedidoLogistica).
 */
export const sdks: Sdk[] = [
  {
    id: "node",
    label: "Node.js",
    lang: "javascript",
    installLang: "bash",
    install: "npm install @falconext/logistica",
    status: "available",
    createSnippet: `import { FalconextLogistica } from "@falconext/logistica";

const fx = new FalconextLogistica({ apiKey: process.env.FALCONEXT_API_KEY });

const order = await fx.orders.create({
  externalOrderId: "ORD-10482",
  customer: { name: "María Fernández", phone: "+51987654321" },
  deliveryAddress: { address: "Calle Los Pinos 120, Miraflores", city: "Lima" },
  items: [{ description: "Polo talla M", quantity: 2 }],
  cashOnDelivery: 120.0,
});

console.log(order.trackingCode);`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    lang: "typescript",
    installLang: "bash",
    install: "npm install @falconext/logistica",
    status: "available",
    createSnippet: `import { FalconextLogistica, type Order } from "@falconext/logistica";

const fx = new FalconextLogistica({ apiKey: process.env.FALCONEXT_API_KEY! });

const order: Order = await fx.orders.create({
  externalOrderId: "ORD-10482",
  customer: { name: "María Fernández", phone: "+51987654321" },
  deliveryAddress: { address: "Calle Los Pinos 120, Miraflores", city: "Lima" },
  items: [{ description: "Polo talla M", quantity: 2 }],
  cashOnDelivery: 120.0,
});`,
  },
  {
    id: "php",
    label: "PHP",
    lang: "php",
    installLang: "bash",
    install: "composer require falconext/sdk",
    status: "available",
    createSnippet: `<?php
use Falconext\\Falconext;

$fx = new Falconext(getenv('FALCONEXT_API_KEY'));

$order = $fx->orders->create([
  'external_order_id' => 'ORD-10482',
  'customer'          => ['name' => 'María Fernández', 'phone' => '+51987654321'],
  'delivery_address'  => ['address' => 'Calle Los Pinos 120, Miraflores', 'city' => 'Lima'],
  'items'             => [['description' => 'Polo talla M', 'quantity' => 2]],
  'cash_on_delivery'  => 120.00,
]);

echo $order->tracking_code;`,
  },
  {
    id: "laravel",
    label: "Laravel",
    lang: "php",
    installLang: "bash",
    install: "composer require falconext/laravel",
    status: "beta",
    createSnippet: `<?php
use Falconext\\Laravel\\Facades\\Falconext;

$order = Falconext::orders()->create([
  'external_order_id' => 'ORD-10482',
  'customer'          => ['name' => 'María Fernández', 'phone' => '+51987654321'],
  'delivery_address'  => ['address' => 'Calle Los Pinos 120, Miraflores', 'city' => 'Lima'],
  'items'             => [['description' => 'Polo talla M', 'quantity' => 2]],
  'cash_on_delivery'  => 120.00,
]);`,
  },
  {
    id: "python",
    label: "Python",
    lang: "python",
    installLang: "bash",
    install: "pip install falconext",
    status: "available",
    createSnippet: `from falconext import Falconext

fx = Falconext(api_key=os.environ["FALCONEXT_API_KEY"])

order = fx.orders.create(
    external_order_id="ORD-10482",
    customer={"name": "María Fernández", "phone": "+51987654321"},
    delivery_address={"address": "Calle Los Pinos 120, Miraflores", "city": "Lima"},
    items=[{"description": "Polo talla M", "quantity": 2}],
    cash_on_delivery=120.00,
)

print(order.tracking_code)`,
  },
  {
    id: "java",
    label: "Java",
    lang: "java",
    installLang: "bash",
    install: "implementation 'com.falconext:sdk:1.0.0'",
    status: "beta",
    createSnippet: `Falconext fx = new Falconext(System.getenv("FALCONEXT_API_KEY"));

Order order = fx.orders().create(
    OrderParams.builder()
        .externalOrderId("ORD-10482")
        .customer(new Customer("María Fernández", "+51987654321"))
        .deliveryAddress(new Address("Calle Los Pinos 120, Miraflores", "Lima"))
        .addItem(new OrderItem("Polo talla M", 2))
        .cashOnDelivery(120.00)
        .build());`,
  },
  {
    id: "dotnet",
    label: ".NET",
    lang: "csharp",
    installLang: "bash",
    install: "dotnet add package Falconext",
    status: "beta",
    createSnippet: `var fx = new FalconextClient(Environment.GetEnvironmentVariable("FALCONEXT_API_KEY"));

var order = await fx.Orders.CreateAsync(new OrderParams
{
    ExternalOrderId = "ORD-10482",
    Customer = new Customer { Name = "María Fernández", Phone = "+51987654321" },
    DeliveryAddress = new Address { Line = "Calle Los Pinos 120, Miraflores", City = "Lima" },
    Items = { new OrderItem { Description = "Polo talla M", Quantity = 2 } },
    CashOnDelivery = 120.00m,
});`,
  },
  {
    id: "go",
    label: "Go",
    lang: "go",
    installLang: "bash",
    install: "go get github.com/falconext/falconext-go",
    status: "planned",
    createSnippet: `fx := falconext.New(os.Getenv("FALCONEXT_API_KEY"))

order, err := fx.Orders.Create(ctx, &falconext.OrderParams{
    ExternalOrderID: "ORD-10482",
    Customer:        falconext.Customer{Name: "María Fernández", Phone: "+51987654321"},
    DeliveryAddress: falconext.Address{Address: "Calle Los Pinos 120, Miraflores", City: "Lima"},
    Items:           []falconext.OrderItem{{Description: "Polo talla M", Quantity: 2}},
    CashOnDelivery:  120.00,
})`,
  },
];
