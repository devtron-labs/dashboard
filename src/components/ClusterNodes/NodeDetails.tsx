import React, { useState, useEffect, useRef } from 'react'
import {
    BreadCrumb,
    ButtonWithLoader,
    copyToClipboard,
    handleUTCTime,
    Pagination,
    Progressing,
    showError,
    useBreadcrumb,
    ToastBodyWithButton,
} from '../common'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Cpu } from '../../assets/icons/ic-cpu.svg'
import { ReactComponent as Memory } from '../../assets/icons/ic-memory.svg'
import { ReactComponent as Storage } from '../../assets/icons/ic-storage.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import PageHeader from '../common/header/PageHeader'
import { useParams } from 'react-router'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import Tippy from '@tippyjs/react'
import { ReactComponent as Success } from '../../assets/icons/appstatus/healthy.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { getNodeCapacity, updateNodeManifest } from './clusterNodes.service'
import {
    NodeDetail,
    NodeDetailResponse,
    PodType,
    ResourceDetail,
    TEXT_COLOR_CLASS,
    UpdateNodeRequestBody,
} from './types'
import { toast } from 'react-toastify'
import { ReactComponent as Sort } from '../../assets/icons/ic-sort-arrow.svg'
import { OrderBy } from '../app/list/types'
import { MODES } from '../../config'
import * as jsonpatch from 'fast-json-patch'
import { applyPatch } from 'fast-json-patch'
import './clusterNodes.scss'
import { ServerErrors } from '../../modals/commonTypes'

export default function NodeDetails() {
    const [loader, setLoader] = useState(false)
    const [apiInProgress, setApiInProgress] = useState(false)
    const [isReviewState, setIsReviewStates] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [selectedSubTabIndex, setSelectedSubTabIndex] = useState(0)
    const [nodeDetail, setNodeDetail] = useState<NodeDetail>(null)
    const { clusterId, nodeName } = useParams<{ clusterId: string; nodeName: string }>()
    const [copied, setCopied] = useState(false)
    const [manifest, setManifest] = useState('')
    const [modifiedManifest, setModifiedManifest] = useState('')
    const [cpuData, setCpuData] = useState<ResourceDetail>(null)
    const [memoryData, setMemoryData] = useState<ResourceDetail>(null)
    const [sortedPodList, setSortedPodList] = useState<PodType[]>(null)
    const [podListOffset, setPodListOffset] = useState(0)
    const [sortByColumnName, setSortByColumnName] = useState<string>('name')
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const pageSize = 10
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [isShowWarning, setIsShowWarning] = useState(false)
    const [patchData, setPatchData] = useState<jsonpatch.Operation[]>(null)
    const toastId = useRef(null)

    const getData = (_patchdata: jsonpatch.Operation[]) => {
        setLoader(true)
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
                    if (_patchdata) {
                        setPatchData(_patchdata)
                        manifestData = applyPatch(manifestData, _patchdata).newDocument
                        setIsShowWarning(true)
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
        getData(patchData)
    }, [])

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

    const renderNodeDetailsTabs = (): JSX.Element => {
        return (
            <ul role="tablist" className="tab-list">
                <li
                    className="tab-list__tab pointer"
                    onClick={() => {
                        setSelectedTabIndex(0)
                    }}
                >
                    <div className={`mb-6 fs-13 tab-hover${selectedTabIndex == 0 ? ' fw-6 active' : ' fw-4'}`}>
                        Summary
                    </div>
                    {selectedTabIndex == 0 && <div className="node-details__active-tab" />}
                </li>
                <li
                    className="tab-list__tab pointer"
                    onClick={() => {
                        setSelectedTabIndex(1)
                    }}
                >
                    <div className={`mb-6 flexbox fs-13 tab-hover${selectedTabIndex == 1 ? ' fw-6 active' : ' fw-4'}`}>
                        <Edit className="icon-dim-16 mt-2 mr-5 edit-yaml-icon" />
                        YAML
                    </div>
                    {selectedTabIndex == 1 && <div className="node-details__active-tab" />}
                </li>
                <li
                    className="tab-list__tab pointer"
                    onClick={() => {
                        setSelectedTabIndex(2)
                    }}
                >
                    <div className={`mb-6 fs-13 tab-hover${selectedTabIndex == 2 ? ' fw-6 active' : ' fw-4'}`}>
                        Node conditions
                    </div>
                    {selectedTabIndex == 2 && <div className="node-details__active-tab" />}
                </li>
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
                    component: nodeName,
                    linked: false,
                },
            },
        },
        [clusterId, nodeName, nodeDetail],
    )

    const renderBreadcrumbs = (): JSX.Element => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const noDataInSubTab = (tabName: string): JSX.Element => {
        return (
            <div className="text-center no-data-tab">
                <Info className="no-data-icon" />
                <div className="cn-7 fs-13 fw-4">No {tabName}</div>
            </div>
        )
    }

    const renderKeyValueLabel = (key: string, value?: string): JSX.Element => {
        return (
            <div className="flexbox mb-8 hover-trigger position-rel">
                <div
                    className={`cn-9 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 ${
                        !value ? ' br-4' : ' left-radius-4 no-right-border'
                    }`}
                >
                    {key}
                </div>
                {value && (
                    <div className="bcn-7 cn-0 fw-4 fs-12 en-2 bw-1 pr-6 pl-6 pb-2 pt-2 right-radius-4 no-left-border">
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
                        className="ml-8 mt-5 pointer hover-only icon-dim-16"
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
            return <div>{nodeDetail.labels.map((label) => renderKeyValueLabel(label.key, label.value))}</div>
        }
    }

    const renderAnnotationTab = (): JSX.Element => {
        if (nodeDetail.annotations.length === 0) {
            return noDataInSubTab('Annotations')
        } else {
            return (
                <div>
                    {nodeDetail.annotations.map((annotation) => renderKeyValueLabel(annotation.key, annotation.value))}
                </div>
            )
        }
    }

    const renderWithCopy = (key: string): JSX.Element => {
        return (
            <div className="flexbox mb-8 hover-trigger position-rel">
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
                        className="ml-8 mt-5 pointer hover-only icon-dim-16"
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
                    {nodeDetail.taints.map((taint) => (
                        <div className="subtab-grid">
                            {renderKeyValueLabel(taint.key, taint.value)}
                            {renderWithCopy(taint['effect'])}
                        </div>
                    ))}
                </div>
            )
        }
    }

    const renderLabelAnnotationTaint = (): JSX.Element => {
        return (
            <div className="en-2 bw-1 br-4 bcn-0 mt-12">
                <ul role="tablist" className="tab-list border-bottom pr-20 pl-20 pt-12">
                    <li
                        className="tab-list__tab pointer"
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
                        className="tab-list__tab pointer"
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
                        className="tab-list__tab pointer"
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
                <div className="flexbox bcr-5 pt-12 pb-12 pr-10 pl-20 top-radius-4">
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
            (isCPUOverCommitted ? 1 : 0) + (nodeDetail.unschedulable ? 1 : 0) + (nodeDetail.taintCount > 0 ? 1 : 0)
        if (!issueCount) return null
        return (
            <div className="mb-12 en-2 bw-1 br-4 bcn-0">
                <div className="flexbox bcy-5 pt-12 pb-12 pr-10 pl-20 top-radius-4">
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
                    {nodeDetail.taintCount && (
                        <div>
                            <div className="fw-6 fs-13 cn-9">{nodeDetail.taintCount} taints applied</div>
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
            <div className="en-2 bw-1 br-4 bcn-0 position-sticky top-88">
                <div className="flexbox pt-12 pb-12 pr-10 pl-20 top-radius-4">
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
                <div className="resource-row border-bottom fw-6 fs-13 pt-8 pb-8 pr-20 pl-20 cn-7">
                    <div></div>
                    <div>Resource</div>
                    <div>Requests</div>
                    <div>Limits</div>
                    <div>Usage</div>
                    <div>Allocatable</div>
                    <div>Capacity</div>
                </div>
                {cpuData && (
                    <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
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
                    <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
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
                    <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-8 pb-8 pr-20 pl-20 cn-9">
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

    const renderPagination = (): JSX.Element => {
        return (
            nodeDetail.pods.length > pageSize && (
                <Pagination
                    size={nodeDetail.pods.length}
                    pageSize={pageSize}
                    offset={podListOffset}
                    changePage={(pageNo: number) => setPodListOffset(pageSize * (pageNo - 1))}
                    isPageSizeFix={true}
                />
            )
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
                      let firstValue = a[sortByColumnArr[0]][sortByColumnArr[1]] || 0
                      let secondValue = b[sortByColumnArr[0]][sortByColumnArr[1]] || 0
                      firstValue = Number(firstValue.slice(0, -1))
                      secondValue = Number(secondValue.slice(0, -1))
                      return _sortOrder === OrderBy.ASC ? firstValue - secondValue : secondValue - firstValue
                  }
                : (a, b) => {
                      return (_sortOrder === OrderBy.ASC && columnName !== 'createdAt') ||
                          (_sortOrder === OrderBy.DESC && columnName === 'createdAt')
                          ? a[columnName].localeCompare(b[columnName])
                          : b[columnName].localeCompare(a[columnName])
                  }
        setSortedPodList([...nodeDetail.pods].sort(comparatorMethod))
        setPodListOffset(0)
    }

    const renderPodHeaderCell = (
        columnName: string,
        sortingFieldName: string,
        columnType: string,
        className: string,
    ): JSX.Element => {
        return (
            <div
                className={`border-bottom fw-6 fs-13 cn-7 list-title h-36 pointer ${className} ${
                    sortByColumnName === sortingFieldName ? 'sort-by' : ''
                } ${sortOrder === OrderBy.DESC ? 'desc' : ''}`}
                onClick={() => {
                    handleSortClick(sortingFieldName, columnType)
                }}
            >
                <span className="inline-block ellipsis-right lh-20" style={{ maxWidth: 'calc(100% - 20px)' }}>
                    {columnName}
                </span>
                <Sort className="pointer icon-dim-14 position-rel sort-icon" />
            </div>
        )
    }

    const renderPodList = (): JSX.Element | null => {
        if (!sortedPodList) return null
        return (
            <div className="en-2 bw-1 br-4 bcn-0 mt-12 mb-20 pod-container">
                <div className="fw-6 fs-14 cn-9 pr-20 pl-20 pt-12">Pods</div>
                <div className="pods-grid">
                    {renderPodHeaderCell('Namespace', 'namespace', 'string', 'pt-8 pr-8 pb-8 pl-20')}
                    {renderPodHeaderCell('Pod', 'name', 'string', 'p-8')}
                    {renderPodHeaderCell('CPU Requests', 'cpu.requestPercentage', 'number', 'p-8')}
                    {renderPodHeaderCell('CPU Requests', 'cpu.limitPercentage', 'number', 'p-8')}
                    {renderPodHeaderCell('Memory Requests', 'memory.requestPercentage', 'number', 'p-8')}
                    {renderPodHeaderCell('Memory Requests', 'memory.limitPercentage', 'number', 'p-8')}
                    {renderPodHeaderCell('Age', 'createdAt', 'string', 'pt-8 pr-20 pb-8 pl-8')}
                    {sortedPodList.slice(podListOffset, podListOffset + pageSize).map((pod) => (
                        <>
                            <div className="border-bottom-n1 pt-8 pr-8 pb-8 pl-20 fw-4 fs-13 cn-9">{pod.namespace}</div>
                            <div className="hover-trigger position-rel flexbox border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                <>
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="top"
                                        content={pod.name}
                                        interactive={true}
                                    >
                                        <span
                                            className="inline-block ellipsis-right lh-20"
                                            style={{ maxWidth: 'calc(100% - 20px)' }}
                                        >
                                            {pod.name}
                                        </span>
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
                                            className="ml-5 mt-5 pointer hover-only icon-dim-14"
                                            onClick={() => {
                                                copyToClipboard(pod.name, () => {
                                                    setCopied(true)
                                                })
                                            }}
                                        />
                                    </Tippy>
                                </>
                            </div>
                            <div className="border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                {pod.cpu.requestPercentage || '-'}
                            </div>
                            <div className="border-bottom-n1 p-8 fw-4 fs-13 cn-9">{pod.cpu.limitPercentage || '-'}</div>
                            <div className="border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                {pod.memory.requestPercentage || '-'}
                            </div>
                            <div className="border-bottom-n1 p-8 fw-4 fs-13 cn-9">
                                {pod.memory.limitPercentage || '-'}
                            </div>
                            <div className="border-bottom-n1 pt-8 pr-20 pb-8 pl-8 fw-4 fs-13 cn-9">{pod.age}</div>
                        </>
                    ))}
                </div>
                {renderPagination()}
            </div>
        )
    }

    const renderSummary = (): JSX.Element | null => {
        if (!nodeDetail) return null
        return (
            <div className="node-details-container">
                <div className="ml-20 mr-20 mb-12 mt-16 pl-20 pr-20 pt-16 pb-16 bcn-0 br-4 en-2 bw-1 flexbox content-space">
                    <div className="fw-6">
                        <div className="fs-16 cn-9">{nodeDetail.name}</div>
                        <div className={`fs-13 ${TEXT_COLOR_CLASS[nodeDetail.status] || 'cn-7'}`}>
                            {nodeDetail.status}
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
            // const _patchData = jsonpatch.compare(nodeDetail.manifest, parsedManifest)
            // console.log(2, _patchData)
            // setPatchData(_patchData)
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
                        toastId.current = toast.info(updateToastBody, { autoClose: false, closeButton: false })
                    } else {
                        showError(error)
                    }

                    setApiInProgress(false)
                })
        } else {
            setIsReviewStates(true)
            // const _patchData = jsonpatch.compare(nodeDetail.manifest, YAML.parse(modifiedManifest))
            // console.log(1, _patchData)
            // setPatchData(_patchData)
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
                    {isReviewState && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <div className="h-32 lh-32 fs-12 fw-6 bcn-1 border-bottom flexbox w-100 cn-7">
                                <div className="border-right pl-10 w-49">Current node YAML </div>
                                <div className="pl-25 w-51 flexbox">
                                    <Edit className="icon-dim-16 mt-7 mr-5" />
                                    YAML (Editing)
                                </div>
                            </div>
                        </CodeEditor.Header>
                    )}
                    {isReviewState && isShowWarning && (
                        <CodeEditor.Warning
                            className="ellipsis-right"
                            text="Actual YAML has changed since you made the changes. Please check the diff carefully."
                        />
                    )}
                </CodeEditor>
                <div className="bcn-0 border-top p-12 text-right" style={{ height: '60px' }}>
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
                    <div className="condition-grid cn-7 fw-6 fs-13 border-bottom pt-8 pl-20 pb-8 pr-20">
                        <div>Type</div>
                        <div>Status</div>
                        <div>Message</div>
                    </div>
                    {nodeDetail.conditions.map((condition) => (
                        <div className="condition-grid cn-9 fw-4 fs-13 border-bottom-n1 pt-12 pl-20 pb-12 pr-20">
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

    const renderTabs = (): JSX.Element => {
        if (selectedTabIndex === 1) {
            return renderYAMLEditor()
        } else if (selectedTabIndex === 2) {
            return renderConditions()
        } else {
            return renderSummary()
        }
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    return (
        <>
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderNodeDetailsTabs}
            />
            {renderTabs()}
        </>
    )
}
