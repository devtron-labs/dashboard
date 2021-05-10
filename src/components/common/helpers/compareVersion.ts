
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
