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
import { sortObjectArrayAlphabetically, versionComparator } from '../common'
import { ChartDetailType } from './types'

export const processChartData = (data: ChartDetailType[]): ChartDetailType[] => {
    let resultData = []
    const uniqueChartList = new Map<string, ChartDetailType>()
    data.forEach((element) => {
        const chartDetail = uniqueChartList.get(element.name)
        if (chartDetail) {
            chartDetail.count++
            chartDetail.versions.push({ id: element.id, version: element.version })
            if (chartDetail.version < element.version) {
                chartDetail.version = element.version
                chartDetail.chartDescription = element.chartDescription
            }
        } else {
            uniqueChartList.set(element.name, {
                ...element,
                count: 0,
                versions: [{ id: element.id, version: element.version }],
            })
        }
    })
    uniqueChartList.forEach((element) => {
        element.versions?.sort((a, b) => versionComparator(a, b, 'version', SortingOrder.DESC))
        resultData.push(element)
    })
    resultData = sortObjectArrayAlphabetically(resultData, 'name')
    return resultData
}
