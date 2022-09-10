import { SortingOrder } from "../../app/types";

export function getVersionArr(version: string): number[] {
    if (!version) return [0, 0, 0];

    let versionMod = version;
    if (versionMod.includes("v")) {
        versionMod = version.split("v")[1];
    }
    let versionStr: string[] = versionMod.split(".");
    return [Number(versionStr[0]), Number(versionStr[1])];
}

export function isVersionLessThanOrEqualToTarget(version: string, target: number[]): boolean {
    //Comparing with v1.15.xxx
    let versionNum = getVersionArr(version);
    for (let i = 0; i < target.length; i++) {
        if (versionNum[i] === target[i]) {
            if (i === target.length - 1) return true;
            continue
        }
        else if (versionNum[i] < target[i]) {
            return true;
        }
    }
    return false;
}

export function isChartRef3090OrBelow(id: number): boolean {
    return id <= 10
}

export function versionComparator(
    a: Record<string, any>,
    b: Record<string, any>,
    compareKey: string,
    orderBy: SortingOrder,
) {
    if (orderBy === SortingOrder.DESC) {
        return b[compareKey].localeCompare(a[compareKey], undefined, { numeric: true })
    }

    return a[compareKey].localeCompare(b[compareKey], undefined, { numeric: true })
}
