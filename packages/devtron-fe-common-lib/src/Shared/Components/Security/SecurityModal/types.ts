/*
 * Copyright (c) 2024. Devtron Inc.
 */

import React from 'react'
import { GenericEmptyStateType } from '@Common/Types'
import { LastExecutionResultType, NodeType, Nodes } from '@Shared/types'
import { SegmentedBarChartProps } from '@Common/SegmentedBarChart'
import { ServerErrors } from '@Common/ServerError'

export interface GetResourceScanDetailsPayloadType {
    name: string
    namespace: string
    group: string
    version: string
    kind: Nodes | NodeType
    clusterId: number
    appId?: string
    appType?: number
    deploymentType?: number
    isAppDetailView?: boolean
}

export interface AppDetailsPayload {
    appId?: number | string
    envId?: number | string
    installedAppId?: number | string
    artifactId?: number | string
    installedAppVersionHistoryId?: number | string
}

export interface ExecutionDetailsPayload extends Partial<Pick<AppDetailsPayload, 'appId' | 'envId'>> {
    imageScanDeployInfoId?: number | string
    artifactId?: number | string
}

export const CATEGORIES = {
    IMAGE_SCAN: 'imageScan',
    CODE_SCAN: 'codeScan',
    KUBERNETES_MANIFEST: 'kubernetesManifest',
} as const

export const SUB_CATEGORIES = {
    VULNERABILITIES: 'vulnerability',
    LICENSE: 'license',
    MISCONFIGURATIONS: 'misConfigurations',
    EXPOSED_SECRETS: 'exposedSecrets',
} as const

export enum SortOrderEnum {
    'ASC' = 1,
    'DESC' = -1,
}

export type TableRowCellType = {
    component: React.ReactNode | JSX.Element
    cellContent: string | object
}

export type TableHeaderCellType = {
    headerText: string
    isSortable: boolean
    width: number
    compareFunc?: (a: TableRowCellType['cellContent'], b: TableRowCellType['cellContent']) => number
    defaultSortOrder?: SortOrderEnum
}

export interface TableRowType {
    id: string | number
    cells: Array<TableRowCellType>
    expandableComponent: React.ReactNode | JSX.Element
}

export interface TablePropsType {
    headers: Array<TableHeaderCellType>
    rows: Array<TableRowType>
    defaultSortIndex?: number
    hasExpandableRows?: boolean
    /* TODO: a better/more meaningful name? */
    headerTopPosition?: number
}

export type TableSortStateType = {
    index: number
    order: SortOrderEnum
}

export interface InfoCardPropsType {
    entities: SegmentedBarChartProps['entities']
    lastScanTimeString?: string
    scanToolId?: number
}

export interface StatusType {
    status: 'Completed' | 'Running' | 'Failed' | 'Progressing'
    StartedOn: string
    scanToolName: 'TRIVY' | 'CLAIR'
}

export type DetailViewDataType = {
    titlePrefix: string
    title: string
    status: StatusType['status']
} & TablePropsType &
    InfoCardPropsType

export type SecurityModalStateType = {
    category: (typeof CATEGORIES)[keyof typeof CATEGORIES]
    subCategory: (typeof SUB_CATEGORIES)[keyof typeof SUB_CATEGORIES]
    detailViewData: DetailViewDataType[]
}

export interface SidebarPropsType {
    isHelmApp: boolean
    modalState: SecurityModalStateType
    setModalState: React.Dispatch<React.SetStateAction<SecurityModalStateType>>
    isExternalCI: boolean
}

export enum SeveritiesDTO {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    UNKNOWN = 'UNKNOWN',
    FAILURES = 'fail',
    SUCCESSES = 'success',
    EXCEPTIONS = 'exceptions',
}

type Summary<T extends 'severities' | 'status'> = Record<T, Partial<Record<SeveritiesDTO, number>>>

type GenericGroupType<T> = {
    list: T[]
}

type GenericGroupTypeWithSummary<T> = {
    summary: Summary<'severities'>
} & GenericGroupType<T>

type GenericGroupTypeWithMisConfSummary<T> = {
    misConfSummary: Summary<'status'>
} & GenericGroupType<T>

export interface CodeScanVulnerabilityType {
    cveId: string
    severity: SeveritiesDTO
    package: string
    currentVersion: string
    fixedInVersion: string
    permission?: string
}

export interface ImageScanVulnerabilityType extends CodeScanVulnerabilityType {
    target?: string
}

export interface ImageScanVulnerabilityListType extends StatusType {
    image: string
    summary: Summary<'severities'>
    list: ImageScanVulnerabilityType[]
}

export interface CodeScanLicenseType {
    classification: string
    severity: string
    license: string
    package: string
    source: string
}

export interface ImageScanLicenseListType extends StatusType {
    image: string
    summary: Summary<'severities'>
    list: CodeScanLicenseType[]
}

export type ImageScan = {
    [SUB_CATEGORIES.VULNERABILITIES]: GenericGroupTypeWithSummary<ImageScanVulnerabilityListType>
    [SUB_CATEGORIES.LICENSE]: GenericGroupTypeWithSummary<ImageScanLicenseListType>
}

export interface Line {
    number: number
    content: string
    isCause: boolean
    truncated: boolean
}

export interface CauseMetadata {
    startLine: number
    EndLine: number
    lines?: Line[]
}

export interface CodeScanMisconfigurationsDetailListType {
    id: string
    title: string
    message: string
    resolution: string
    status: string
    severity: string
    causeMetadata: CauseMetadata
}

export interface CodeScanMisconfigurationsListType {
    filePath: string
    link: string
    type: string
    misConfSummary: Summary<'status'>
    summary: Summary<'severities'>
    list: CodeScanMisconfigurationsDetailListType[]
}

export interface CodeScanExposedSecretsDetailListType {
    severity: string
    ruleId: string
    category: string
    startLine: number
    EndLine: number
    title: string /* TODO: confirm with real data */
    lines: Line[]
}

export interface CodeScanExposedSecretsListType {
    filePath: string
    link: string
    summary: Summary<'severities'>
    list: CodeScanExposedSecretsDetailListType[]
}

export type CodeScan = {
    [SUB_CATEGORIES.VULNERABILITIES]: GenericGroupTypeWithSummary<CodeScanVulnerabilityType>
    [SUB_CATEGORIES.LICENSE]: GenericGroupTypeWithSummary<CodeScanLicenseType>
    [SUB_CATEGORIES.MISCONFIGURATIONS]: GenericGroupTypeWithMisConfSummary<CodeScanMisconfigurationsListType>
    [SUB_CATEGORIES.EXPOSED_SECRETS]: GenericGroupTypeWithSummary<CodeScanExposedSecretsListType>
} & StatusType

export type KubernetesManifest = {
    [SUB_CATEGORIES.MISCONFIGURATIONS]: GenericGroupTypeWithMisConfSummary<CodeScanMisconfigurationsListType>
    [SUB_CATEGORIES.EXPOSED_SECRETS]: GenericGroupTypeWithSummary<CodeScanExposedSecretsListType>
} & StatusType

export type ApiResponseResultType = {
    scanned: boolean
    [CATEGORIES.IMAGE_SCAN]: ImageScan
    [CATEGORIES.CODE_SCAN]: CodeScan
    [CATEGORIES.KUBERNETES_MANIFEST]: KubernetesManifest
}

interface SecurityModalBaseProps extends Partial<Pick<SidebarPropsType, 'isExternalCI'>> {
    isLoading: boolean
    error: ServerErrors
    responseData: ApiResponseResultType
    handleModalClose: (event?: React.MouseEvent<HTMLElement>) => void
    Sidebar: React.FC<SidebarPropsType>
    isHelmApp?: boolean
    isResourceScan?: boolean
    isSecurityScanV2Enabled: boolean
    hidePolicy?: boolean
}

export type SecurityModalPropsType = SecurityModalBaseProps

export interface IndexedTextDisplayPropsType {
    title: string
    lines: Line[]
    link: string
}

export type SidebarDataChildType = {
    label: string
    value: {
        category: (typeof CATEGORIES)[keyof typeof CATEGORIES]
        subCategory: (typeof SUB_CATEGORIES)[keyof typeof SUB_CATEGORIES]
    }
}

export type SidebarDataType = {
    label: string
    isExpanded: boolean
    children: NonNullable<SidebarDataChildType[]>
    hideInHelmApp?: boolean
}

export type EmptyStateType = Pick<GenericEmptyStateType, 'image' | 'SvgImage' | 'subTitle' | 'title' | 'children'>

export const VulnerabilityState = {
    [-1]: 'Failed',
    0: 'Progressing',
    1: 'Completed',
} as const

export interface ImageVulnerabilityType {
    image: string
    state: keyof typeof VulnerabilityState
    error?: string
    scanResult: LastExecutionResultType | null
}

export interface VulnerabilityCountType {
    unknownVulnerabilitiesCount: number
    lowVulnerabilitiesCount: number
    mediumVulnerabilitiesCount: number
    highVulnerabilitiesCount: number
    criticalVulnerabilitiesCount: number
}

export interface GetResourceScanDetailsResponseType extends VulnerabilityCountType {
    imageVulnerabilities: ImageVulnerabilityType[]
}

export interface OpenDetailViewButtonProps {
    detailViewData: DetailViewDataType
    setDetailViewData: (detailViewData: DetailViewDataType) => void
}
