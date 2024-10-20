/*
 * Copyright (c) 2024. Devtron Inc.
 */

import IndexedTextDisplay from '../components/IndexedTextDisplay'
import {
    compareSeverities,
    compareSeverity,
    getScanCompletedEmptyState,
    mapSeveritiesToSegmentedBarChartEntities,
    stringifySeverities,
} from '../utils'
import {
    MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID,
    SCAN_FAILED_EMPTY_STATE,
    SCAN_IN_PROGRESS_EMPTY_STATE,
    SEVERITY_DEFAULT_SORT_ORDER,
} from '../constants'
import {
    ApiResponseResultType,
    CATEGORIES,
    CodeScan,
    CodeScanExposedSecretsListType,
    CodeScanMisconfigurationsListType,
    DetailViewDataType,
    EmptyStateType,
    InfoCardPropsType,
    OpenDetailViewButtonProps,
    SUB_CATEGORIES,
    SecurityModalStateType,
    StatusType,
    TablePropsType,
} from '../types'
import { OpenDetailViewButton } from '../components'
import { getCVEUrlFromCVEName } from '../../utils'

export const getCodeScanVulnerabilities = (data: CodeScan['vulnerability'], hidePolicy: boolean) => ({
    headers: [
        { headerText: 'cve id', isSortable: false, width: 150 },
        {
            headerText: 'severity',
            isSortable: true,
            width: 100,
            compareFunc: compareSeverity,
            defaultSortOrder: SEVERITY_DEFAULT_SORT_ORDER,
        },
        { headerText: 'package', isSortable: true, width: 143.33 },
        { headerText: 'current version', isSortable: false, width: 143.33 },
        { headerText: 'fixed in version', isSortable: false, width: 143.33 },
        !hidePolicy && { headerText: 'policy', isSortable: false, width: 143.33 },
    ],
    rows: !data?.list?.length
        ? null
        : data.list.map((element, index) => ({
              id: index,
              expandableComponent: null,
              cells: [
                  {
                      /* FIXME: which ones should be linked and which ones should not? */
                      component: (
                          <a
                              href={getCVEUrlFromCVEName(element.cveId)}
                              rel="noopener noreferrer"
                              target="_blank"
                              data-testid="security-vulnerability-detail--cve-id"
                          >
                              {element.cveId}
                          </a>
                      ),
                      cellContent: element.cveId,
                  },
                  {
                      component: (
                          <span className={`severity-chip severity-chip--${element.severity?.toLowerCase()}`}>
                              {element.severity}
                          </span>
                      ),
                      cellContent: element.severity,
                  },
                  {
                      component: null,
                      cellContent: element.package,
                  },
                  {
                      component: null,
                      cellContent: element.currentVersion,
                  },
                  {
                      component: null,
                      cellContent: element.fixedInVersion,
                  },
                  !hidePolicy && {
                      component: (
                          <span className={`security-policy--${element.permission?.toLowerCase()}`}>
                              {element.permission}
                          </span>
                      ),
                      cellContent: element.permission,
                  },
              ],
          })),
    defaultSortIndex: 1,
})

export const getCodeScanLicense = (data: CodeScan['license']) => ({
    headers: [
        { headerText: 'classification', isSortable: false, width: 150 },
        {
            headerText: 'severity',
            isSortable: true,
            width: 100,
            compareFunc: compareSeverity,
            defaultSortOrder: SEVERITY_DEFAULT_SORT_ORDER,
        },
        { headerText: 'license', isSortable: false, width: 150 },
        { headerText: 'source', isSortable: true, width: 296 },
    ],
    rows: !data?.list?.length
        ? null
        : data.list.map((element, index) => ({
              id: index,
              expandableComponent: null,
              cells: [
                  {
                      component: (
                          <span className={element.classification.toLowerCase() === 'restricted' ? 'cr-5' : ''}>
                              {element.classification}
                          </span>
                      ),
                      cellContent: element.classification,
                  },
                  {
                      component: (
                          <span className={`severity-chip severity-chip--${element.severity?.toLowerCase()}`}>
                              {element.severity}
                          </span>
                      ),
                      cellContent: element.severity,
                  },
                  {
                      component: null,
                      cellContent: element.license,
                  },
                  {
                      component: (
                          <a
                              href={element.package || element.source}
                              className="cb-5"
                              rel="noopener noreferrer"
                              target="_blank"
                          >
                              {element.package || element.source}
                          </a>
                      ),
                      cellContent: element.package || element.source,
                  },
              ],
          })),
    defaultSortIndex: 1,
})

const getMisconfigurationsDetail = (
    element: CodeScanMisconfigurationsListType,
    lastScanTimeString: string,
    status: StatusType['status'],
    scanToolName: StatusType['scanToolName'],
) => ({
    titlePrefix: 'File path',
    title: element.filePath,
    headers: [
        { headerText: 'title', isSortable: false, width: 472 },
        {
            headerText: 'severity',
            isSortable: true,
            width: 100,
            compareFunc: compareSeverity,
            defaultSortOrder: SEVERITY_DEFAULT_SORT_ORDER,
        },
        { headerText: 'id', isSortable: false, width: 100 },
    ],
    rows: !element.list?.length
        ? null
        : element.list.map((child, index) => ({
              id: index,
              expandableComponent: (
                  <div className="flexbox-col dc__gap-8 ml-28">
                      <IndexedTextDisplay
                          title={element.filePath}
                          lines={child.causeMetadata.lines}
                          link={element.link}
                      />
                      <div className="flexbox-col fs-13 fw-4">
                          <span className="cn-7">Resolution</span>
                          <span className="cn-9">{child.resolution}</span>
                      </div>
                  </div>
              ),
              cells: [
                  {
                      component: (
                          <div className="flexbox-col">
                              <span className="fw-6">{child.title}</span>
                              <span>{child.message}</span>
                          </div>
                      ),
                      cellContent: '',
                  },
                  {
                      component: (
                          <span className={`severity-chip severity-chip--${child.severity?.toLowerCase()}`}>
                              {child.severity}
                          </span>
                      ),
                      cellContent: child.severity,
                  },
                  {
                      component: (
                          <a
                              href={`https://avd.aquasec.com/misconfig/${child.id.toLowerCase()}`}
                              className="cb-5"
                              rel="noopener noreferrer"
                              target="_blank"
                          >
                              {child.id}
                          </a>
                      ),
                      cellContent: child.id,
                  },
              ],
          })),
    defaultSortIndex: 1,
    entities: mapSeveritiesToSegmentedBarChartEntities(element.misConfSummary.status),
    lastScanTimeString,
    scanToolId: MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[scanToolName],
    hasExpandableRows: true,
    status,
})

export const getCodeScanMisconfigurations = (
    data: CodeScan['misConfigurations'],
    setDetailViewData: OpenDetailViewButtonProps['setDetailViewData'],
    lastScanTimeString: string,
    status: StatusType['status'],
    scanToolName: StatusType['scanToolName'],
) => ({
    headers: [
        { headerText: 'file path (relative)', isSortable: true, width: 289 },
        { headerText: 'scan summary', isSortable: true, width: 289, compareFunc: compareSeverities },
        { headerText: 'type', isSortable: true, width: 150 },
    ],
    rows: !data?.list?.length
        ? null
        : data.list.map((element, index) => ({
              id: index,
              expandableComponent: null,
              cells: [
                  {
                      component: (
                          <OpenDetailViewButton
                              detailViewData={getMisconfigurationsDetail(
                                  element,
                                  lastScanTimeString,
                                  status,
                                  scanToolName,
                              )}
                              setDetailViewData={setDetailViewData}
                          >
                              <span className="cb-5 fw-4 cursor">{element.filePath}</span>
                          </OpenDetailViewButton>
                      ),
                      cellContent: element.filePath,
                  },
                  {
                      component: <span>{stringifySeverities(element.misConfSummary.status)}</span>,
                      cellContent: element.misConfSummary.status,
                  },
                  {
                      component: null,
                      cellContent: element.type,
                  },
              ],
          })),
})

const getExposedSecretsDetail = (
    element: CodeScanExposedSecretsListType,
    lastScanTimeString: string,
    status: StatusType['status'],
    scanToolName: StatusType['scanToolName'],
) => ({
    titlePrefix: 'File',
    title: element.filePath,
    headers: [
        { headerText: 'rule id', isSortable: false, width: 450 },
        {
            headerText: 'severity',
            isSortable: true,
            width: 100,
            compareFunc: compareSeverity,
            defaultSortOrder: SEVERITY_DEFAULT_SORT_ORDER,
        },
        { headerText: 'category', isSortable: true, width: 150 },
    ],
    rows: !element.list?.length
        ? null
        : element.list?.map((child, index) => ({
              id: index,
              expandableComponent: (
                  <div className="ml-28 flexbox-col dc__gap-8">
                      <div className="flexbox-col fs-13 fw-4">
                          <span className="cn-7">Title</span>
                          <span className="cn-9">{child.title}</span>
                      </div>
                      <IndexedTextDisplay title={element.filePath} lines={child.lines} link={element.link} />
                  </div>
              ),
              cells: [
                  {
                      component: <span className="fw-6">{child.ruleId}</span>,
                      cellContent: '',
                  },
                  {
                      component: (
                          <span className={`severity-chip severity-chip--${child.severity?.toLowerCase()}`}>
                              {child.severity}
                          </span>
                      ),
                      cellContent: child.severity,
                  },
                  {
                      component: null,
                      cellContent: child.category,
                  },
              ],
          })),
    defaultSortIndex: 1,
    entities: mapSeveritiesToSegmentedBarChartEntities(element.summary.severities),
    lastScanTimeString,
    scanToolId: MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[scanToolName],
    hasExpandableRows: true,
    status,
})

export const getCodeScanExposedSecrets = (
    data: CodeScan['exposedSecrets'],
    setDetailViewData: OpenDetailViewButtonProps['setDetailViewData'],
    lastScanTimeString: string,
    status: StatusType['status'],
    scanToolName: StatusType['scanToolName'],
) => ({
    headers: [
        { headerText: 'file path (relative)', isSortable: true, width: 372 },
        { headerText: 'scan summary', isSortable: true, width: 372, compareFunc: compareSeverities },
    ],
    rows: !data?.list?.length
        ? null
        : data.list.map((element, index) => ({
              id: index,
              expandableComponent: null,
              cells: [
                  {
                      component: (
                          <OpenDetailViewButton
                              detailViewData={getExposedSecretsDetail(
                                  element,
                                  lastScanTimeString,
                                  status,
                                  scanToolName,
                              )}
                              setDetailViewData={setDetailViewData}
                          >
                              <span className="cb-5 fw-4 cursor">{element.filePath}</span>
                          </OpenDetailViewButton>
                      ),
                      cellContent: element.filePath,
                  },
                  {
                      component: <span>{stringifySeverities(element.summary.severities)}</span>,
                      cellContent: element.summary.severities,
                  },
              ],
          })),
})

export const getCodeScanTableData = (
    data: CodeScan,
    subCategory: SecurityModalStateType['subCategory'],
    setDetailViewData: OpenDetailViewButtonProps['setDetailViewData'],
    hidePolicy: boolean,
): TablePropsType => {
    switch (subCategory) {
        case SUB_CATEGORIES.VULNERABILITIES:
            return getCodeScanVulnerabilities(data[subCategory], hidePolicy)
        case SUB_CATEGORIES.LICENSE:
            return getCodeScanLicense(data[subCategory])
        case SUB_CATEGORIES.MISCONFIGURATIONS:
            return getCodeScanMisconfigurations(
                data[subCategory],
                setDetailViewData,
                data.StartedOn,
                data.status,
                data.scanToolName,
            )
        case SUB_CATEGORIES.EXPOSED_SECRETS:
            return getCodeScanExposedSecrets(
                data[subCategory],
                setDetailViewData,
                data.StartedOn,
                data.status,
                data.scanToolName,
            )
        default:
            return null
    }
}

export const getCodeScanInfoCardData = (
    data: CodeScan,
    subCategory: SecurityModalStateType['subCategory'],
): InfoCardPropsType => {
    switch (subCategory) {
        case SUB_CATEGORIES.VULNERABILITIES:
            return {
                entities: mapSeveritiesToSegmentedBarChartEntities(data[subCategory]?.summary.severities),
                lastScanTimeString: data.StartedOn,
                scanToolId: MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[data.scanToolName],
            }
        case SUB_CATEGORIES.LICENSE:
            return {
                entities: mapSeveritiesToSegmentedBarChartEntities(data[subCategory]?.summary.severities),
                lastScanTimeString: data.StartedOn,
                scanToolId: MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[data.scanToolName],
            }
        case SUB_CATEGORIES.MISCONFIGURATIONS:
            return {
                entities: mapSeveritiesToSegmentedBarChartEntities(data[subCategory]?.misConfSummary.status),
                lastScanTimeString: data.StartedOn,
                scanToolId: MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[data.scanToolName],
            }
        case SUB_CATEGORIES.EXPOSED_SECRETS:
            return {
                entities: mapSeveritiesToSegmentedBarChartEntities(data[subCategory]?.summary.severities),
                lastScanTimeString: data.StartedOn,
                scanToolId: MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[data.scanToolName],
            }
        default:
            return null
    }
}

const getCompletedEmptyState = (
    data: CodeScan,
    subCategory: SecurityModalStateType['subCategory'],
    detailViewData: DetailViewDataType,
) => {
    /* NOTE: show empty state only when we don't have any data to show */
    if ((data[subCategory]?.list && !detailViewData) || detailViewData?.rows) {
        return null
    }

    const detailViewTitleText = detailViewData ? `${detailViewData.titlePrefix}: ${detailViewData.title}` : ''
    const subTitleText = detailViewTitleText || 'code scan'
    const scanToolId = MAP_SCAN_TOOL_NAME_TO_SCAN_TOOL_ID[data.scanToolName]

    switch (subCategory) {
        case SUB_CATEGORIES.VULNERABILITIES:
            return {
                ...getScanCompletedEmptyState(scanToolId),
                subTitle: `No security vulnerability found in ${subTitleText}`,
            }
        case SUB_CATEGORIES.LICENSE:
            return {
                ...getScanCompletedEmptyState(scanToolId),
                subTitle: `No license risks found in ${subTitleText}`,
            }
        case SUB_CATEGORIES.MISCONFIGURATIONS:
            return {
                ...getScanCompletedEmptyState(scanToolId),
                subTitle: `No misconfigurations found in ${subTitleText}`,
            }
        case SUB_CATEGORIES.EXPOSED_SECRETS:
            return {
                ...getScanCompletedEmptyState(scanToolId),
                subTitle: `No exposed secrets found in ${subTitleText}`,
            }
        default:
            return null
    }
}

export const getCodeScanEmptyState = (
    data: ApiResponseResultType,
    subCategory: SecurityModalStateType['subCategory'],
    detailViewData: DetailViewDataType,
): EmptyStateType => {
    switch (data[CATEGORIES.CODE_SCAN].status) {
        case 'Failed':
            return SCAN_FAILED_EMPTY_STATE
        case 'Completed':
            return getCompletedEmptyState(data[CATEGORIES.CODE_SCAN], subCategory, detailViewData)
        case 'Progressing':
        case 'Running':
        default: /* FIXME: backend is sending empty status after re-deployment */
            return SCAN_IN_PROGRESS_EMPTY_STATE
    }
}
