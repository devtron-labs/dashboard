import React, { useState, useEffect, useRef } from 'react'
import { ButtonWithLoader, copyToClipboard, handleUTCTime, ToastBodyWithButton, filterImageList } from '../common'
import {
    showError,
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    toastAccessDenied,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Cpu } from '../../assets/icons/ic-cpu.svg'
import { ReactComponent as Memory } from '../../assets/icons/ic-memory.svg'
import { ReactComponent as Storage } from '../../assets/icons/ic-storage.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as CordonIcon } from '../../assets/icons/ic-cordon.svg'
import { ReactComponent as UncordonIcon } from '../../assets/icons/ic-play-medium.svg'
import { ReactComponent as DrainIcon } from '../../assets/icons/ic-clean-brush.svg'
import { ReactComponent as EditTaintsIcon } from '../../assets/icons/ic-spraycan.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Success } from '../../assets/icons/appstatus/healthy.svg'
import PageHeader from '../common/header/PageHeader'
import { useParams, useLocation, useHistory } from 'react-router'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import Tippy from '@tippyjs/react'
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { getNodeCapacity, updateNodeManifest } from './clusterNodes.service'
import {
    ClusterListType,
    ImageList,
    NodeDetail,
    NodeDetailResponse,
    PodType,
    ResourceDetail,
    SelectGroupType,
    TEXT_COLOR_CLASS,
    UpdateNodeRequestBody,
} from './types'
import { toast } from 'react-toastify'
import { OrderBy } from '../app/list/types'
import { MODES } from '../../config'
import * as jsonpatch from 'fast-json-patch'
import { applyPatch } from 'fast-json-patch'
import './clusterNodes.scss'
import { ReactComponent as TerminalIcon } from '../../assets/icons/ic-terminal-fill.svg'
import ClusterTerminal from './ClusterTerminal'
import EditTaintsModal from './NodeActions/EditTaintsModal'
import { AUTO_SELECT, CLUSTER_NODE_ACTIONS_LABELS, NODE_DETAILS_TABS } from './constants'
import CordonNodeModal from './NodeActions/CordonNodeModal'
import DrainNodeModal from './NodeActions/DrainNodeModal'
import DeleteNodeModal from './NodeActions/DeleteNodeModal'
import { createTaintsList } from '../cluster/cluster.util'
import { K8S_EMPTY_GROUP } from '../ResourceBrowser/Constants'



export default function NodeDetails({ imageList, isSuperAdmin, namespaceList }: ClusterListType) {
    const { clusterId, nodeName } = useParams<{ clusterId: string; nodeName: string }>()
    const selectedNodeName: SelectGroupType = { label: '', options: [{ label: nodeName, value: nodeName }] }
    const nodeListRef = useRef([selectedNodeName])
    const [loader, setLoader] = useState(true)
    const [apiInProgress, setApiInProgress] = useState(false)
    const [isReviewState, setIsReviewStates] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [selectedSubTabIndex, setSelectedSubTabIndex] = useState(0)
    const [nodeDetail, setNodeDetail] = useState<NodeDetail>(null)
    const [copied, setCopied] = useState(false)
    const [modifiedManifest, setModifiedManifest] = useState('')
    const [cpuData, setCpuData] = useState<ResourceDetail>(null)
    const [memoryData, setMemoryData] = useState<ResourceDetail>(null)
    const [sortedPodList, setSortedPodList] = useState<PodType[]>(null)
    const [sortByColumnName, setSortByColumnName] = useState<string>('name')
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [isShowWarning, setIsShowWarning] = useState(false)
    const [patchData, setPatchData] = useState<jsonpatch.Operation[]>(null)
    const [nodeImageList, setNodeImageList] = useState<ImageList[]>([])
    const toastId = useRef(null)
    const [showAllLabel, setShowAllLabel] = useState(false)
    const [showAllAnnotations, setShowAllAnnotations] = useState(false)
    const [showAllTaints, setShowAllTaints] = useState(false)
    const [showCordonNodeDialog, setCordonNodeDialog] = useState(false)
    const [showDrainNodeDialog, setDrainNodeDialog] = useState(false)
    const [showDeleteNodeDialog, setDeleteNodeDialog] = useState(false)
    const [showEditTaints, setShowEditTaints] = useState(false)
    const isNodeAuto: boolean = nodeName === AUTO_SELECT.value
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const { push } = useHistory()

    const getData = (_patchdata: jsonpatch.Operation[]) => {
        getNodeCapacity(clusterId, nodeName)
            .then((response: NodeDetailResponse) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    setSortedPodList(response.result.pods.sort((a, b) => a['name'].localeCompare(b['name'])))
                    setNodeDetail(response.result)
                    const resourceList = response.result.resources
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
                    setModifiedManifest(YAML.stringify(manifestData))
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }

    useEffect(() => {
        nodeListRef.current = [selectedNodeName]
        if (nodeName !== AUTO_SELECT.value) {
            getData(patchData)
        }
    }, [nodeName])

    useEffect(() => {
        if (imageList?.length && nodeDetail?.k8sVersion) {
            setNodeImageList(filterImageList(imageList, nodeDetail.k8sVersion))
        }
    }, [imageList, nodeDetail?.k8sVersion])

    useEffect(() => {
        const _lastDataSyncTime = Date()
        setLastDataSyncTimeString('Last refreshed ' + handleUTCTime(_lastDataSyncTime, true))
        const interval = setInterval(() => {
            setLastDataSyncTimeString('Last refreshed ' + handleUTCTime(_lastDataSyncTime, true))
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    useEffect(() => {
        if (queryParams.has('tab')) {
            const tab = queryParams.get('tab').replace('-', ' ')
            if (tab === NODE_DETAILS_TABS.summary.toLowerCase()) {
                setSelectedTabIndex(0)
            } else if (tab === NODE_DETAILS_TABS.yaml.toLowerCase()) {
                setSelectedTabIndex(1)
            } else if (tab === NODE_DETAILS_TABS.nodeConditions.toLowerCase()) {
                setSelectedTabIndex(2)
            } else if (tab === NODE_DETAILS_TABS.debug.toLowerCase()) {
                setSelectedTabIndex(3)
            }
        }
    }, [location.search])

    const changeNodeTab = (e): void => {
        const _tabIndex = Number(e.currentTarget.dataset.tabIndex)
        if (nodeName !== AUTO_SELECT.value) {
            let _searchParam = '?tab='
            if (_tabIndex === 0) {
                _searchParam += NODE_DETAILS_TABS.summary.toLowerCase()
            } else if (_tabIndex === 1) {
                _searchParam += NODE_DETAILS_TABS.yaml.toLowerCase()
            } else if (_tabIndex === 2) {
                _searchParam += NODE_DETAILS_TABS.nodeConditions.toLowerCase().replace(' ', '-')
            } else if (_tabIndex === 3) {
                _searchParam += NODE_DETAILS_TABS.debug.toLowerCase()
            }
            push({
                pathname: location.pathname,
                search: _searchParam,
            })
        }
    }

    const renderNodeDetailsTabs = (): JSX.Element => {
        const cursorValue = isNodeAuto ? 'cursor-not-allowed' : 'cursor'
        return (
            <ul role="tablist" className="tab-list">
                <li className={`tab-list__tab ${cursorValue}`} data-tab-index="0" onClick={changeNodeTab}>
                    <div className={`mb-6 fs-13 tab-hover${selectedTabIndex == 0 ? ' fw-6 active' : ' fw-4'}`}>
                        {NODE_DETAILS_TABS.summary}
                    </div>
                    {selectedTabIndex == 0 && <div className="node-details__active-tab" />}
                </li>
                <li className={`tab-list__tab ${cursorValue}`} data-tab-index="1" onClick={changeNodeTab}>
                    <div className={`mb-6 flexbox fs-13 tab-hover${selectedTabIndex == 1 ? ' fw-6 active' : ' fw-4'}`}>
                        <Edit className="icon-dim-16 mt-2 mr-5 edit-yaml-icon" />
                        {NODE_DETAILS_TABS.yaml}
                    </div>
                    {selectedTabIndex == 1 && <div className="node-details__active-tab" />}
                </li>
                <li className={`tab-list__tab ${cursorValue}`} data-tab-index="2" onClick={changeNodeTab}>
                    <div className={`mb-6 fs-13 tab-hover${selectedTabIndex == 2 ? ' fw-6 active' : ' fw-4'}`}>
                        {NODE_DETAILS_TABS.nodeConditions}
                    </div>
                    {selectedTabIndex == 2 && <div className="node-details__active-tab" />}
                </li>
                {isSuperAdmin && (
                    <li className="tab-list__tab cursor" data-tab-index="3" onClick={changeNodeTab}>
                        <div
                            className={`mb-6 flexbox fs-13 tab-hover${
                                selectedTabIndex == 3 ? ' fw-6 active' : ' fw-4'
                            }`}
                            data-testid="node-details-terminal-tab"
                        >
                            <TerminalIcon className="icon-dim-16 mt-2 mr-5 terminal-icon" />
                            {NODE_DETAILS_TABS.debug}
                        </div>
                        {selectedTabIndex == 3 && <div className="node-details__active-tab" />}
                    </li>
                )}
            </ul>
        )
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                clusters: {
                    component: 'Clusters',
                    linked: true,
                },
                ':clusterId': {
                    component: nodeDetail?.clusterName,
                    linked: true,
                },
                ':nodeName': {
                    component: isNodeAuto ? 'Selecting node' : nodeName,
                    linked: false,
                },
            },
        },
        [clusterId, nodeName, nodeDetail],
    )

    const renderBreadcrumbs = (): JSX.Element => {
        return (
            <span className={isNodeAuto ? 'dc__loading-dots' : ''}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </span>
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
        return (
            <div className="flexbox mb-8 hover-trigger dc__position-rel">
                <div
                    className={`cn-9 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 ${
                        !value ? ' br-4' : ' dc__left-radius-4 dc__no-right-border'
                    }`}
                >
                    {key}
                </div>
                {value && (
                    <div className="bcn-7 cn-0 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 dc__right-radius-4 dc__no-left-border">
                        {value}
                    </div>
                )}

                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={copied ? 'Copied!' : 'Copy'}
                    trigger="mouseenter click"
                    onShow={(instance) => {
                        setCopied(false)
                    }}
                    interactive={true}
                >
                    <Clipboard
                        className="ml-8 mt-5 cursor hover-only icon-dim-16"
                        onClick={() => {
                            copyToClipboard(`${key}=${value || ''}`, () => {
                                setCopied(true)
                            })
                        }}
                    />
                </Tippy>
            </div>
        )
    }

    const renderLabelTab = (): JSX.Element => {
        if (nodeDetail.labels.length === 0) {
            return noDataInSubTab('Labels')
        } else {
            return (
                <>
                    {(showAllLabel ? nodeDetail.labels : nodeDetail.labels.slice(0, 10)).map((label) =>
                        renderKeyValueLabel(label.key, label.value),
                    )}
                    {nodeDetail.labels.length > 10 && renderShowAll(showAllLabel, setShowAllLabel)}
                </>
            )
        }
    }

    const renderAnnotationTab = (): JSX.Element => {
        if (nodeDetail.annotations.length === 0) {
            return noDataInSubTab('Annotations')
        } else {
            return (
                <>
                    {(showAllAnnotations ? nodeDetail.annotations : nodeDetail.annotations.slice(0, 10)).map(
                        (annotation) => renderKeyValueLabel(annotation.key, annotation.value),
                    )}
                    {nodeDetail.annotations.length > 10 && renderShowAll(showAllAnnotations, setShowAllAnnotations)}
                </>
            )
        }
    }

    const renderWithCopy = (key: string): JSX.Element => {
        return (
            <div className="flexbox mb-8 hover-trigger dc__position-rel">
                <div>{key}</div>
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={copied ? 'Copied!' : 'Copy'}
                    trigger="mouseenter click"
                    onShow={(instance) => {
                        setCopied(false)
                    }}
                    interactive={true}
                >
                    <Clipboard
                        className="ml-8 mt-5 cursor hover-only icon-dim-16"
                        onClick={() => {
                            copyToClipboard(key, () => {
                                setCopied(true)
                            })
                        }}
                    />
                </Tippy>
            </div>
        )
    }

    const renderTaintTab = (): JSX.Element => {
        if (!nodeDetail.taints?.length) {
            return noDataInSubTab('Taints')
        } else {
            return (
                <div>
                    <div className="subtab-grid mb-8 cn-7 fw-6 fs-13">
                        <div>Key|Value</div>
                        <div>Effect</div>
                    </div>
                    {(showAllTaints ? nodeDetail.taints : nodeDetail.taints.slice(0, 10)).map((taint) => (
                        <div className="subtab-grid">
                            {renderKeyValueLabel(taint.key, taint.value)}
                            {renderWithCopy(taint['effect'])}
                        </div>
                    ))}
                    {nodeDetail.taints.length > 10 && renderShowAll(showAllTaints, setShowAllTaints)}
                </div>
            )
        }
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
        return (
            <div className="en-2 bw-1 br-4 bcn-0 mt-12">
                <ul role="tablist" className="tab-list dc__border-bottom pr-20 pl-20 pt-12">
                    <li
                        className="tab-list__tab cursor"
                        onClick={() => {
                            setSelectedSubTabIndex(0)
                        }}
                    >
                        <div className={`mb-6 fs-13${selectedSubTabIndex == 0 ? ' fw-6 cb-5' : ' fw-4'}`}>
                            Labels ({nodeDetail.labels.length})
                        </div>
                        {selectedSubTabIndex == 0 && <div className="node-details__active-tab" />}
                    </li>
                    <li
                        className="tab-list__tab cursor"
                        onClick={() => {
                            setSelectedSubTabIndex(1)
                        }}
                    >
                        <div className={`mb-6 fs-13${selectedSubTabIndex == 1 ? ' fw-6 cb-5' : ' fw-4'}`}>
                            Annotation ({nodeDetail.annotations.length})
                        </div>
                        {selectedSubTabIndex == 1 && <div className="node-details__active-tab" />}
                    </li>
                    <li
                        className="tab-list__tab cursor"
                        onClick={() => {
                            setSelectedSubTabIndex(2)
                        }}
                    >
                        <div className={`mb-6 fs-13${selectedSubTabIndex == 2 ? ' fw-6 cb-5' : ' fw-4'}`}>
                            Taints ({nodeDetail.taints?.length || 0})
                        </div>
                        {selectedSubTabIndex == 2 && <div className="node-details__active-tab" />}
                    </li>
                </ul>
                <div className=" pr-20 pl-20 pt-12 pb-12">
                    {selectedSubTabIndex == 0 && renderLabelTab()}
                    {selectedSubTabIndex == 1 && renderAnnotationTab()}
                    {selectedSubTabIndex == 2 && renderTaintTab()}
                </div>
            </div>
        )
    }
    const renderErrorOverviewCard = (): JSX.Element | null => {
        const nodeErrorKeys = Object.keys(nodeDetail.errors)
        if (!nodeErrorKeys.length) return null
        return (
            <div className="mb-12 en-2 bw-1 br-4 bcn-0">
                <div className="flexbox bcr-5 pt-12 pb-12 pr-10 pl-20 dc__top-radius-4">
                    <Error className="error-icon-white mt-2 mb-2 mr-8 icon-dim-18" />
                    <span className="fw-6 fs-14 cn-0">
                        {`${nodeErrorKeys.length} Error${nodeErrorKeys.length > 1 ? 's' : ''}`}
                    </span>
                </div>
                <div className="pt-12 pr-20 pl-20">
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
        const isCPUOverCommitted = Number(cpuData.usagePercentage?.slice(0, -1)) > 100
        const issueCount =
            (isCPUOverCommitted ? 1 : 0) + (nodeDetail.unschedulable ? 1 : 0) + (nodeDetail.taints?.length > 0 ? 1 : 0)
        if (!issueCount) return null
        return (
            <div className="mb-12 en-2 bw-1 br-4 bcn-0">
                <div className="flexbox bcy-5 pt-12 pb-12 pr-10 pl-20 dc__top-radius-4">
                    <AlertTriangle className="alert-icon-white mt-2 mb-2 mr-8 icon-dim-18" />
                    <span className="fw-6 fs-14 cn-9">
                        {`${issueCount} Probable issue${issueCount > 1 ? 's' : ''}`}
                    </span>
                </div>
                <div className="pt-12 pr-20 pl-20">
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
    const renderNodeOverviewCard = (): JSX.Element => {
        return (
            <div className="en-2 bw-1 br-4 bcn-0 dc__position-sticky  top-88">
                <div className="flexbox pt-12 pb-12 pr-10 pl-20 dc__top-radius-4">
                    <span className="fw-6 fs-14 cn-9">Node overview</span>
                </div>
                <div className="pr-20 pl-20">
                    <div>
                        <div className="fw-6 fs-13 cn-7">Name</div>
                        <p className="fw-4 fs-13 cn-9 mb-12">{nodeDetail.name}</p>
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
        return (
            <div className="en-2 bw-1 br-4 bcn-0">
                <div className="resource-row dc__border-bottom fw-6 fs-13 pt-8 pb-8 pr-20 pl-20 cn-7">
                    <div></div>
                    <div>Resource</div>
                    <div>Requests</div>
                    <div>Limits</div>
                    <div>Usage</div>
                    <div>Allocatable</div>
                    <div>Capacity</div>
                </div>
                {cpuData && (
                    <div className="resource-row dc__border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
                        <Cpu className="mt-2 mb-2 icon-dim-18" />
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
                        <Memory className="mt-2 mb-2 icon-dim-18" />
                        <div>{memoryData.name || '-'}</div>
                        <div>{memoryData.requestPercentage || '-'}</div>
                        <div>{memoryData.limitPercentage || '-'}</div>
                        <div>{memoryData.usagePercentage || '-'}</div>
                        <div>{memoryData.allocatable || '-'}</div>
                        <div>{memoryData.capacity || '-'}</div>
                    </div>
                )}
                {nodeDetail.resources.map((resource) => (
                    <div className="resource-row dc__border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
                        <Storage className="mt-2 mb-2 icon-dim-18" />
                        <div>{resource.name || '-'}</div>
                        <div>{resource.requestPercentage || '-'}</div>
                        <div>{resource.limitPercentage || '-'}</div>
                        <div>{resource.usagePercentage || '-'}</div>
                        <div>{resource.allocatable || '-'}</div>
                        <div>{resource.capacity || '-'}</div>
                    </div>
                ))}
            </div>
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
                      let firstValue = 0,
                          secondValue = 0
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
    const handleResourceClick=(e)=>{
        const {name}=e.currentTarget.dataset
        const _url=`/resource-browser/${clusterId}/all/pod/${K8S_EMPTY_GROUP}/${name}`
        window.open(_url,'_blank')
    }
    const renderPodHeaderCell = (
        columnName: string,
        sortingFieldName: string,
        columnType: string,
        className: string,
    ): JSX.Element => {
        return (
            <div
                className={`dc__border-bottom fw-6 fs-13 cn-7 list-title h-36 cursor ${className} ${
                    sortByColumnName === sortingFieldName ? 'sort-by' : ''
                } ${sortOrder === OrderBy.DESC ? 'desc' : ''}`}
                onClick={() => {
                    handleSortClick(sortingFieldName, columnType)
                }}
            >
                <Tippy className="default-tt" arrow={false} placement="top" content={columnName}>
                    <span
                        className="dc__inline-block dc__ellipsis-right lh-20"
                        style={{ maxWidth: 'calc(100% - 20px)' }}
                    >
                        {columnName}
                    </span>
                </Tippy>
                {sortByColumnName === sortingFieldName ? (
                    <span className={`sort-icon ${sortOrder == OrderBy.DESC ? 'desc' : '' } ml-4`}></span>
                ) : (
                    <span className="sort-column dc__opacity-0_5 ml-4"></span>)}
            </div>
        )
    }

    const renderPodList = (): JSX.Element | null => {
        if (!sortedPodList) return null
        return (
            <div className="pod-container">
                <div className="dc__position-sticky  pod-container-header">
                    <div className="en-2 bw-1 dc__top-radius-4 bcn-0 dc__no-bottom-border">
                        <div className="fw-6 fs-14 cn-9 pr-20 pl-20 pt-12">Pods</div>
                    </div>
                </div>
                <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bcn-0 mb-20">
                    <div className="pods-grid">
                        <header className="bcn-0">
                            {renderPodHeaderCell('Namespace', 'namespace', 'string', 'pt-8 pr-8 pb-8 pl-20')}
                            {renderPodHeaderCell('Pod', 'name', 'string', 'p-8')}
                            {renderPodHeaderCell('CPU Requests', 'cpu.requestPercentage', 'number', 'p-8')}
                            {renderPodHeaderCell('CPU Limit', 'cpu.limitPercentage', 'number', 'p-8')}
                            {renderPodHeaderCell('Mem Requests', 'memory.requestPercentage', 'number', 'p-8')}
                            {renderPodHeaderCell('Mem Limit', 'memory.limitPercentage', 'number', 'p-8')}
                            {renderPodHeaderCell('Age', 'createdAt', 'string', 'pt-8 pr-20 pb-8 pl-8')}
                        </header>
                        <main>
                            {sortedPodList.map((pod) => (
                                <div className="row-wrapper">
                                    <div className="dc__border-bottom-n1 pt-8 pr-8 pb-8 pl-20 fw-4 fs-13 cn-9">
                                        {pod.namespace}
                                    </div>
                                    <div className="hover-trigger dc__position-rel flexbox dc__border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                        <>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                                content={pod.name}
                                                interactive={true}
                                            >
                                                <a
                                                    className="dc__inline-block dc__ellipsis-right lh-20 cursor"
                                                    style={{ maxWidth: 'calc(100% - 20px)' }}
                                                    data-name={pod.name}
                                                    onClick={handleResourceClick}
                                                >
                                                    {pod.name}
                                                </a>
                                            </Tippy>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="bottom"
                                                content={copied ? 'Copied!' : 'Copy'}
                                                trigger="mouseenter click"
                                                onShow={(instance) => {
                                                    setCopied(false)
                                                }}
                                                interactive={true}
                                            >
                                                <Clipboard
                                                    className="ml-5 mt-5 cursor hover-only icon-dim-14"
                                                    onClick={() => {
                                                        copyToClipboard(pod.name, () => {
                                                            setCopied(true)
                                                        })
                                                    }}
                                                />
                                            </Tippy>
                                        </>
                                    </div>
                                    <div className="dc__border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                        {pod.cpu.requestPercentage || '-'}
                                    </div>
                                    <div className="dc__border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                        {pod.cpu.limitPercentage || '-'}
                                    </div>
                                    <div className="dc__border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                        {pod.memory.requestPercentage || '-'}
                                    </div>
                                    <div className="dc__border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                        {pod.memory.limitPercentage || '-'}
                                    </div>
                                    <div className="dc__border-bottom-n1 pt-8 pr-20 pb-8 pl-8 fw-4 fs-13 cn-9">
                                        {pod.age}
                                    </div>
                                </div>
                            ))}
                        </main>
                    </div>
                </div>
            </div>
        )
    }

    const renderSummary = (): JSX.Element | null => {
        if (!nodeDetail) return null
        return (
            <div className="node-details-container">
                <div className="ml-20 mr-20 mb-12 mt-16 pl-20 pr-20 pt-16 pb-16 bcn-0 br-4 en-2 bw-1 flexbox dc__content-space">
                    <div className="fw-6">
                        <div className="fs-16 cn-9">{nodeDetail.name}</div>
                        <div className="flex left mt-4">
                            <span className={`fs-13 ${TEXT_COLOR_CLASS[nodeDetail.status] || 'cn-7'}`}>
                                {nodeDetail.status}
                            </span>
                            <span className="cn-2 mr-16 ml-16">|</span>
                            <span className="flex left fw-6 cb-5 fs-13 cursor" onClick={showCordonNodeModal}>
                                {nodeDetail.unschedulable ? (
                                    <>
                                        <UncordonIcon className="icon-dim-16 mr-5 scb-5 dc__stroke-width-4" />
                                        {CLUSTER_NODE_ACTIONS_LABELS.uncordon}
                                    </>
                                ) : (
                                    <>
                                        <CordonIcon className="icon-dim-16 mr-5 scb-5" />
                                        {CLUSTER_NODE_ACTIONS_LABELS.cordon}
                                    </>
                                )}
                            </span>
                            <span className="flex left fw-6 cb-5 ml-16 fs-13 cursor" onClick={showDrainNodeModal}>
                                <DrainIcon className="icon-dim-16 mr-5 scb-5" />
                                {CLUSTER_NODE_ACTIONS_LABELS.drain}
                            </span>
                            <span className="flex left fw-6 cb-5 ml-16 fs-13 cursor" onClick={showEditTaintsModal}>
                                <EditTaintsIcon className="icon-dim-16 mr-5 scb-5" />
                                {CLUSTER_NODE_ACTIONS_LABELS.taints}
                            </span>
                            <span className="flex left fw-6 cr-5 ml-16 fs-13 cursor" onClick={showDeleteNodeModal}>
                                <DeleteIcon className="icon-dim-16 mr-5 scr-5" />
                                {CLUSTER_NODE_ACTIONS_LABELS.delete}
                            </span>
                        </div>
                    </div>
                    <div className="fs-13">
                        {lastDataSyncTimeString && (
                            <span>
                                {lastDataSyncTimeString}
                                <button
                                    className="btn btn-link p-0 fw-6 cb-5 ml-5 fs-13"
                                    onClick={() => getData(patchData)}
                                >
                                    Refresh
                                </button>
                            </span>
                        )}
                    </div>
                </div>
                <div className="ml-20 mr-20 mt-12 node-details-grid">
                    <div className="fw-6 fs-16 cn-9">
                        {renderErrorOverviewCard()}
                        {renderProbableIssuesOverviewCard()}
                        {renderNodeOverviewCard()}
                    </div>
                    <div>
                        {renderResourceList()}
                        {renderLabelAnnotationTaint()}
                        {renderPodList()}
                    </div>
                </div>
            </div>
        )
    }

    const cancelYAMLEdit = (): void => {
        setIsReviewStates(false)
        setModifiedManifest(YAML.stringify(nodeDetail.manifest))
    }

    const handleEditorValueChange = (codeEditorData: string): void => {
        setModifiedManifest(codeEditorData)
    }

    const reloadDataAndHideToast = (): void => {
        setNodeDetail(null)
        const _patchData = jsonpatch.compare(nodeDetail.manifest, YAML.parse(modifiedManifest))
        getData(_patchData)
        toast.dismiss(toastId.current)
    }

    const saveYAML = (): void => {
        if (isReviewState) {
            const parsedManifest = YAML.parse(modifiedManifest)
            const requestData: UpdateNodeRequestBody = {
                clusterId: +clusterId,
                name: nodeName,
                manifestPatch: JSON.stringify(parsedManifest),
                version: nodeDetail.version,
                kind: nodeDetail.kind,
            }
            setApiInProgress(true)
            updateNodeManifest(clusterId, nodeName, requestData)
                .then((response: NodeDetailResponse) => {
                    setApiInProgress(false)
                    if (response.result) {
                        toast.success('Node updated')
                        setIsReviewStates(false)
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
                        const updateToastBody = (
                            <ToastBodyWithButton
                                onClick={reloadDataAndHideToast}
                                title="Cannot apply changes as node yaml has changed"
                                subtitle="Please apply your changes to the latest version and try again."
                                buttonText="Show latest YAML"
                            />
                        )
                        if (toast.isActive(toastId.current)) {
                            toast.update(toastId.current, { render: updateToastBody })
                        } else {
                            toastId.current = toast.info(updateToastBody, { autoClose: false, closeButton: false })
                        }
                    } else {
                        showError(error)
                    }

                    setApiInProgress(false)
                })
        } else {
            setIsReviewStates(true)
        }
    }

    const renderYAMLEditor = (): JSX.Element => {
        return (
            <div className="node-details-container">
                <CodeEditor
                    value={modifiedManifest}
                    defaultValue={(nodeDetail?.manifest && YAML.stringify(nodeDetail.manifest)) || ''}
                    height={
                        isReviewState ? `calc( 100vh - ${isShowWarning ? '203px' : '170px'})` : 'calc( 100vh - 137px)'
                    }
                    diffView={isReviewState}
                    onChange={handleEditorValueChange}
                    mode={MODES.YAML}
                    noParsing
                >
                    {isReviewState && isShowWarning && (
                        <CodeEditor.Warning
                            className="dc__ellipsis-right"
                            text="Actual YAML has changed since you made the changes. Please check the diff carefully."
                        />
                    )}
                    {isReviewState && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <div className="h-32 lh-32 fs-12 fw-6 bcn-1 dc__border-bottom flexbox w-100 cn-7">
                                <div className="dc__border-right pl-10 w-49">Current node YAML </div>
                                <div className="pl-25 w-51 flexbox">
                                    <Edit className="icon-dim-16 mt-7 mr-5" />
                                    YAML (Editing)
                                </div>
                            </div>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
                <div className="bcn-0 dc__border-top p-12 text-right" style={{ height: '60px' }}>
                    {isReviewState && (
                        <button type="button" className="cta cta--workflow cancel mr-12" onClick={cancelYAMLEdit}>
                            Cancel
                        </button>
                    )}
                    <ButtonWithLoader
                        rootClassName="cta cta--workflow"
                        onClick={saveYAML}
                        isLoading={apiInProgress}
                        loaderColor="white"
                    >
                        {isReviewState ? 'Update node' : 'Review changes'}
                    </ButtonWithLoader>
                </div>
            </div>
        )
    }

    const renderConditions = (): JSX.Element => {
        return (
            <div className="node-details-container">
                <div className="ml-20 mr-20 mb-12 mt-16 bcn-0 br-8 en-2 bw-1">
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
    }

    const renderTerminal = () => {
        return (
            <ClusterTerminal
                clusterId={Number(clusterId)}
                nodeGroups={nodeListRef.current}
                clusterImageList={nodeImageList}
                isNodeDetailsPage={true}
                namespaceList={namespaceList[nodeDetail.clusterName]}
                taints={createTaintsList(
                    [{ nodeName: nodeName, nodeGroup: '', taints: nodeDetail.taints }],
                    'nodeName',
                )}
            />
        )
    }

    const renderTabs = (): JSX.Element => {
        if (selectedTabIndex === 1) {
            return renderYAMLEditor()
        } else if (selectedTabIndex === 2) {
            return renderConditions()
        } else if (selectedTabIndex === 3) {
            return renderTerminal()
        } else {
            return renderSummary()
        }
    }

    const isAuthorized = (): boolean => {
        if (!isSuperAdmin) {
            toastAccessDenied()
            return false
        }
        return true
    }

    const showCordonNodeModal = (): void => {
        if (isAuthorized()) {
            setCordonNodeDialog(true)
        }
    }

    const hideCordonNodeModal = (refreshData?: boolean): void => {
        setCordonNodeDialog(false)
        if (refreshData) {
            getData([])
        }
    }

    const showDrainNodeModal = (): void => {
        if (isAuthorized()) {
            setDrainNodeDialog(true)
        }
    }

    const hideDrainNodeModal = (refreshData?: boolean): void => {
        setDrainNodeDialog(false)
        if (refreshData) {
            getData([])
        }
    }

    const showDeleteNodeModal = (): void => {
        if (isAuthorized()) {
            setDeleteNodeDialog(true)
        }
    }

    const hideDeleteNodeModal = (refreshData?: boolean): void => {
        setDeleteNodeDialog(false)
        if (refreshData) {
            getData([])
        }
    }

    const showEditTaintsModal = (): void => {
        if (isAuthorized()) {
            setShowEditTaints(true)
        }
    }

    const hideEditTaintsModal = (refreshData?: boolean): void => {
        setShowEditTaints(false)
        if (refreshData) {
            getData([])
        }
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    return (
        <div>
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderNodeDetailsTabs}
            />
            {renderTabs()}

            {showCordonNodeDialog && (
                <CordonNodeModal
                    name={nodeName}
                    version={nodeDetail.version}
                    kind={nodeDetail.kind}
                    unschedulable={nodeDetail.unschedulable}
                    closePopup={hideCordonNodeModal}
                />
            )}
            {showDrainNodeDialog && (
                <DrainNodeModal
                    name={nodeName}
                    version={nodeDetail.version}
                    kind={nodeDetail.kind}
                    closePopup={hideDrainNodeModal}
                />
            )}
            {showDeleteNodeDialog && (
                <DeleteNodeModal
                    name={nodeName}
                    version={nodeDetail.version}
                    kind={nodeDetail.kind}
                    closePopup={hideDeleteNodeModal}
                />
            )}
            {showEditTaints && (
                <EditTaintsModal
                    name={nodeName}
                    version={nodeDetail.version}
                    kind={nodeDetail.kind}
                    taints={nodeDetail.taints}
                    closePopup={hideEditTaintsModal}
                />
            )}
        </div>
    )
}
