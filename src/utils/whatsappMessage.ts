interface CheckoutData {
  recipientName: string;
  deliveryType: 'delivery' | 'pickup';
  address?: string;
  notes?: string;
}

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export const generateWhatsAppMessage = (
  items: CartItem[],
  checkoutData: CheckoutData,
  whatsappNumber: string
): string => {
  const itemsList = items
    .map(
      (item) =>
        `- ${item.name} (${item.unit}): ${item.quantity} x $${item.price} = $${
          item.quantity * item.price
        }`
    )
    .join('\n');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const message = `Hola, quiero realizar el siguiente pedido:
${itemsList}

Total: $${total}

Nombre del destinatario: ${checkoutData.recipientName}
${
  checkoutData.deliveryType === 'delivery'
    ? `Dirección: Envío a domicilio, ${checkoutData.address}`
    : 'Retiro en local físico'
}
${checkoutData.notes ? `Notas: ${checkoutData.notes}` : ''}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
};
