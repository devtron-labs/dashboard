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

import { OptionType } from '../../../Common'
import { stringComparatorBySortOrder } from '../../Helpers'
import { EnvListMinDTO, GroupedOptionsType } from '../../types'
import { ENVIRONMENT_SELECTOR_TEXT } from './constants'
import { SelectedEnvironmentsMapType } from './types'

export const parseEnvironmentClusterListToOptions = (environmentClusterList: EnvListMinDTO[]): GroupedOptionsType[] => {
    const clusterEnvironmentMap: Record<string, EnvListMinDTO[]> = environmentClusterList.reduce(
        (acc, env) => {
            if (!acc[env.cluster_name]) {
                acc[env.cluster_name] = []
            }

            acc[env.cluster_name].push(env)
            return acc
        },
        {} as Record<string, EnvListMinDTO[]>,
    )

    return Object.entries(clusterEnvironmentMap)
        .map(([clusterName, environments]) => ({
            label: `${ENVIRONMENT_SELECTOR_TEXT.GROUP_HEADING_PREFIX} ${clusterName}`,
            options: environments
                .map((env) => ({
                    label: env.environment_name,
                    value: String(env.id),
                }))
                .sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
        }))
        .sort((a, b) => stringComparatorBySortOrder(a.label, b.label))
}

export const getSelectedOptions = <T>(
    selectedEnvironmentsMap: SelectedEnvironmentsMapType<T>,
    options: GroupedOptionsType[],
): OptionType[] => {
    if (!options?.length) {
        return []
    }

    return options.reduce((acc, project) => {
        const selectedApps = project.options.filter((option) => selectedEnvironmentsMap[option.label])
        return [...acc, ...selectedApps]
    }, [] as OptionType[])
}
