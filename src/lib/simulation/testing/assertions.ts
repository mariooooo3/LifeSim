export interface AssertionResult {
  ok: boolean;
  label: string;
  detail?: string;
}

export function assertRange(label: string, value: number, min: number, max: number): AssertionResult {
  const ok = value >= min && value <= max;
  return {
    ok,
    label,
    detail: ok ? undefined : `${label} expected in [${min},${max}], got ${value}`,
  };
}

export function assertLessThan(label: string, value: number, max: number): AssertionResult {
  const ok = value < max;
  return {
    ok,
    label,
    detail: ok ? undefined : `${label} expected < ${max}, got ${value}`,
  };
}

export function assertGreaterThan(label: string, value: number, min: number): AssertionResult {
  const ok = value > min;
  return {
    ok,
    label,
    detail: ok ? undefined : `${label} expected > ${min}, got ${value}`,
  };
}
