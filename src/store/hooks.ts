import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import type { AppDispatch, RootState } from "./store";

/** Typed alternatives to the bare `useDispatch` / `useSelector` from react-redux. */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
