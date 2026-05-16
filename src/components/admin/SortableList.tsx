// Generic drag-and-drop wrapper for admin pages that are not built on CrudPage.
// Usage:
//   <SortableList ids={items.map(i => i.id)} onReorder={(newIds) => persist(newIds)}>
//     {items.map(it => (
//       <SortableItem key={it.id} id={it.id}>
//         {({ handleProps, isDragging }) => (
//           <Card>
//             <button {...handleProps}><GripVertical/></button>
//             ...
//           </Card>
//         )}
//       </SortableItem>
//     ))}
//   </SortableList>
import { ReactNode } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableList({
  ids, onReorder, children,
}: {
  ids: string[];
  onReorder: (newIds: string[]) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = ids.indexOf(String(active.id));
    const newI = ids.indexOf(String(over.id));
    if (oldI === -1 || newI === -1) return;
    onReorder(arrayMove(ids, oldI, newI));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function SortableItem({
  id, disabled, children,
}: {
  id: string;
  disabled?: boolean;
  children: (args: {
    handleProps: Record<string, unknown>;
    isDragging: boolean;
    setNodeRef: (el: HTMLElement | null) => void;
    style: React.CSSProperties;
  }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return <>{children({
    handleProps: { ...attributes, ...listeners },
    isDragging,
    setNodeRef,
    style,
  })}</>;
}

/** Persist a reordered list of ids to a Supabase table's sort_order column (10-step gaps). */
export async function persistSortOrder(
  supabase: any,
  table: string,
  ids: string[],
) {
  const updates = ids.map((id, i) => ({ id, sort_order: (i + 1) * 10 }));
  await Promise.all(updates.map((u) =>
    supabase.from(table).update({ sort_order: u.sort_order }).eq("id", u.id),
  ));
}
