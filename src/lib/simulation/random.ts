export function hashString(value: string) {
  let hash = 1779033703 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

export function seededRandom(seed: string) {
  const generator = hashString(seed);
  return () => generator() / 4294967295;
}

export function rangeRandom(seed: string, min: number, max: number) {
  const random = seededRandom(seed)();
  return min + (max - min) * random;
}
