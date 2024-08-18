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
import { sortObjectArrayAlphabetically, versionComparator } from '@Components/common'
import { DeploymentChartDTO, DeploymentChartType } from './types'

export const processChartData = (data: DeploymentChartDTO[]): DeploymentChartType[] => {
    const chartMap: Record<string, DeploymentChartType> = {}
    data.forEach((element) => {
        const detail = chartMap[element.name]
        if (detail) {
            detail.versions.push({ id: element.id, version: element.version, description: element.chartDescription })
        } else {
            chartMap[element.name] = {
                name: element.name,
                isUserUploaded: element.isUserUploaded,
                versions: [{ id: element.id, version: element.version, description: element.chartDescription }],
            }
        }
    })
    const result = Object.values(chartMap).map((element) => {
        element.versions?.sort((a, b) => versionComparator(a, b, 'version', SortingOrder.DESC))
        return element
    })
    return sortObjectArrayAlphabetically(result, 'name') as DeploymentChartType[]
}
