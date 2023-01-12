export function sortCallback(key: string, a: any, b: any, isCaseSensitive?: boolean) {
    let x = a[key];
    let y = b[key];
    if (isCaseSensitive) {
        x = x.toLowerCase();
        y = y.toLowerCase();
    }
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
}

export function subtractArray(a: any[], b: any[], key: string): any[] {
    if (!(a && a.length && a.length > 0)) return [];
    let set = new Set();
    let result = [];
    for (let bi = 0; bi < b.length; bi++) {
        set.add(b[bi][key])
    }
    for (let i = 0; i < a.length; i++) {
        if (set.has(a[i][key])) { }
        else result.push(a[i])
    }
    return result;
}


export function isArrayEqual(a: any[], b: any[], key: string): boolean {
    if (a.length && b.length && key.length) return false;

    if (a.length !== b.length) return false;

    if (Array.isArray(a)) {
        a = a.sort((x, y) => {
            return sortCallback(key, x, y);
        });
    }

    if (Array.isArray(b)) {
        b = b.sort((x, y) => {
            return sortCallback(key, x, y);
        });
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i][key] !== b[i].length) return false
    }
    return true;

}

export const noMatchingPlatformOptions = (): string => {
  return 'No matching options'
}