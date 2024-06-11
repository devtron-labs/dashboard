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

const MANIFEST_METADATA_REQUIRED_FIELDS: string[] = ['name', 'namespace', 'labels', 'annotations']

// Remove Auto-generated fields from kubernetes manifest
// input - jsonString
// output - jsonString
export function cleanKubeManifest(manifestJsonString: string): string {
    if (!manifestJsonString) {
        return manifestJsonString
    }

    try {
        const obj = JSON.parse(manifestJsonString)

        // 1 - delete status
        delete obj['status']

        // 2 - delete all fields from metadata except some predefined
        const metadata = obj['metadata']
        if (metadata) {
            for (const key in metadata) {
                if (!MANIFEST_METADATA_REQUIRED_FIELDS.includes(key)) {
                    delete metadata[key]
                }
            }
        }

        return JSON.stringify(obj)
    } catch (e) {
        return manifestJsonString
    }
}

export const replaceLastOddBackslash = (str: string): string => {
    let countBackSlash = 0
    const strArr = str.split('')
    for (let index = strArr.length - 1; index >= 0; index--) {
        const char = strArr[index]
        if (char === '\\') {
            countBackSlash++
        } else {
            break
        }
    }
    if (countBackSlash % 2 !== 0) {
        str += '\\'
    }
    return str
}

export const safeTrim = (str: string): string => {
    return str ? str.trim() : str
}
