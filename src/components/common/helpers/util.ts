import { sortCallback } from "@devtron-labs/devtron-fe-common-lib";

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
