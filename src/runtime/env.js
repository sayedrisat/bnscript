export function __bn_env(name, defaultValue = undefined) {
  const value = process.env[name];
  return value !== undefined ? value : defaultValue;
}
