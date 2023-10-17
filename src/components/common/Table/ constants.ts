import { TableSize } from "./types";

export const TABLE_SIZE_MAP: Record<TableSize, number | string> = {
  xs: 50,
  sm: 100,
  md: 200,
  lg: 300,
  xl: 400,
  auto: 'auto'
} as const;
