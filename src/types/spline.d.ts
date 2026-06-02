declare module '@splinetool/react-spline' {
  import { ComponentType } from 'react';
  export interface SplineProps {
    scene: string;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: (spline: any) => void;
    onMouseDown?: (e: any) => void;
  }
  const Spline: ComponentType<SplineProps>;
  export default Spline;
}
