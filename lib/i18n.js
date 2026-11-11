import ru from "@/messages/ru";
import uz from "@/messages/uz";

export const dictionaries = { ru, uz };

export function getDict(locale) {
  return dictionaries[locale] === uz ? uz : ru;
}

export function interpolate(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}

export function translate(dict, path, vars) {
  const value = path.split(".").reduce((acc, key) => acc?.[key], dict);
  if (typeof value !== "string") return path;
  return vars ? interpolate(value, vars) : value;
}
