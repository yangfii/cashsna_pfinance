
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string;
        trigger?: string;
        delay?: string;
        stroke?: string;
        state?: string;
        style?: React.CSSProperties;
        className?: string;
      };
    }
  }
}

export {};
