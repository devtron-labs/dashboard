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

import { Badge, ComponentSizeType, SeveritiesDTO, SeverityCount } from '@devtron-labs/devtron-fe-common-lib'

import { SearchType, SecurityScansTabMultiFilterKeys, SecurityScansTabSingleFilterKeys } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [SecurityScansTabMultiFilterKeys.severity]: searchParams.getAll(SecurityScansTabMultiFilterKeys.severity) || [],
    [SecurityScansTabMultiFilterKeys.environment]:
        searchParams.getAll(SecurityScansTabMultiFilterKeys.environment) || [],
    [SecurityScansTabMultiFilterKeys.cluster]: searchParams.getAll(SecurityScansTabMultiFilterKeys.cluster) || [],
    [SecurityScansTabSingleFilterKeys.searchType]:
        searchParams.get(SecurityScansTabSingleFilterKeys.searchType) || 'appName',
})

export const getSearchLabelFromValue = (searchType: string) => {
    if (searchType === SearchType.VULNERABILITY) return 'Vulnerability'
    return 'Application'
}

const SEVERITY_ORDER = [
    { key: SeveritiesDTO.CRITICAL, label: 'Critical', variant: 'negative' },
    { key: SeveritiesDTO.HIGH, label: 'High', variant: 'custom', fontColor: 'R500', bgColor: 'R100' },
    { key: SeveritiesDTO.MEDIUM, label: 'Medium', variant: 'custom', fontColor: 'O600', bgColor: 'O100' },
    { key: SeveritiesDTO.LOW, label: 'Low', variant: 'warning' },
    { key: SeveritiesDTO.UNKNOWN, label: 'Unknown', variant: 'neutral' },
] as const

export const getSeverityWithCount = (severityCount: SeverityCount) => {
    const badges = []

    // eslint-disable-next-line no-restricted-syntax
    for (const item of SEVERITY_ORDER) {
        if (severityCount[item.key]) {
            if (item.variant === 'custom') {
                badges.push(
                    <Badge
                        key={item.key}
                        label={`${severityCount[item.key]} ${item.label}`}
                        variant="custom"
                        fontColor={item.fontColor}
                        bgColor={item.bgColor}
                        size={ComponentSizeType.xxxs}
                    />,
                )
            } else {
                badges.push(
                    <Badge
                        key={item.key}
                        label={`${severityCount[item.key]} ${item.label}`}
                        variant={item.variant}
                        size={ComponentSizeType.xxxs}
                    />,
                )
            }
        }
    }

    if (badges.length === 0) {
        return <Badge label="Passed" variant="positive" />
    }

    return <div className="flex left dc__gap-4">{badges}</div>
}
