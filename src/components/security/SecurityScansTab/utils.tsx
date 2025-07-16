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

import { Badge, SeveritiesDTO, Severity, SeverityCount } from '@devtron-labs/devtron-fe-common-lib'

import { SearchType, SecurityScansTabMultiFilterKeys, SecurityScansTabSingleFilterKeys, SeverityMapping } from './types'

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

export const getSeverityFilterLabelFromValue = (severity: string) => {
    switch (severity) {
        case Severity.CRITICAL:
            return SeverityMapping.critical
        case Severity.HIGH:
            return SeverityMapping.high
        case Severity.MEDIUM:
            return SeverityMapping.medium
        case Severity.LOW:
            return SeverityMapping.low
        default:
            return SeverityMapping.unknown
    }
}

const SEVERITY_ORDER = [
    { key: SeveritiesDTO.CRITICAL, label: 'Critical', variant: 'negative' },
    { key: SeveritiesDTO.HIGH, label: 'High', variant: 'custom', fontColor: 'R500', bgColor: 'R100' },
    { key: SeveritiesDTO.MEDIUM, label: 'Medium', variant: 'custom', fontColor: 'O600', bgColor: 'O100' },
    { key: SeveritiesDTO.LOW, label: 'Low', variant: 'warning' },
    { key: SeveritiesDTO.UNKNOWN, label: 'Unknown', variant: 'neutral' },
] as const

export const getSeverityWithCount = (severityCount: SeverityCount) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of SEVERITY_ORDER) {
        if (severityCount[item.key]) {
            if (item.variant === 'custom') {
                return (
                    <Badge
                        label={`${severityCount[item.key]} ${item.label}`}
                        variant="custom"
                        fontColor={item.fontColor}
                        bgColor={item.bgColor}
                    />
                )
            }
            return <Badge label={`${severityCount[item.key]} ${item.label}`} variant={item.variant} />
        }
    }
    return <Badge label="Passed" variant="positive" />
}
