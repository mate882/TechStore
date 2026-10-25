/* TechGrid — WhatsApp ordering */

const STORE_WHATSAPP_NUMBER = "995500000000"; 
const formatPrice = (value) =>
  `${Number(value).toFixed(2)} ₾`;

function buildWhatsAppMessage(items) {
  const lines = [];
  let total = 0;

  lines.push("Hello, I would like to place an order:");
  lines.push("");

  items.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    lines.push(`${i + 1}. ${item.name}`);
    lines.push(`   SKU: ${item.sku}`);
    lines.push(`   Qty: ${item.qty} × ${formatPrice(item.price)} = ${formatPrice(lineTotal)}`);
    if (item.url) {
      lines.push(`   ${item.url}`);
    }
    lines.push("");
  });

  lines.push(`Estimated total: ${formatPrice(total)}`);
  lines.push("");
  lines.push("(Please confirm availability and final price.)");

  return lines.join("\n");
}

function orderViaWhatsApp(items) {
  if (!items || items.length === 0) return;

  const message = buildWhatsAppMessage(items);
  const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

/* ---- Wire up the cart page button ---- */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("[data-order-whatsapp]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    orderViaWhatsApp(cart);
  });
});