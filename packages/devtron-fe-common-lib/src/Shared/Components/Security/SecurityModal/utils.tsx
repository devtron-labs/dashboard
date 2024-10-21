/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { ScannedByToolModal } from '@Shared/Components/ScannedByToolModal'
import { SegmentedBarChartProps } from '@Common/SegmentedBarChart'
import { Severity } from '@Shared/types'
import { VulnerabilityType } from '@Common/Types'
import { ZERO_TIME_STRING } from '@Common/Constants'
import { ReactComponent as NoVulnerability } from '@Icons/ic-vulnerability-not-found.svg'
import { SCAN_TOOL_ID_TRIVY } from '@Shared/constants'
import {
    ApiResponseResultType,
    SeveritiesDTO,
    CATEGORIES,
    GetResourceScanDetailsResponseType,
    ImageScanVulnerabilityType,
    ImageVulnerabilityType,
    SUB_CATEGORIES,
    VulnerabilityCountType,
    VulnerabilityState,
} from './types'
import { SEVERITIES, ORDERED_SEVERITY_KEYS } from './constants'

export const mapSeveritiesToSegmentedBarChartEntities = (
    severities: Partial<Record<keyof typeof SEVERITIES, number>>,
) =>
    /* for all the SEVERITY keys in @severities create @Entity */
    severities &&
    ORDERED_SEVERITY_KEYS.map(
        (key: keyof typeof SEVERITIES) =>
            severities[key] && {
                color: SEVERITIES[key].color,
                label: SEVERITIES[key].label,
                value: severities[key],
            },
    ).filter((entity: SegmentedBarChartProps['entities'][number]) => !!entity)

export const stringifySeverities = (severities: Partial<Record<keyof typeof SEVERITIES, number>>) =>
    severities &&
    Object.keys(severities)
        .sort(
            (a: keyof typeof SEVERITIES, b: keyof typeof SEVERITIES) =>
                ORDERED_SEVERITY_KEYS.indexOf(a) - ORDERED_SEVERITY_KEYS.indexOf(b),
        )
        .map((key: keyof typeof SEVERITIES) => `${severities[key]} ${SEVERITIES[key].label}`)
        .join(', ')

export const getSeverityWeight = (severity: SeveritiesDTO): number =>
    ({
        [SeveritiesDTO.UNKNOWN]: 1,
        [SeveritiesDTO.LOW]: 2,
        [SeveritiesDTO.MEDIUM]: 3,
        [SeveritiesDTO.HIGH]: 4,
        [SeveritiesDTO.CRITICAL]: 5,
        [SeveritiesDTO.FAILURES]: 6,
        [SeveritiesDTO.EXCEPTIONS]: 7,
        [SeveritiesDTO.SUCCESSES]: 8,
    })[severity] || 10000
/* NOTE: not using POS_INFY or MAX_VALUE due to possibility of NaN & overflow */

export const compareSeverity = (a: SeveritiesDTO, b: SeveritiesDTO) => getSeverityWeight(a) - getSeverityWeight(b)

export const getSecurityScanSeveritiesCount = (data: ApiResponseResultType) => {
    const imageScanSeverities = data[CATEGORIES.IMAGE_SCAN].vulnerability?.summary?.severities
    const codeScanSeverities = data[CATEGORIES.CODE_SCAN].vulnerability?.summary?.severities
    return {
        critical: (imageScanSeverities?.CRITICAL || 0) + (codeScanSeverities?.CRITICAL || 0),
        high: (imageScanSeverities?.HIGH || 0) + (codeScanSeverities?.HIGH || 0),
        medium: (imageScanSeverities?.MEDIUM || 0) + (codeScanSeverities?.MEDIUM || 0),
        low: (imageScanSeverities?.LOW || 0) + (codeScanSeverities?.LOW || 0),
        unknown: (imageScanSeverities?.UNKNOWN || 0) + (codeScanSeverities?.UNKNOWN || 0),
    }
}

export const compareSeverities = (a: Record<SeveritiesDTO, number>, b: Record<SeveritiesDTO, number>) =>
    ORDERED_SEVERITY_KEYS.reduce((result, currentKey) => result || a[currentKey] - b[currentKey], 0)

export const getScanCompletedEmptyState = (scanToolId: number) => ({
    SvgImage: NoVulnerability,
    title: "You're secure!",
    children: (
        <span className="flex dc__border-radius-24 bcn-0 pl-16 pr-16 pt-8 pb-8 en-1 bw-1">
            <ScannedByToolModal scanToolId={scanToolId} />
        </span>
    ),
})

export const compareStringAndObject = (a: string | object, b: string | object) =>
    a.toString().localeCompare(b.toString())

const getSeverityFromVulnerabilitySeverity = (severity: VulnerabilityType['severity']) => {
    switch (severity.toLowerCase()) {
        case Severity.HIGH:
            return SeveritiesDTO.HIGH
        case Severity.UNKNOWN:
            return SeveritiesDTO.UNKNOWN
        case Severity.MEDIUM:
            return SeveritiesDTO.MEDIUM
        case Severity.LOW:
            return SeveritiesDTO.LOW
        case Severity.CRITICAL:
            return SeveritiesDTO.CRITICAL
        default:
            return null
    }
}

export const parseExecutionDetailResponse = (scanResult): ApiResponseResultType => ({
    [CATEGORIES.IMAGE_SCAN]: {
        [SUB_CATEGORIES.VULNERABILITIES]: {
            summary: {
                severities: {
                    [SeveritiesDTO.CRITICAL]: scanResult.severityCount?.critical || 0,
                    [SeveritiesDTO.HIGH]: scanResult.severityCount?.high || 0,
                    [SeveritiesDTO.MEDIUM]: scanResult.severityCount?.medium || 0,
                    [SeveritiesDTO.LOW]: scanResult.severityCount?.low || 0,
                    [SeveritiesDTO.UNKNOWN]: scanResult.severityCount?.unknown || 0,
                },
            },
            list: [
                {
                    image: scanResult.image,
                    summary: {
                        severities: {
                            [SeveritiesDTO.CRITICAL]: scanResult.severityCount?.critical || 0,
                            [SeveritiesDTO.HIGH]: scanResult.severityCount?.high || 0,
                            [SeveritiesDTO.MEDIUM]: scanResult.severityCount?.medium || 0,
                            [SeveritiesDTO.LOW]: scanResult.severityCount?.low || 0,
                            [SeveritiesDTO.UNKNOWN]: scanResult.severityCount?.unknown || 0,
                        },
                    },
                    list: scanResult.vulnerabilities?.map((vulnerability) => ({
                        cveId: vulnerability?.name,
                        package: vulnerability?.package,
                        currentVersion: vulnerability?.version,
                        fixedInVersion: vulnerability?.fixedVersion,
                        severity: getSeverityFromVulnerabilitySeverity(vulnerability?.severity),
                        permission: vulnerability?.permission,
                    })),
                    scanToolName: scanResult.scanToolId === SCAN_TOOL_ID_TRIVY ? 'TRIVY' : 'CLAIR',
                    StartedOn:
                        scanResult.executionTime && scanResult.executionTime !== ZERO_TIME_STRING
                            ? scanResult.executionTime
                            : '--',
                    status: scanResult.scanned ? 'Completed' : 'Progressing',
                },
            ],
        },
        [SUB_CATEGORIES.LICENSE]: null,
    },
    [CATEGORIES.CODE_SCAN]: null,
    [CATEGORIES.KUBERNETES_MANIFEST]: null,
    scanned: scanResult.scanned,
})

export const parseGetResourceScanDetailsResponse = (
    data: GetResourceScanDetailsResponseType,
): ApiResponseResultType => ({
    [CATEGORIES.IMAGE_SCAN]: {
        [SUB_CATEGORIES.VULNERABILITIES]: {
            summary: {
                severities: {
                    [SeveritiesDTO.CRITICAL]: data.criticalVulnerabilitiesCount || 0,
                    [SeveritiesDTO.HIGH]: data.highVulnerabilitiesCount || 0,
                    [SeveritiesDTO.MEDIUM]: data.mediumVulnerabilitiesCount || 0,
                    [SeveritiesDTO.LOW]: data.lowVulnerabilitiesCount || 0,
                    [SeveritiesDTO.UNKNOWN]: data.unknownVulnerabilitiesCount || 0,
                },
            },
            list: data.imageVulnerabilities.map((value) => ({
                image: value.image,
                summary: {
                    severities: {
                        ...(value.scanResult.severityCount.critical
                            ? { [SeveritiesDTO.CRITICAL]: value.scanResult.severityCount.critical }
                            : {}),
                        ...(value.scanResult.severityCount.high
                            ? { [SeveritiesDTO.HIGH]: value.scanResult.severityCount.high }
                            : {}),
                        ...(value.scanResult.severityCount.medium
                            ? { [SeveritiesDTO.MEDIUM]: value.scanResult.severityCount.medium }
                            : {}),
                        ...(value.scanResult.severityCount.low
                            ? { [SeveritiesDTO.LOW]: value.scanResult.severityCount.low }
                            : {}),
                        ...(value.scanResult.severityCount.unknown
                            ? { [SeveritiesDTO.LOW]: value.scanResult.severityCount.unknown }
                            : {}),
                    },
                },
                list: value.scanResult.vulnerabilities.map((vulnerability) => ({
                    cveId: vulnerability.name,
                    package: vulnerability.package,
                    currentVersion: vulnerability.version,
                    fixedInVersion: vulnerability.fixedVersion,
                    severity: getSeverityFromVulnerabilitySeverity(vulnerability.severity),
                })),
                scanToolName: 'TRIVY' /* TODO: need to create a mapping */,
                StartedOn: value.scanResult.lastExecution,
                status: VulnerabilityState[value.state],
            })),
        },
        [SUB_CATEGORIES.LICENSE]: null,
    },
    [CATEGORIES.CODE_SCAN]: null,
    [CATEGORIES.KUBERNETES_MANIFEST]: null,
    scanned: true,
})

export const getTotalVulnerabilityCount = (scannedResult: ImageVulnerabilityType[]): VulnerabilityCountType =>
    scannedResult.reduce(
        (acc, imageVulnerability) => {
            if (!imageVulnerability?.scanResult?.severityCount) {
                return acc
            }

            const {
                unknownVulnerabilitiesCount,
                lowVulnerabilitiesCount,
                mediumVulnerabilitiesCount,
                highVulnerabilitiesCount,
                criticalVulnerabilitiesCount,
            } = acc
            const {
                severityCount: { critical, high, medium, low, unknown },
            } = imageVulnerability.scanResult

            /* NOTE: counts can be sent as undefined */
            return {
                unknownVulnerabilitiesCount: unknownVulnerabilitiesCount + (unknown || 0),
                lowVulnerabilitiesCount: lowVulnerabilitiesCount + (low || 0),
                mediumVulnerabilitiesCount: mediumVulnerabilitiesCount + (medium || 0),
                highVulnerabilitiesCount: highVulnerabilitiesCount + (high || 0),
                criticalVulnerabilitiesCount: criticalVulnerabilitiesCount + (critical || 0),
            }
        },
        {
            unknownVulnerabilitiesCount: 0,
            lowVulnerabilitiesCount: 0,
            mediumVulnerabilitiesCount: 0,
            highVulnerabilitiesCount: 0,
            criticalVulnerabilitiesCount: 0,
        },
    )

const getSeveritiesFrequencyMap = (severities: SeveritiesDTO[]) => {
    const map: Partial<Record<SeveritiesDTO, number>> = {}
    severities.forEach((severity) => {
        map[severity] = (map[severity] ?? 0) + 1
    })
    return map
}

export const groupByTarget = (list: ImageScanVulnerabilityType[]) => {
    const map: Record<string, Array<ImageScanVulnerabilityType>> = {}
    list.forEach((element) => {
        if (map[element.target]) {
            map[element.target].push(element)
        } else {
            map[element.target] = [element]
        }
    })
    return Object.entries(map).map(([key, value]) => ({
        source: key,
        list: value,
        summary: {
            severities: getSeveritiesFrequencyMap(value.map((el) => el.severity)),
        },
    }))
}
