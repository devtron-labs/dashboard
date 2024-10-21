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

// @description: Is 'subset' subset of 'json'
export const isSubset = (json: any, subset: any): boolean => {
    let valid = true

    // Case json is Array
    if (Array.isArray(json)) {
        // For empty array
        if (!json.length) {
            return subset.length <= json.length
        }

        const parentSet = new Set(Object.keys(json[0]))
        let keysOfAllElements: Array<string> = []
        for (let i = 0; i < subset.length; i++) {
            keysOfAllElements = keysOfAllElements.concat(Object.keys(subset[i]))
        }
        const childrenSet = new Set(keysOfAllElements)

        // Case both Arrays and subset Array is non empty
        if (Array.isArray(subset) && subset.length <= json.length && childrenSet.size <= parentSet.size) {
            json = json[0]
            for (let i = 0; i < subset.length; i++) {
                valid = valid && isSubset(json, subset[i])
                if (!valid) {
                    return valid
                }
            }
            return valid
        }

        return false
    }

    // Case Both Objects
    if (typeof json === 'object' && typeof subset === 'object' && !Array.isArray(subset) && !Array.isArray(json)) {
        const key = new Set(Object.keys(json))
        const keySubset = new Set(Object.keys(subset))

        keySubset.forEach((element) => {
            valid =
                valid &&
                key.has(element) &&
                typeof json[element] === typeof subset[element] &&
                isSubset(json[element], subset[element])
        })
        return !!valid
    }

    return typeof json === typeof subset && !Array.isArray(subset) && !Array.isArray(json)
}
