export type FloatingEditorPosition = {
  top: number;
  left: number;
  placement: "above" | "below";
};

type Bounds = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

function viewportBounds(): Bounds {
  return {
    top: 8,
    left: 8,
    right: window.innerWidth - 8,
    bottom: window.innerHeight - 8,
  };
}

function clampBounds(stage: HTMLElement | null): Bounds {
  const viewport = viewportBounds();
  if (!stage) return viewport;

  const rect = stage.getBoundingClientRect();
  const bounds = {
    top: Math.max(viewport.top, rect.top + 8),
    left: Math.max(viewport.left, rect.left + 8),
    right: Math.min(viewport.right, rect.right - 8),
    bottom: Math.min(viewport.bottom, rect.bottom - 8),
  };

  if (bounds.right - bounds.left < 80 || bounds.bottom - bounds.top < 80) {
    return viewport;
  }

  return bounds;
}

export function placeFloatingEditor(
  anchor: HTMLElement,
  editor: HTMLElement,
  stage: HTMLElement | null
): FloatingEditorPosition {
  const anchorRect = anchor.getBoundingClientRect();
  const editorRect = editor.getBoundingClientRect();
  const bounds = clampBounds(stage);
  const editorHeight = editorRect.height || editor.offsetHeight || 200;
  const editorWidth = editorRect.width || editor.offsetWidth || 280;
  const margin = 8;

  const spaceAbove = anchorRect.top - bounds.top;
  const spaceBelow = bounds.bottom - anchorRect.bottom;
  const shouldPlaceAbove =
    spaceAbove >= editorHeight + margin &&
    (spaceAbove >= spaceBelow || spaceBelow < editorHeight + margin);

  let top = shouldPlaceAbove
    ? anchorRect.top - editorHeight - margin
    : anchorRect.bottom + margin;

  const minTop = bounds.top;
  const maxTop = Math.max(minTop, bounds.bottom - editorHeight);
  top = Math.min(Math.max(top, minTop), maxTop);

  let left = anchorRect.left + anchorRect.width / 2 - editorWidth / 2;
  const minLeft = bounds.left;
  const maxLeft = Math.max(minLeft, bounds.right - editorWidth);
  left = Math.min(Math.max(left, minLeft), maxLeft);

  return {
    top,
    left,
    placement: shouldPlaceAbove ? "above" : "below",
  };
}
