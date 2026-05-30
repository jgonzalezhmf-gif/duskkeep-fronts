export function createPendingActionKey(scope: string, id?: string | number | null) {
  const normalizedScope = scope.trim();
  if (!normalizedScope) throw new Error("Pending scope required.");
  if (id === undefined || id === null || `${id}`.trim() === "") return normalizedScope;
  return `${normalizedScope}:${`${id}`.trim()}`;
}

export function isPendingAction(activeKeys: readonly string[], key: string) {
  return activeKeys.includes(key);
}

export function startPendingAction(activeKeys: readonly string[], key: string) {
  if (isPendingAction(activeKeys, key)) {
    return { started: false, activeKeys: [...activeKeys] };
  }
  return { started: true, activeKeys: [...activeKeys, key] };
}

export function finishPendingAction(activeKeys: readonly string[], key: string) {
  return activeKeys.filter((activeKey) => activeKey !== key);
}
