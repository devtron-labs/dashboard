/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

export function getVersionArr(version: string): number[] {
    if (!version) {
        return [0, 0, 0]
    }

    let versionMod = version
    if (versionMod.includes('v')) {
        versionMod = version.split('v')[1]
    }
    const versionStr: string[] = versionMod.split('.')
    return [Number(versionStr[0]), Number(versionStr[1])]
}

export function isVersionLessThanOrEqualToTarget(version: string, target: number[]): boolean {
    // Comparing with v1.15.xxx
    const versionNum = getVersionArr(version)
    for (let i = 0; i < target.length; i++) {
        if (versionNum[i] === target[i]) {
            if (i === target.length - 1) {
                return true
            }
            continue
        } else if (versionNum[i] < target[i]) {
            return true
        }
    }
    return false
}

export function isChartRef3090OrBelow(id: number): boolean {
    return id <= 10
}
