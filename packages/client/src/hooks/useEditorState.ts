import { useReducer } from "react";
import type { Layer } from "../../../core/src";

export type EditableLayer = Layer & { id: string };

interface EditorState {
  layers: EditableLayer[];
  selectedId: string | null;
  past: EditableLayer[][];
  future: EditableLayer[][];
}

export type EditorAction =
  | { type: "SET_LAYERS"; layers: EditableLayer[] }
  | { type: "ADD_LAYER"; layer: EditableLayer }
  | { type: "UPDATE_LAYER"; id: string; patch: Record<string, unknown> }
  | { type: "REMOVE_LAYER"; id: string }
  | { type: "SELECT"; id: string | null }
  | { type: "REORDER"; fromIndex: number; toIndex: number }
  | { type: "PUSH_HISTORY" }
  | { type: "UNDO" }
  | { type: "REDO" };

function withHistory(
  state: EditorState,
  next: Partial<EditorState>,
): EditorState {
  return {
    ...state,
    ...next,
    past: [...state.past, state.layers],
    future: [],
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_LAYERS":
      return withHistory(state, {
        layers: action.layers,
        selectedId:
          state.selectedId &&
          action.layers.find(l => l.id === state.selectedId)
            ? state.selectedId
            : null,
      });

    case "ADD_LAYER":
      const maxZ =
        state.layers.length > 0
          ? Math.max(...state.layers.map(l => l.zIndex || 0))
          : 0;
      const newLayer = { ...action.layer, zIndex: maxZ + 1 };
      return withHistory(state, {
        layers: [...state.layers, newLayer],
        selectedId: newLayer.id,
      });

    case "UPDATE_LAYER":
      return {
        ...state,
        layers: state.layers.map(l =>
          l.id === action.id ? ({ ...l, ...action.patch } as EditableLayer) : l,
        ),
      };

    case "REMOVE_LAYER":
      return withHistory(state, {
        layers: state.layers.filter(l => l.id !== action.id),
        selectedId:
          state.selectedId === action.id ? null : state.selectedId,
      });

    case "SELECT":
      return { ...state, selectedId: action.id };

    case "REORDER": {
      const next = [...state.layers];
      const [moved] = next.splice(action.fromIndex, 1);
      next.splice(action.toIndex, 0, moved);
      const reindexed = next.map((l, i) => ({ ...l, zIndex: i }));
      return withHistory(state, { layers: reindexed });
    }

    case "PUSH_HISTORY":
      return {
        ...state,
        past: [...state.past, state.layers],
        future: [],
      };

    case "UNDO": {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        past: state.past.slice(0, -1),
        layers: prev,
        future: [state.layers, ...state.future],
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state,
        future: state.future.slice(1),
        layers: next,
        past: [...state.past, state.layers],
      };
    }

    default:
      return state;
  }
}

export function useEditorState(initialLayers: EditableLayer[] = []) {
  const [state, dispatch] = useReducer(editorReducer, {
    layers: initialLayers,
    selectedId: null,
    past: [],
    future: [],
  });

  return {
    layers: state.layers,
    selectedId: state.selectedId,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    dispatch,
  };
}
