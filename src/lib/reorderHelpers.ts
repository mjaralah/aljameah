// Pure helpers for computing new id orders from various reorder actions
// (used by ReorderControls in admin lists that don't go through CrudPage).
export function moveToPosition(ids: string[], rowId: string, newPos1: number): string[] | null {
  const oldIdx = ids.indexOf(rowId);
  if (oldIdx === -1) return null;
  const target = Math.max(0, Math.min(ids.length - 1, newPos1 - 1));
  if (target === oldIdx) return null;
  const next = [...ids];
  const [moved] = next.splice(oldIdx, 1);
  next.splice(target, 0, moved);
  return next;
}

export function moveRelativeTo(
  ids: string[],
  rowId: string,
  targetId: string,
  where: "before" | "after",
): string[] | null {
  const oldIdx = ids.indexOf(rowId);
  let targetIdx = ids.indexOf(targetId);
  if (oldIdx === -1 || targetIdx === -1 || rowId === targetId) return null;
  const next = [...ids];
  next.splice(oldIdx, 1);
  targetIdx = next.indexOf(targetId);
  next.splice(where === "before" ? targetIdx : targetIdx + 1, 0, rowId);
  return next;
}
