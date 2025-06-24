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

import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react'
import {
    showError,
    Progressing,
    ServerErrors,
    ErrorScreenManager,
    ClipboardButton,
    YAMLStringify,
    Nodes,
    CodeEditor,
    GVKType,
    SortableTableHeaderCell,
    SortingOrder,
    Tooltip,
    TabGroup,
    ComponentSizeType,
    TabProps,
    ToastManager,
    ToastVariantType,
    ResourceDetail,
    noop,
    AppThemeType,
    Icon,
    NodeDetailTabsInfoType,
    Button,
    ButtonVariantType,
    ButtonStyleType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import YAML from 'yaml'
import * as jsonpatch from 'fast-json-patch'
import { applyPatch } from 'fast-json-patch'
import { ReactComponent as Info } from '@Icons/ic-info-filled.svg'
import { ReactComponent as Error } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as AlertTriangle } from '@Icons/ic-alert-triangle.svg'
import { ReactComponent as Storage } from '@Icons/ic-storage.svg'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'
import { ReactComponent as Dropdown } from '@Icons/ic-chevron-down.svg'
import { ReactComponent as Success } from '@Icons/appstatus/healthy.svg'
import { getNodeCapacity, updateNodeManifest } from './clusterNodes.service'
import {
    ClusterListType,
    NodeDetail,
    NodeDetailResponse,
    PodType,
    TEXT_COLOR_CLASS,
    UpdateNodeRequestBody,
} from './types'
import { OrderBy } from '../app/list/types'
import { MODES, URLS } from '../../config'
import EditTaintsModal from './NodeActions/EditTaintsModal'
import { AUTO_SELECT, CLUSTER_NODE_ACTIONS_LABELS, NODE_DETAILS_TABS } from './constants'
import CordonNodeModal from './NodeActions/CordonNodeModal'
import DrainNodeModal from './NodeActions/DrainNodeModal'
import DeleteNodeModal from './NodeActions/DeleteNodeModal'
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '@Components/ResourceBrowser/Constants'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import './clusterNodes.scss'
import ResourceBrowserActionMenu from '@Components/ResourceBrowser/ResourceList/ResourceBrowserActionMenu'
import { importComponentFromFELibrary } from '@Components/common'
import { unauthorizedInfoText } from '@Components/ResourceBrowser/ResourceList/utils'

const REDFISH_NODE_UI_TABS = importComponentFromFELibrary('REDFISH_NODE_UI_TABS', [], 'function')

const NodeDetails = ({ addTab, lowercaseKindToResourceGroupMap, updateTabUrl }: ClusterListType) => {
    const { clusterId, node } = useParams<{ clusterId: string; nodeType: string; node: string }>()
    const [loader, setLoader] = useState(true)
    const [apiInProgress, setApiInProgress] = useState(false)
    const [isReviewState, setIsReviewStates] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [selectedSubTabIndex, setSelectedSubTabIndex] = useState(0)
    const [nodeDetail, setNodeDetail] = useState<NodeDetail>(null)
    const [modifiedManifest, setModifiedManifest] = useState('')
    const [cpuData, setCpuData] = useState<ResourceDetail>(null)
    const [memoryData, setMemoryData] = useState<ResourceDetail>(null)
    const [sortedPodList, setSortedPodList] = useState<PodType[]>(null)
    const [sortByColumnName, setSortByColumnName] = useState<string>('name')
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const [isShowWarning, setIsShowWarning] = useState(false)
    const [patchData, setPatchData] = useState<jsonpatch.Operation[]>(null)
    const toastId = useRef(null)
    const [showAllLabel, setShowAllLabel] = useState(false)
    const [showAllAnnotations, setShowAllAnnotations] = useState(false)
    const [showAllTaints, setShowAllTaints] = useState(false)
    const [showCordonNodeDialog, setCordonNodeDialog] = useState(false)
    const [showDrainNodeDialog, setDrainNodeDialog] = useState(false)
    const [showDeleteNodeDialog, setDeleteNodeDialog] = useState(false)
    const [showEditTaints, setShowEditTaints] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const { push, replace } = useHistory()

    const getData = (_patchdata: jsonpatch.Operation[]) => {
        setLoader(true)
        setErrorResponseCode(null)
        getNodeCapacity(clusterId, node)
            .then((response: NodeDetailResponse) => {
                if (response.result) {
                    setSortedPodList(response.result.pods?.sort((a, b) => a['name'].localeCompare(b['name'])))
                    setNodeDetail(response.result)
                    const resourceList = response.result.resources ?? []
                    for (let index = 0; index < resourceList.length; ) {
                        if (resourceList[index].name === 'cpu') {
                            setCpuData(resourceList[index])
                            resourceList.splice(index, 1)
                        } else if (resourceList[index].name === 'memory') {
                            setMemoryData(resourceList[index])
                            resourceList.splice(index, 1)
                        } else {
                            index++
                        }
                    }
                    let manifestData = JSON.parse(JSON.stringify(response.result.manifest))
                    if (_patchdata?.length) {
                        setPatchData(_patchdata)
                        manifestData = applyPatch(manifestData, _patchdata).newDocument
                        setIsShowWarning(true)
                    } else if (isShowWarning) {
                        setIsShowWarning(false)
                    }
                    setModifiedManifest(YAMLStringify(manifestData))
                }
                setLoader(false)
            })
            .catch((error) => {
                setErrorResponseCode(error.code)
                showError(error, true, true)
                setLoader(false)
            })
    }

    useEffect(() => {
        getData(patchData)
    }, [node])

    const getSanitizedNodeTabId = (id: string) => id.toLowerCase().replace(' ', '-')

    const renderSummary = (): JSX.Element | null => {
        if (!nodeDetail) {
            return null
        }

        return (
            <div className="node-details-container node-data-wrapper dc__overflow-hidden flexbox-col flex-grow-1">
                <div className="mt-12 node-details-grid dc__overflow-hidden">
                    <div className="pl-20 fw-6 fs-16 cn-9 dc__overflow-auto">
                        {renderErrorOverviewCard()}
                        {renderProbableIssuesOverviewCard()}
                        {renderNodeOverviewCard()}
                    </div>
                    <div className="dc__overflow-auto pr-20">
                        {renderResourceList()}
                        {renderLabelAnnotationTaint()}
                        {renderPodList()}
                    </div>
                </div>
            </div>
        )
    }

    const renderYAMLEditor = (): JSX.Element => (
        <div className="flex-grow-1 flexbox-col">
            <CodeEditor
                readOnly={!isEdit}
                diffView={isReviewState}
                mode={MODES.YAML}
                noParsing
                theme={AppThemeType.dark}
                height="fitToParent"
                {...(isReviewState
                    ? {
                          diffView: true,
                          originalValue: (nodeDetail?.manifest && YAMLStringify(nodeDetail.manifest)) || '',
                          modifiedValue: modifiedManifest,
                          onModifiedValueChange: handleEditorValueChange,
                      }
                    : {
                          diffView: false,
                          value: modifiedManifest,
                          onChange: handleEditorValueChange,
                      })}
            >
                {isReviewState && isShowWarning && (
                    <CodeEditor.Warning
                        className="dc__ellipsis-right"
                        text="Actual YAML has changed since you made the changes. Please check the diff carefully."
                    />
                )}
                {isReviewState && (
                    <CodeEditor.Header hideDefaultSplitHeader>
                        <p className="m-0 fs-12 fw-6 cn-7">Current node YAML</p>
                        <p className="m-0 fs-12 fw-6 cn-7 pl-16 flex left dc__gap-4">
                            <Edit className="icon-dim-16" />
                            <span>YAML (Editing)</span>
                        </p>
                    </CodeEditor.Header>
                )}
            </CodeEditor>
        </div>
    )

    const renderConditions = (): JSX.Element => (
        <div className="node-details-container flex-grow-1 flexbox-col dc__overflow-auto">
            <div className="ml-20 mr-20 mb-12 mt-12 bg__primary br-8 en-2 bw-1">
                <div className="condition-grid cn-7 fw-6 fs-13 dc__border-bottom pt-8 pl-20 pb-8 pr-20">
                    <div>Type</div>
                    <div>Status</div>
                    <div>Message</div>
                </div>
                {nodeDetail.conditions.map((condition) => (
                    <div className="condition-grid cn-9 fw-4 fs-13 dc__border-bottom-n1 pt-12 pl-20 pb-12 pr-20">
                        <div>{condition.type}</div>
                        <div className="flexbox">
                            {condition.haveIssue ? (
                                <Error className="mt-2 mb-2 mr-8 icon-dim-18" />
                            ) : (
                                <Success className="mt-2 mb-2 mr-8 icon-dim-18" />
                            )}
                            {condition.reason}
                        </div>
                        <div>{condition.message}</div>
                    </div>
                ))}
            </div>
        </div>
    )

    // id will be populated into url
    const NODE_TABS_INFO: NodeDetailTabsInfoType = [
        {
            id: getSanitizedNodeTabId(NODE_DETAILS_TABS.summary),
            label: NODE_DETAILS_TABS.summary,
            renderComponent: renderSummary,
        },
        ...(window._env_.FEATURE_REDFISH_NODE_ENABLE ? REDFISH_NODE_UI_TABS : []),
        {
            id: getSanitizedNodeTabId(NODE_DETAILS_TABS.yaml),
            label: NODE_DETAILS_TABS.yaml,
            icon: 'ic-pencil',
            renderComponent: renderYAMLEditor,
        },
        {
            id: getSanitizedNodeTabId(NODE_DETAILS_TABS.nodeConditions),
            label: NODE_DETAILS_TABS.nodeConditions,
            renderComponent: renderConditions,
        },
    ]

    useEffect(() => {
        const tab = queryParams.get('tab')
        const tabIndex = NODE_TABS_INFO.findIndex((tabDetails) => tabDetails.id === tab)

        if (tabIndex !== -1) {
            setSelectedTabIndex(tabIndex)
        } else {
            replace({
                pathname: location.pathname,
                search: `?tab=${getSanitizedNodeTabId(NODE_DETAILS_TABS.summary)}`,
            })
        }
    }, [location.search])

    const selectedResource = useMemo((): { gvk: GVKType; namespaced: boolean } => {
        // Using - as a prefix since the group is empty for pods
        const resourceGroupData = lowercaseKindToResourceGroupMap[`-${Nodes.Pod.toLowerCase()}`]
        if (!resourceGroupData) {
            return { gvk: { Kind: Nodes.Pod, Group: '', Version: 'v1' }, namespaced: true }
        }
        return resourceGroupData
    }, [lowercaseKindToResourceGroupMap])

    const changeNodeTab = (e): void => {
        const _tabIndex = Number(e.currentTarget.dataset.tabIndex)
        if (node !== AUTO_SELECT.value) {
            const selectedTab = NODE_TABS_INFO[_tabIndex]?.id || ''
            const _searchParam = `?tab=${selectedTab}`

            updateTabUrl({
                url: `${location.pathname}${_searchParam}`,
            })
        }
    }

    const renderNodeDetailsTabs = (): JSX.Element => {
        const tabs = NODE_TABS_INFO.map(({ renderComponent, ...tabDetails }, index) => ({
            ...tabDetails,
            tabType: 'navLink',
            props: {
                to: `?tab=${tabDetails.id}`,
                onClick: changeNodeTab,
                isActive: (_, { search }) => search === `?tab=${tabDetails.id}`,
                ['data-tab-index']: index,
            },
        })) as TabProps[]

        return (
            <div className="px-20 dc__border-bottom flex dc__gap-16">
                <TabGroup tabs={tabs} size={ComponentSizeType.medium} />
                {nodeControls()}
            </div>
        )
    }

    const noDataInSubTab = (tabName: string): JSX.Element => {
        return (
            <div className="dc__text-center no-data-tab">
                <Info className="no-data-icon" />
                <div className="cn-7 fs-13 fw-4">No {tabName}</div>
            </div>
        )
    }

    const renderKeyValueLabel = (key: string, value?: string): JSX.Element => {
        const keyValue = `${key}=${value || ''}`
        return (
            <div className="dc__visible-hover dc__visible-hover--parent flexbox mb-8 hover-trigger dc__position-rel dc__align-items-center">
                <div
                    className={`cn-9 bg__secondary fw-6 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 ${
                        !value ? ' br-4' : ' dc__left-radius-4 dc__no-right-border'
                    }`}
                >
                    {key}
                </div>
                {value && (
                    <div className="cn-9 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 dc__right-radius-4">{value}</div>
                )}
                <div className="ml-8 dc__visible-hover--child">
                    <ClipboardButton content={keyValue} />
                </div>
            </div>
        )
    }

    const renderLabelTab = (): JSX.Element => {
        if (nodeDetail.labels.length === 0) {
            return noDataInSubTab('Labels')
        }
        return (
            <>
                {(showAllLabel ? nodeDetail.labels : nodeDetail.labels.slice(0, 10)).map((label) =>
                    renderKeyValueLabel(label.key, label.value),
                )}
                {nodeDetail.labels.length > 10 && renderShowAll(showAllLabel, setShowAllLabel)}
            </>
        )
    }

    const renderAnnotationTab = (): JSX.Element => {
        if (nodeDetail.annotations.length === 0) {
            return noDataInSubTab('Annotations')
        }
        return (
            <>
                {(showAllAnnotations ? nodeDetail.annotations : nodeDetail.annotations.slice(0, 10)).map((annotation) =>
                    renderKeyValueLabel(annotation.key, annotation.value),
                )}
                {nodeDetail.annotations.length > 10 && renderShowAll(showAllAnnotations, setShowAllAnnotations)}
            </>
        )
    }

    const renderWithCopy = (key: string): JSX.Element => {
        return (
            <div className="dc__visible-hover dc__visible-hover--parent flexbox mb-8 hover-trigger dc__position-rel dc__align-items-center">
                <div>{key}</div>
                <div className="ml-8 flex dc__visible-hover--child">
                    <ClipboardButton content={key} />
                </div>
            </div>
        )
    }

    const renderTaintTab = (): JSX.Element => {
        if (!nodeDetail.taints?.length) {
            return noDataInSubTab('Taints')
        }
        return (
            <div>
                <div className="subtab-grid mb-8 cn-7 fw-6 fs-13">
                    <div>Key|Value</div>
                    <div>Effect</div>
                </div>
                {(showAllTaints ? nodeDetail.taints : nodeDetail.taints.slice(0, 10)).map((taint) => (
                    <div className="subtab-grid" key={taint.key}>
                        {renderKeyValueLabel(taint.key, taint.value)}
                        {renderWithCopy(taint['effect'])}
                    </div>
                ))}
                {nodeDetail.taints.length > 10 && renderShowAll(showAllTaints, setShowAllTaints)}
            </div>
        )
    }

    const renderShowAll = (
        condition: boolean,
        onClickHandler: React.Dispatch<React.SetStateAction<boolean>>,
    ): JSX.Element => {
        return (
            <div
                className="cb-5 cursor flexbox fs-13 fw-6"
                onClick={() => {
                    onClickHandler(!condition)
                }}
            >
                {condition ? 'Show less' : 'Show all'}
                <Dropdown
                    className="icon-dim-22 rotate show-more-dropdown fcb-5"
                    style={{ ['--rotateBy' as any]: condition ? '180deg' : '0deg' }}
                />
            </div>
        )
    }

    const renderLabelAnnotationTaint = (): JSX.Element => {
        const tabs: TabProps[] = [
            {
                id: 'labels-tab',
                label: `Labels (${nodeDetail.labels.length})`,
                tabType: 'button',
                active: selectedSubTabIndex == 0,
                props: {
                    onClick: () => {
                        setSelectedSubTabIndex(0)
                    },
                },
            },
            {
                id: 'annotation-tab',
                label: `Annotation (${nodeDetail.annotations.length})`,
                tabType: 'button',
                active: selectedSubTabIndex == 1,
                props: {
                    onClick: () => {
                        setSelectedSubTabIndex(1)
                    },
                },
            },
            {
                id: 'taints-tab',
                label: `Taints (${nodeDetail.taints?.length || 0})`,
                tabType: 'button',
                active: selectedSubTabIndex == 2,
                props: {
                    onClick: () => {
                        setSelectedSubTabIndex(2)
                    },
                },
            },
        ]

        return (
            <div>
                <div className="dc__border-bottom dc__position-sticky dc__top-0 dc__zi-1 bg__primary">
                    <div className="en-2 bw-1 dc__top-radius-4 bg__primary dc__no-bottom-border px-20">
                        <TabGroup tabs={tabs} />
                    </div>
                </div>
                <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bg__primary mb-20">
                    <div className=" pr-20 pl-20 pt-12 pb-12">
                        {selectedSubTabIndex == 0 && renderLabelTab()}
                        {selectedSubTabIndex == 1 && renderAnnotationTab()}
                        {selectedSubTabIndex == 2 && renderTaintTab()}
                    </div>
                </div>
            </div>
        )
    }
    const renderErrorOverviewCard = (): JSX.Element | null => {
        const nodeErrorKeys = Object.keys(nodeDetail.errors)
        if (!nodeErrorKeys.length) {
            return null
        }
        return (
            <div className="mb-12 en-2 bw-1 br-4 bg__primary">
                <div className="flexbox bcr-5 pt-12 pb-12 pr-16 pl-16 dc__top-radius-4">
                    <Error className="error-icon-white mt-2 mb-2 mr-8 icon-dim-18" />
                    <span className="fw-6 fs-14 cn-0">
                        {`${nodeErrorKeys.length} Error${nodeErrorKeys.length > 1 ? 's' : ''}`}
                    </span>
                </div>
                <div className="pt-12 pr-16 pl-16">
                    {nodeErrorKeys.map((key) => (
                        <>
                            <div className="fw-6 fs-13 cn-9">{key}</div>
                            <p className="fw-4 fs-13 cn-7 mb-12">{nodeDetail.errors[key]}</p>
                        </>
                    ))}
                </div>
            </div>
        )
    }
    const renderProbableIssuesOverviewCard = (): JSX.Element | null => {
        const isCPUOverCommitted = Number(cpuData?.usagePercentage?.slice(0, -1) || 0) > 100
        const issueCount =
            (isCPUOverCommitted ? 1 : 0) + (nodeDetail.unschedulable ? 1 : 0) + (nodeDetail.taints?.length > 0 ? 1 : 0)
        if (!issueCount) {
            return null
        }
        return (
            <div className="mb-12 en-2 bw-1 br-4 bg__primary">
                <div className="flexbox bcy-2 pt-12 pb-12 pr-16 pl-16 dc__top-radius-4">
                    <AlertTriangle className="alert-icon-white mt-2 mb-2 mr-8 icon-dim-18" />
                    <span className="fw-6 fs-14 cn-9">
                        {`${issueCount} Probable issue${issueCount > 1 ? 's' : ''}`}
                    </span>
                </div>
                <div className="pt-12 pr-16 pl-16">
                    {isCPUOverCommitted && (
                        <div>
                            <div className="fw-6 fs-13 cn-9">Resource overcommitted</div>
                            <p className="fw-4 fs-13 cn-7 mb-12">Limits for “cpu” is over 100%</p>
                        </div>
                    )}
                    {nodeDetail.taints?.length && (
                        <div>
                            <div className="fw-6 fs-13 cn-9">{nodeDetail.taints?.length} taints applied</div>
                            <p className="fw-4 fs-13 cn-7 mb-12">
                                Taints may be restricting pods from being scheduled on this node
                            </p>
                        </div>
                    )}
                    {nodeDetail.unschedulable && (
                        <div>
                            <div className="fw-6 fs-13 cn-9">Unschedulable: true</div>
                            <p className="fw-4 fs-13 cn-7 mb-12">
                                This restricts pods from being scheduled on this node
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderStatus = () => {
        return (
            <span className="flex left">
                <span>{nodeDetail.status}</span>
                {nodeDetail.unschedulable && (
                    <>
                        <span className="dc__bullet mr-4 ml-4 mw-4 bcn-4" />
                        <span className="cr-5"> SchedulingDisabled</span>
                    </>
                )}
            </span>
        )
    }

    const renderNodeOverviewCard = (): JSX.Element => {
        return (
            <div className="en-2 bw-1 br-4 bg__primary">
                <div className="flexbox pt-12 pb-12 pr-16 pl-16 dc__top-radius-4">
                    <span className="fw-6 fs-14 cn-9">Node overview</span>
                </div>
                <div className="pr-16 pl-16">
                    <div>
                        <div className="fw-6 fs-13 cn-7">Name</div>
                        <p className="fw-4 fs-13 cn-9 mb-12">{nodeDetail.name}</p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-7">Status</div>
                        <p className={`fw-4 fs-13 cn-9 mb-12 ${TEXT_COLOR_CLASS[nodeDetail.status] || 'cn-7'}`}>
                            {renderStatus()}
                        </p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-7">Role</div>
                        <p className="fw-4 fs-13 cn-9 mb-12">{nodeDetail.roles}</p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-9">K8s version</div>
                        <p className="fw-4 fs-13 cn-7 mb-12">{nodeDetail.k8sVersion}</p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-9">Unschedulable</div>
                        <p className="fw-4 fs-13 cn-7 mb-12">{nodeDetail.unschedulable.toString()}</p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-9">Created at</div>
                        <p className="fw-4 fs-13 cn-7 mb-12">{nodeDetail.createdAt}</p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-9">Internal IP</div>
                        <p className="fw-4 fs-13 cn-7 mb-12">{nodeDetail.internalIp}</p>
                    </div>
                    <div>
                        <div className="fw-6 fs-13 cn-9">External IP</div>
                        <p className="fw-4 fs-13 cn-7 mb-12">{nodeDetail.externalIp}</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderResourceList = (): JSX.Element => {
        if (!nodeDetail.resources?.length) {
            return null
        }

        return (
            <div>
                <div className="dc__border-bottom dc__position-sticky dc__top-0 dc__zi-1 bg__primary">
                    <div className="en-2 bw-1 dc__top-radius-4 bg__primary dc__no-bottom-border resource-row dc__border-bottom fw-6 fs-13 pt-8 pb-8 pr-20 pl-20 cn-7">
                        <div />
                        <div>Resource</div>
                        <div>Requests</div>
                        <div>Limits</div>
                        <div>Usage</div>
                        <div>Allocatable</div>
                        <div>Capacity</div>
                    </div>
                </div>
                <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bg__primary mb-20">
                    {cpuData && (
                        <div className="resource-row dc__border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
                            <Icon name="ic-cpu" color={null} size={20} />
                            <div>{cpuData.name || '-'}</div>
                            <div>{cpuData.requestPercentage || '-'}</div>
                            <div>{cpuData.limitPercentage || '-'}</div>
                            <div>{cpuData.usagePercentage || '-'}</div>
                            <div>{cpuData.allocatable || '-'}</div>
                            <div>{cpuData.capacity || '-'}</div>
                        </div>
                    )}
                    {memoryData && (
                        <div className="resource-row dc__border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
                            <Icon name="ic-memory" color={null} size={20} />
                            <div>{memoryData.name || '-'}</div>
                            <div>{memoryData.requestPercentage || '-'}</div>
                            <div>{memoryData.limitPercentage || '-'}</div>
                            <div>{memoryData.usagePercentage || '-'}</div>
                            <div>{memoryData.allocatable || '-'}</div>
                            <div>{memoryData.capacity || '-'}</div>
                        </div>
                    )}
                    {nodeDetail.resources.map((resource) => (
                        <div
                            key={resource.name}
                            className="resource-row dc__border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9"
                        >
                            <Storage className="mt-2 mb-2 icon-dim-20" />
                            <div>{resource.name || '-'}</div>
                            <div>{resource.requestPercentage || '-'}</div>
                            <div>{resource.limitPercentage || '-'}</div>
                            <div>{resource.usagePercentage || '-'}</div>
                            <div>{resource.allocatable || '-'}</div>
                            <div>{resource.capacity || '-'}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const openDebugTerminal = () => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('node', nodeDetail.name)
        const url = location.pathname
        push(
            `${url.split('/').slice(0, -3).join('/')}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}?${queryParams.toString()}`,
        )
    }

    const handleSortClick = (columnName: string, sortType: string): void => {
        let _sortOrder = OrderBy.ASC
        if (sortByColumnName === columnName) {
            _sortOrder = sortOrder === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC
        } else {
            setSortByColumnName(columnName)
        }
        setSortOrder(_sortOrder)
        const comparatorMethod =
            sortType === 'number'
                ? (a, b) => {
                      const sortByColumnArr = columnName.split('.')
                      let firstValue = 0
                      let secondValue = 0
                      if (a[sortByColumnArr[0]][sortByColumnArr[1]]) {
                          firstValue = Number(a[sortByColumnArr[0]][sortByColumnArr[1]].slice(0, -1))
                      }
                      if (b[sortByColumnArr[0]][sortByColumnArr[1]]) {
                          secondValue = Number(b[sortByColumnArr[0]][sortByColumnArr[1]].slice(0, -1))
                      }
                      return _sortOrder === OrderBy.ASC ? firstValue - secondValue : secondValue - firstValue
                  }
                : (a, b) => {
                      return (_sortOrder === OrderBy.ASC && columnName !== 'createdAt') ||
                          (_sortOrder === OrderBy.DESC && columnName === 'createdAt')
                          ? a[columnName].localeCompare(b[columnName])
                          : b[columnName].localeCompare(a[columnName])
                  }
        setSortedPodList([...nodeDetail.pods].sort(comparatorMethod))
    }

    const handleResourceClick = (e) => {
        const { name, tab, namespace } = e.currentTarget.dataset
        let _nodeSelectionData
        let _group
        _group = selectedResource?.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP
        _nodeSelectionData = { name: `pod` + `_${name}`, namespace, isFromNodeDetails: true }
        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/pod/${_group}/${name}${
            tab ? `/${tab.toLowerCase()}` : ''
        }`
        addTab({ idPrefix: `${_group}_${namespace}`, kind: 'pod', name, url: _url }).then(() => {
            push(_url)
        })
    }

    const getTriggerSortingHandler =
        (...props: Parameters<typeof handleSortClick>) =>
        () => {
            handleSortClick(...props)
        }

    const renderPodHeaderCell = (columnName: string, sortingFieldName: string, columnType: string): JSX.Element => (
        <SortableTableHeaderCell
            showTippyOnTruncate
            title={columnName}
            triggerSorting={getTriggerSortingHandler(sortingFieldName, columnType)}
            isSorted={sortByColumnName === sortingFieldName}
            sortOrder={sortOrder === OrderBy.DESC ? SortingOrder.DESC : SortingOrder.ASC}
            disabled={false}
        />
    )

    const getPodListData = async (): Promise<void> => {
        getData([])
    }

    const renderPodList = (): JSX.Element | null => {
        if (!sortedPodList) {
            return null
        }
        return (
            <div className="pod-container">
                <div className="dc__position-sticky  pod-container-header">
                    <div className="en-2 bw-1 dc__top-radius-4 bg__primary dc__no-bottom-border">
                        <div className="fw-6 fs-14 cn-9 pr-20 pl-20 pt-12">Pods</div>
                    </div>
                </div>
                <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bg__primary mb-20">
                    <div className="pods-grid fw-4 fs-13 cn-9">
                        <header className="bg__primary dc__border-bottom fw-6">
                            {renderPodHeaderCell('Namespace', 'namespace', 'string')}
                            {renderPodHeaderCell('Pod', 'name', 'string')}
                            {renderPodHeaderCell('CPU Requests', 'cpu.requestPercentage', 'number')}
                            {renderPodHeaderCell('CPU Limit', 'cpu.limitPercentage', 'number')}
                            {renderPodHeaderCell('Mem Requests', 'memory.requestPercentage', 'number')}
                            {renderPodHeaderCell('Mem Limit', 'memory.limitPercentage', 'number')}
                            {renderPodHeaderCell('Age', 'createdAt', 'string')}
                        </header>
                        <main>
                            {sortedPodList.map((pod) => (
                                <div className="row-wrapper" key={`${pod.name}-${pod.namespace}`}>
                                    <span className="dc__ellipsis-right">{pod.namespace}</span>
                                    <div className="dc__visible-hover dc__visible-hover--parent hover-trigger dc__position-rel flexbox dc__align-items-center">
                                        <Tooltip content={pod.name} interactive>
                                            <span
                                                className="dc__inline-block dc__ellipsis-right cb-5 cursor"
                                                style={{ maxWidth: 'calc(100% - 20px)' }}
                                                data-name={pod.name}
                                                data-namespace={pod.namespace}
                                                onClick={handleResourceClick}
                                            >
                                                {pod.name}
                                            </span>
                                        </Tooltip>
                                        <div className="ml-8 dc__visible-hover--child">
                                            <ClipboardButton content={pod.name} />
                                        </div>

                                        <ResourceBrowserActionMenu
                                            clusterId={clusterId}
                                            resourceData={pod}
                                            selectedResource={selectedResource}
                                            getResourceListData={getPodListData}
                                            handleResourceClick={handleResourceClick}
                                            handleClearBulkSelection={noop}
                                        />
                                    </div>
                                    <span>{pod.cpu.requestPercentage || '-'}</span>
                                    <span>{pod.cpu.limitPercentage || '-'}</span>
                                    <span>{pod.memory.requestPercentage || '-'}</span>
                                    <span>{pod.memory.limitPercentage || '-'}</span>
                                    <span>{pod.age}</span>
                                </div>
                            ))}
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    const setYAMLEdit = () => {
        setIsEdit(true)
    }

    const renderTabControls = () => {
        const selectedTab = NODE_TABS_INFO[selectedTabIndex]

        if (selectedTab.id === getSanitizedNodeTabId(NODE_DETAILS_TABS.yaml)) {
            if (!isEdit) {
                return (
                    <div className="flexbox dc__align-items-center dc__gap-12">
                        <div className="dc__divider h-16" />

                        <Button
                            dataTestId="edit-yaml"
                            variant={ButtonVariantType.text}
                            size={ComponentSizeType.small}
                            text="Edit YAML"
                            onClick={setYAMLEdit}
                            startIcon={<Icon name="ic-pencil" color={null} />}
                        />
                    </div>
                )
            }
            return (
                <div className="flexbox dc__align-items-center dc__gap-12">
                    <div className="dc__divider h-16" />

                    <Button
                        dataTestId={isReviewState ? 'apply-changes' : 'review-changes'}
                        variant={ButtonVariantType.text}
                        size={ComponentSizeType.small}
                        text={isReviewState ? 'Apply changes' : 'Review & Save changes'}
                        onClick={saveYAML}
                        startIcon={isReviewState ? <Icon name="ic-check" color={null} /> : null}
                        isLoading={apiInProgress}
                    />

                    {!apiInProgress && (
                        <Button
                            dataTestId="cancel-changes"
                            variant={ButtonVariantType.text}
                            size={ComponentSizeType.small}
                            style={ButtonStyleType.negativeGrey}
                            onClick={cancelYAMLEdit}
                            text="Cancel"
                        />
                    )}
                </div>
            )
        }

        return <div />
    }

    const nodeControls = () => (
        <div className="flex-grow-1 flexbox dc__content-space dc__gap-12">
            {renderTabControls()}

            <div className="flexbox dc__gap-12 dc__align-items-center">
                <Button
                    dataTestId="open-debug-terminal"
                    variant={ButtonVariantType.text}
                    text={NODE_DETAILS_TABS.debug}
                    onClick={openDebugTerminal}
                    size={ComponentSizeType.small}
                    startIcon={<Icon name="ic-terminal" color={null} />}
                />

                <Button
                    dataTestId={nodeDetail?.unschedulable ? 'un-cordon-node' : 'cordon-node'}
                    variant={ButtonVariantType.text}
                    size={ComponentSizeType.small}
                    text={
                        nodeDetail?.unschedulable
                            ? CLUSTER_NODE_ACTIONS_LABELS.uncordon
                            : CLUSTER_NODE_ACTIONS_LABELS.cordon
                    }
                    onClick={showCordonNodeModal}
                />

                <Button
                    dataTestId="drain-node"
                    variant={ButtonVariantType.text}
                    size={ComponentSizeType.small}
                    text={CLUSTER_NODE_ACTIONS_LABELS.drain}
                    onClick={showDrainNodeModal}
                />

                <Button
                    dataTestId="edit-taints"
                    variant={ButtonVariantType.text}
                    size={ComponentSizeType.small}
                    onClick={showEditTaintsModal}
                    text={CLUSTER_NODE_ACTIONS_LABELS.taints}
                />

                <Button
                    dataTestId="delete-node"
                    variant={ButtonVariantType.text}
                    style={ButtonStyleType.negative}
                    size={ComponentSizeType.small}
                    onClick={showDeleteNodeModal}
                    text={CLUSTER_NODE_ACTIONS_LABELS.delete}
                    startIcon={<Icon name="ic-delete" color={null} />}
                />
            </div>
        </div>
    )

    const cancelYAMLEdit = (): void => {
        setIsReviewStates(false)
        setIsEdit(false)
        setModifiedManifest(YAMLStringify(nodeDetail.manifest))
    }

    const handleEditorValueChange = (codeEditorData: string): void => {
        setModifiedManifest(codeEditorData)
    }

    const reloadDataAndHideToast = (): void => {
        setNodeDetail(null)
        const _patchData = jsonpatch.compare(nodeDetail.manifest, YAML.parse(modifiedManifest))
        getData(_patchData)
        ToastManager.dismissToast(toastId.current)
    }

    const saveYAML = (): void => {
        if (isReviewState) {
            const parsedManifest = YAML.parse(modifiedManifest)
            const requestData: UpdateNodeRequestBody = {
                clusterId: +clusterId,
                name: node,
                manifestPatch: JSON.stringify(parsedManifest),
                version: nodeDetail.version,
                kind: nodeDetail.kind,
            }
            setApiInProgress(true)
            updateNodeManifest(clusterId, node, requestData)
                .then((response: NodeDetailResponse) => {
                    setApiInProgress(false)
                    if (response.result) {
                        ToastManager.showToast({
                            variant: ToastVariantType.success,
                            description: 'Node updated',
                        })
                        setIsReviewStates(false)
                        setIsEdit(false)
                        setIsShowWarning(false)
                        getData([])
                    }
                })
                .catch((error) => {
                    let modifiedYAMLError
                    if (error instanceof ServerErrors && Array.isArray(error.errors)) {
                        modifiedYAMLError = error.errors.find((errorData) => Number(errorData.code) === 409)
                    }
                    if (modifiedYAMLError) {
                        ToastManager.showToast(
                            {
                                variant: ToastVariantType.info,
                                title: 'Cannot apply changes as node yaml has changed',
                                description: 'Please apply your changes to the latest version and try again.',
                                buttonProps: {
                                    text: 'Show latest YAML',
                                    dataTestId: 'show-latest-yaml',
                                    onClick: reloadDataAndHideToast,
                                },
                            },
                            {
                                autoClose: false,
                            },
                        )
                    } else {
                        showError(error)
                    }

                    setApiInProgress(false)
                })
        } else {
            setIsReviewStates(true)
        }
    }

    const renderTabContent = (): JSX.Element => {
        const selectedTab = NODE_TABS_INFO[selectedTabIndex]
        const renderNode = selectedTab?.renderComponent

        if (renderNode) {
            return renderNode()
        }

        return null
    }

    const showCordonNodeModal = (): void => {
        setCordonNodeDialog(true)
    }

    const hideCordonNodeModal = (refreshData?: boolean): void => {
        setCordonNodeDialog(false)
        if (refreshData) {
            getData([])
        }
    }

    const showDrainNodeModal = (): void => {
        setDrainNodeDialog(true)
    }

    const hideDrainNodeModal = (refreshData?: boolean): void => {
        setDrainNodeDialog(false)
        if (refreshData) {
            getData([])
        }
    }

    const showDeleteNodeModal = (): void => {
        setDeleteNodeDialog(true)
    }

    const hideDeleteNodeModal = (refreshData?: boolean): void => {
        setDeleteNodeDialog(false)
        if (refreshData) {
            getData([])
        }
    }

    const showEditTaintsModal = (): void => {
        setShowEditTaints(true)
    }

    const hideEditTaintsModal = (refreshData?: boolean): void => {
        setShowEditTaints(false)
        if (refreshData) {
            getData([])
        }
    }

    if (errorResponseCode) {
        return (
            <ErrorScreenManager
                code={errorResponseCode}
                subtitle={errorResponseCode == 403 ? unauthorizedInfoText(SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) : ''}
            />
        )
    }

    return (
        <div className="bg__primary node-data-container flex-grow-1 dc__overflow-hidden flexbox-col">
            {loader ? (
                <Progressing pageLoader size={32} />
            ) : (
                <>
                    {renderNodeDetailsTabs()}
                    {renderTabContent()}
                    {showCordonNodeDialog && (
                        <CordonNodeModal
                            name={node}
                            version={nodeDetail.version}
                            kind={nodeDetail.kind}
                            unschedulable={nodeDetail.unschedulable}
                            closePopup={hideCordonNodeModal}
                        />
                    )}
                    {showDrainNodeDialog && (
                        <DrainNodeModal
                            name={node}
                            version={nodeDetail.version}
                            kind={nodeDetail.kind}
                            closePopup={hideDrainNodeModal}
                        />
                    )}
                    {showDeleteNodeDialog && (
                        <DeleteNodeModal
                            name={node}
                            version={nodeDetail.version}
                            kind={nodeDetail.kind}
                            closePopup={hideDeleteNodeModal}
                            handleClearBulkSelection={noop}
                        />
                    )}
                    {showEditTaints && (
                        <EditTaintsModal
                            name={node}
                            version={nodeDetail.version}
                            kind={nodeDetail.kind}
                            taints={nodeDetail.taints}
                            closePopup={hideEditTaintsModal}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default NodeDetails
