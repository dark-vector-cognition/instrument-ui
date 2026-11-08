export async function resolve(specifier, context, next) {
  if (specifier.endsWith(".css")) return { url: "data:text/javascript,", shortCircuit: true };
  return next(specifier, context);
}
