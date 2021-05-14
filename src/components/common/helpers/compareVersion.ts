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
    for (let i = 0; i < target.length; i++) {
        if(target[i] > version[i]) {
            return true;
        }
        else if (target[i] < version[i]) {
            return false;
        }
    }
    return true;
}