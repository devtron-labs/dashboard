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
    enum SortingOrder {
        ASC = 'ASC',
        DESC = 'DESC',
    }

    // NOTE!: this is a copy from ResourceBrowser/Types
    // imports don't get bundled with the service worker
    enum NODE_SEARCH_KEYS {
        NAME = 'name',
        LABEL = 'label',
        NODE_GROUP = 'nodeGroup',
    }

    // NOTE!: this is a copy from ResourceBrowser/Constants
    // imports don't get bundled with the service worker
    const NODE_SEARCH_KEYS_TO_OBJECT_KEYS = {
        [NODE_SEARCH_KEYS.LABEL]: 'labels',
        [NODE_SEARCH_KEYS.NAME]: 'name',
        [NODE_SEARCH_KEYS.NODE_GROUP]: 'nodeGroup',
    }

    const NODE_LIST_HEADERS_TO_KEY_MAP = {
        name: 'name',
        status: 'status',
        roles: 'roles',
        errors: 'errorCount',
        'k8s version': 'k8sVersion',
        'node group': 'nodeGroup',
        pods: 'podCount',
        taints: 'taintCount',
        'cpu usage (%)': 'cpu.usagePercentage',
        'cpu usage (absolute)': 'cpu.usage',
        'cpu allocatable': 'cpu.allocatable',
        'mem usage (%)': 'memory.usagePercentage',
        'mem usage (absolute)': 'memory.usageInBytes',
        'mem allocatable': 'memory.allocatable',
        age: 'age',
        unschedulable: 'unschedulable',
    }

    const NODE_K8S_VERSION_KEY = 'k8sVersion'

    const stringComparatorBySortOrder = (a: string, b: string, sortOrder: SortingOrder = SortingOrder.ASC) =>
        sortOrder === SortingOrder.ASC ? a.localeCompare(b) : b.localeCompare(a)

    const numberComparatorBySortOrder = (a: number, b: number, sortOrder: SortingOrder = SortingOrder.ASC) =>
        sortOrder === SortingOrder.ASC ? a - b : b - a

    const numberInStringComparator = <T extends string>(a: T, b: T, sortOrder: SortingOrder) =>
        numberComparatorBySortOrder(
            a ? parseInt(a.match(/^\d+/)[0], 10) : 0,
            b ? parseInt(b.match(/^\d+/)[0], 10) : 0,
            sortOrder,
        )

    const k8sStyledAgeToSeconds = (duration: string) => {
        let totalTimeInSec: number = 0
        if (!duration || duration === '<none>') {
            return totalTimeInSec
        }
        // Parses time(format:- ex. 4h20m) in second
        const matchesNumber = duration.match(/[-+]?\d*\.?\d+/g)
        const matchesChar = duration.match(/[dhms]/g)
        for (let i = 0; i < matchesNumber.length; i++) {
            const _unit = matchesChar[i]
            const _unitVal = +matchesNumber[i]
            switch (_unit) {
                case 'd':
                    totalTimeInSec += _unitVal * 24 * 60 * 60
                    break
                case 'h':
                    totalTimeInSec += _unitVal * 60 * 60
                    break
                case 'm':
                    totalTimeInSec += _unitVal * 60
                    break
                default:
                    totalTimeInSec += _unitVal
                    break
            }
        }
        return totalTimeInSec
    }

    const durationComparator = <T extends string>(a: T, b: T, sortOrder: SortingOrder) =>
        sortOrder === SortingOrder.DESC
            ? k8sStyledAgeToSeconds(b) - k8sStyledAgeToSeconds(a)
            : k8sStyledAgeToSeconds(a) - k8sStyledAgeToSeconds(b)

    const versionComparatorBySortOrder = (a: string, b: string, orderBy = SortingOrder.ASC) => {
        if (orderBy === SortingOrder.DESC) {
            return a?.localeCompare(b, undefined, { numeric: true }) ?? 1
        }

        return b?.localeCompare(a, undefined, { numeric: true }) ?? 1
    }

    const propertyComparatorMap = {
        age: durationComparator,
        duration: durationComparator,
        'last schedule': durationComparator,
        capacity: numberInStringComparator,
        cpu: numberInStringComparator,
        memory: numberInStringComparator,
        window: durationComparator,
        errors: numberInStringComparator,
        'k8s version': versionComparatorBySortOrder,
        taints: numberInStringComparator,
        'cpu usage (%)': numberInStringComparator,
        'cpu allocatable': numberInStringComparator,
        'mem usage (%)': numberInStringComparator,
        'mem allocatable': numberInStringComparator,
    }

    /**
     * Dynamically sorts an array of objects based on a specified property and sorting order.
     * @param  property - The property by which to sort the objects.
     * @param  sortOrder - The sorting order ('ASC' for ascending, 'DESC' for descending).
     * @returns A sorting function.
     */
    const dynamicSort =
        (property: string, sortOrder: SortingOrder, isNodeListing: boolean) =>
        (a: Record<string, string | number>, b: Record<string, string | number>) => {
            const valueA = isNodeListing ? a[NODE_LIST_HEADERS_TO_KEY_MAP[property]] : a[property]
            const valueB = isNodeListing ? b[NODE_LIST_HEADERS_TO_KEY_MAP[property]] : b[property]

            // Special cases handling where the property is not in sortable format.
            if (Object.keys(propertyComparatorMap).includes(property)) {
                return propertyComparatorMap[property](valueA, valueB, sortOrder)
            }

            // Handling of numbers and if one property is number and the other is string.
            if (typeof valueA === 'number' || typeof valueB === 'number') {
                return numberComparatorBySortOrder(
                    typeof valueA === 'number' ? valueA : 0,
                    typeof valueB === 'number' ? valueB : 0,
                    sortOrder,
                )
            }

            // Handling of strings and numbers in string type.
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                if (!Number.isNaN(Number(valueA)) && !Number.isNaN(Number(valueB))) {
                    return numberComparatorBySortOrder(Number(valueA), Number(valueB), sortOrder)
                }
                return stringComparatorBySortOrder(valueA, valueB, sortOrder)
            }

            return 0
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
        nodeListingFilters: { isNodeListing, searchParams },
    }: {
        searchText: string
        list: unknown[]
        sortBy: string
        sortOrder: SortingOrder
        nodeListingFilters: {
            isNodeListing: boolean
            searchParams: Record<string, string>
        }
    }) => {
        const searchTextLowerCased = searchText.trim().toLowerCase()
        let filteredList = [...list]

        if (isNodeListing) {
            filteredList = list.filter((item: Record<string, any>) => {
                const isK8sVersionFilterAppliedAndMatchFound =
                    !searchParams[NODE_K8S_VERSION_KEY] ||
                    item[NODE_K8S_VERSION_KEY] === searchParams[NODE_K8S_VERSION_KEY]

                const doesAnyNodeSearchKeyExists = Object.values(NODE_SEARCH_KEYS).some((key) =>
                    Object.hasOwn(searchParams, key),
                )

                const doesItemHaveAnyMatchingSearchKey = Object.values(NODE_SEARCH_KEYS).reduce(
                    (isFound, searchKey) => {
                        if (!searchParams[searchKey]) {
                            return isFound
                        }

                        const searchTextFromSearchKey = searchParams[searchKey]

                        return !!searchTextFromSearchKey?.split(',').some((text) => {
                            const trimmedText = text.trim()
                            const objectKey = NODE_SEARCH_KEYS_TO_OBJECT_KEYS[searchKey]

                            // NOTE: if corresponding value in data is anything other than primitives like string, or number
                            // handle it appropriately likewise
                            if (searchKey === NODE_SEARCH_KEYS.LABEL) {
                                const [searchKeyFromLabelText, searchValueFromLabelText] = trimmedText.split('=')

                                return (
                                    !!item[objectKey]?.some(
                                        ({ key, value }) =>
                                            key === searchKeyFromLabelText && value === searchValueFromLabelText,
                                    ) && isFound
                                )
                            }

                            return String(item[objectKey] ?? '').includes(trimmedText) && isFound
                        })
                    },
                    true,
                )

                return (
                    isK8sVersionFilterAppliedAndMatchFound &&
                    (!doesAnyNodeSearchKeyExists || doesItemHaveAnyMatchingSearchKey)
                )
            })
        } else if (searchTextLowerCased !== '' && list?.length) {
            filteredList = list.filter((item) =>
                Object.entries(item).some(
                    ([key, value]) => key !== 'id' && String(value).toLowerCase().includes(searchTextLowerCased),
                ),
            )
        }

        if (sortBy && sortOrder) {
            filteredList.sort(dynamicSort(sortBy, sortOrder, isNodeListing))
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
