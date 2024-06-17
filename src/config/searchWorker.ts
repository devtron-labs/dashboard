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

/* eslint-disable no-restricted-globals */
export default () => {
    /**
     * Compares two values for sorting.
     * @param  a - The first value to compare.
     * @param  b - The second value to compare.
     * @returns  The comparison result (-1 if a < b, 0 if a = b, 1 if a > b).
     */
    const comparator = (a: string | number | object, b: string | number | object) => {
        let result = 0
        if (a < b) {
            result = -1
        } else if (a > b) {
            result = 1
        }
        return result
    }

    /**
     * Dynamically sorts an array of objects based on a specified property and sorting order.
     * @param  property - The property by which to sort the objects.
     * @param  sortOrder - The sorting order ('ASC' for ascending, 'DESC' for descending).
     * @returns A sorting function.
     */
    const dynamicSort = (property: string, sortOrder: 'ASC' | 'DESC') => {
        const sortingOrder = sortOrder === 'ASC' ? 1 : -1

        /**
         * Sorting function for comparing two objects based on a specified property.
         * @param a - The first object to compare.
         * @param b - The second object to compare.
         * @returns The comparison result (-1 if a < b, 0 if a = b, 1 if a > b).
         */
        return (a: Record<string, string | number | object>, b: Record<string, string | number | object>) => {
            const valueA = a[property]
            const valueB = b[property]

            if (!Number.isNaN(Number(valueA)) && !Number.isNaN(Number(valueB))) {
                return comparator(Number(valueA), Number(valueB)) * sortingOrder
            }

            return comparator(valueA, valueB) * sortingOrder
        }
    }

    const debounceSearch = <T extends unknown[]>(callback: (...args: T) => void) => {
        let timeout: NodeJS.Timeout
        return (...args: T) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                callback.apply(self, args)
            }, 300)
        }
    }

    const getFilteredList = ({
        searchText,
        list,
        sortBy,
        sortOrder,
    }: {
        searchText: string
        list: unknown[]
        sortBy: string
        sortOrder: 'ASC' | 'DESC'
    }) => {
        const searchTextLowerCased = searchText.toLowerCase()
        let filteredList = [...list]

        if (searchTextLowerCased !== '' && list?.length) {
            filteredList = list.filter((item) =>
                Object.entries(item).some(
                    ([key, value]) => key !== 'id' && String(value).toLowerCase().includes(searchTextLowerCased),
                ),
            )
        }

        if (sortBy && sortOrder) {
            filteredList.sort(dynamicSort(sortBy, sortOrder))
        }

        self.postMessage(filteredList)
    }

    self.addEventListener('message', (e) => {
        /**
         * Verifying the origin of the received message to be similar to
         * from what our page is served on
         */
        if (e.data.payload?.origin !== self.location.origin) {
            return
        }

        switch (e.data.type) {
            case 'start':
                if (e.data.payload.debounceResult) {
                    debounceSearch(getFilteredList)(e.data.payload)
                } else {
                    getFilteredList(e.data.payload)
                }
                break
            case 'stop':
                self.postMessage([])
                self.close()
                break
            default:
                break
        }
    })
}
