import { StudioState } from '../types';

/**
 * flattenStatePaths
 * Recursive function to generate dot-notation paths for binding.
 */
export const getBindingOptions = (state: any, prefix = ''): string[] => {
    let paths: string[] = [];

    for (const key in state) {
        if (typeof state[key] === 'object' && state[key] !== null && !Array.isArray(state[key])) {
            paths = paths.concat(getBindingOptions(state[key], prefix ? `${prefix}.${key}` : key));
        } else {
            paths.push(prefix ? `${prefix}.${key}` : key);
        }
    }
    return paths.sort();
};

/**
 * calculateValue
 * Maps a standardized 0-1 control value to the target's expected format.
 * Currently simplified to handle numbers and strings.
 */
export const calculateValue = (controlValue: number, min: number, max: number, step: number): number => {
    const range = max - min;
    let val = min + (controlValue * range);
    if (step > 0) {
        val = Math.round(val / step) * step;
    }
    return val;
};

/**
 * resolvePath
 * Gets the value at a specific path in the state object.
 */
export const resolvePath = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : undefined;
    }, obj);
};

/**
 * setPath
 * Updates value at deep path. Returns new object copy.
 */
export const updateAtPath = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const newObj = { ...obj };
    let current = newObj;

    for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return newObj;
};
