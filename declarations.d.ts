/// <reference types="react" />
/// <reference types="react-dom" />

// Extend React's JSX namespace to include custom web components
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'webaudio-knob': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                sprites?: number;
                value?: number;
                min?: number;
                max?: number;
                step?: number;
                diameter?: number;
                width?: number;
                height?: number;
            }, HTMLElement>;
            'webaudio-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                value?: number;
                width?: number;
                height?: number;
            }, HTMLElement>;
            'webaudio-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                sprites?: number;
                direction?: 'vert' | 'horz';
                value?: number;
                min?: number;
                max?: number;
                width?: number;
                height?: number;
                knobwidth?: number;
                knobheight?: number;
            }, HTMLElement>;
        }
    }
}

// Module declarations for JSON imports
declare module '*.json' {
    const value: any;
    export default value;
}

export { };
