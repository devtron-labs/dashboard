export function getMajorAndMinorVersionArr(version: string): number[] {
    if (!version) return [0, 0, 0];

    let versionMod = version;
    if (versionMod.includes("v")) {
        versionMod = version.split("v")[1];
    }
    let versionStr: string[] = versionMod.split(".");
    return [Number(versionStr[0]), Number(versionStr[1])];
}

export function isVersionLessThanOrEqualToTarget(version: number[], target: number[]): boolean {
    //Comparing with v1.15.xxx
    for (let i = 0; i < target.length; i++) {
        if (version[i] === target[i]) {
            if (i === target.length - 1) return true;
            continue
        }
        else if (version[i] < target[i]) {
            return true;
        }
    }
    return false;
}

export function getVersionArr(version: string): number[] {
    if (!version) return [0, 0, 0];

    let versionMod = version;
    if (versionMod.includes("v")) {
        versionMod = version.split("v")[1];
    }
    let versionStr: string[] = versionMod.split(".");
    return [Number(versionStr[0]), Number(versionStr[1]), Number(versionStr[2])];
}