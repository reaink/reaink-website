declare module 'culori' {
  export interface CuloriColor {
    mode?: string;
    alpha?: number;
    [key: string]: number | string | undefined;
  }

  export function parse(color: string): CuloriColor | undefined;
  export function converter(mode: string): (color: CuloriColor) => CuloriColor | undefined;
  export function formatRgb(color: CuloriColor): string;
}