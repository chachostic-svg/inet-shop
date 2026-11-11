export function formatPrice(value, locale = "ru") {
  const formatted = new Intl.NumberFormat("ru-RU").format(Number(value) || 0);
  return locale === "uz" ? `${formatted} so'm` : `${formatted} сум`;
}
