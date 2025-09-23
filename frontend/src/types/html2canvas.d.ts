declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    backgroundColor?: string | null;
    scale?: number;
    useCORS?: boolean;
    [key: string]: any;
  }
  export default function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}