import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useRouteMatch, useParams, useHistory } from 'react-router-dom'
import {
    getClusterCapacity,
    getClusterListMin,
    getClusterNote,
    getNodeList,
    patchClusterNote,
} from './clusterNodes.service'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { handleUTCTime, Pagination, filterImageList, createGroupSelectList } from '../common'
import {
    showError,
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    ConditionalWrap,
    ErrorScreenManager,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    ClusterCapacityType,
    ColumnMetadataType,
    TEXT_COLOR_CLASS,
    ERROR_TYPE,
    ClusterListType,
    NodeDetail,
    ImageList,
} from './types'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Sort } from '../../assets/icons/ic-sort-arrow.svg'
import { ReactComponent as DescriptionIcon } from '../../assets/icons/ic-note.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import PageHeader from '../common/header/PageHeader'
import ReactSelect, { MultiValue } from 'react-select'
import { appSelectorStyle, DropdownIndicator } from '../AppSelector/AppSelectorUtil'
import { OptionType } from '../app/types'
import NodeListSearchFilter from './NodeListSearchFilter'
import { OrderBy } from '../app/list/types'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import Tippy from '@tippyjs/react'
import ClusterTerminal from './ClusterTerminal'
import { CLUSTER_DESCRIPTION_UPDATE_MSG, COLUMN_METADATA, NODE_SEARCH_TEXT, defaultClusterNote } from './constants'
import NodeActionsMenu from './NodeActions/NodeActionsMenu'
import './clusterNodes.scss'
import { ReactComponent as TerminalIcon } from '../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as CloudIcon } from '../../assets/icons/ic-cloud.svg'
import { ReactComponent as SyncIcon } from '../../assets/icons/ic-arrows_clockwise.svg'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import { toast } from 'react-toastify'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'

export default function NodeList({ imageList, isSuperAdmin, namespaceList }: ClusterListType) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [clusterDetailsLoader, setClusterDetailsLoader] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [clusterAboutLoader, setClusterAboutLoader] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [clusterCapacityData, setClusterCapacityData] = useState<ClusterCapacityType>(null)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [collapsedErrorSection, setCollapsedErrorSection] = useState<boolean>(true)
    const { clusterId } = useParams<{ clusterId: string }>()
    const [clusterList, setClusterList] = useState<OptionType[]>([])
    const [selectedCluster, setSelectedCluster] = useState<OptionType>({
        label: '',
        value: '',
    })
    const defaultVersion = { label: 'K8s version: Any', value: 'K8s version: Any' }
    const [clusterErrorTitle, setClusterErrorTitle] = useState('')
    const [clusterErrorList, setClusterErrorList] = useState<
        { errorText: string; errorType: ERROR_TYPE; filterText: string[] }[]
    >([])
    const [flattenNodeList, setFlattenNodeList] = useState<object[]>([])
    const [filteredFlattenNodeList, setFilteredFlattenNodeList] = useState<object[]>([])
    const [searchedTextMap, setSearchedTextMap] = useState<Map<string, string>>(new Map())
    const [selectedVersion, setSelectedVersion] = useState<OptionType>(defaultVersion)
    const [selectedSearchTextType, setSelectedSearchTextType] = useState<string>('')
    const [sortByColumn, setSortByColumn] = useState<ColumnMetadataType>(COLUMN_METADATA[0])
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const [noResults, setNoResults] = useState(false)
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<ColumnMetadataType>>([])
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)
    const [nodeListOffset, setNodeListOffset] = useState(0)
    const [showTerminal, setTerminal] = useState<boolean>(false)
    const clusterName: string = filteredFlattenNodeList[0]?.['clusterName'] || ''
    const [nodeImageList, setNodeImageList] = useState<ImageList[]>([])
    const [selectedNode, setSelectedNode] = useState<string>()
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [isEditDescriptionView, setEditDescriptionView] = useState<boolean>(true)
    const reactMdeRef = useRef(null)
    const [descriptionText, setDescriptionText] = useState<string>(defaultClusterNote)
    const [descriptionUpdatedBy, setDescriptionUpdatedBy] = useState<string>(defaultClusterNote)
    const [descriptionUpdatedOn, setDescriptionUpdatedOn] = useState<string>('')
    const [modifiedDescriptionText, setModifiedDescriptionText] = useState<string>('')
    const [clusterCreatedOn, setClusterCreatedOn] = useState<string>('')
    const [clusterCreatedBy, setClusterCreatedBy] = useState<string>('')
    const [clusterDetailsName, setClusterDetailsName] = useState<string>('')
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write')
    const pageSize = 15

    useEffect(() => {
        if (appliedColumns.length > 0) {
            /*
          116 is standard with of every column for calculations
          65 is width of left nav
          180 is the diff of node column
          80 is the diff of status column
          */

            const appliedColumnDerivedWidth = appliedColumns.length * 116 + 65 + 180 + 80
            const windowWidth = window.innerWidth
            let clientWidth = 0
            setFixedNodeNameColumn(windowWidth < clientWidth || windowWidth < appliedColumnDerivedWidth)
        }
    }, [appliedColumns])

    useEffect(() => {
        if (filteredFlattenNodeList && imageList && namespaceList) {
            handleUrlChange(filteredFlattenNodeList)
        }
    }, [filteredFlattenNodeList, imageList, namespaceList])

    const getUpdatedAppliedColumn = () => {
        let isMissingColumn = false // intialized this to check if sortingFieldName is missing
        let appliedColumnsFromLocalStorage
        const sortableColumnMap = new Map<string, ColumnMetadataType>([])
        const _defaultColumns = []

        for (const metaData of COLUMN_METADATA) {
            if (metaData.isDefault) {
                _defaultColumns.push(metaData)
            }

            if (metaData.isSortingAllowed) {
                sortableColumnMap.set(metaData.value, metaData)
            }
        }

        if (typeof Storage !== 'undefined') {
            if (!localStorage.appliedColumns) {
                localStorage.appliedColumns = JSON.stringify(_defaultColumns) // in case of no appliedColumns add COLUMN_METADATA as it is in the storage
            } else {
                try {
                    appliedColumnsFromLocalStorage = JSON.parse(localStorage.appliedColumns)
                    for (const _updatedLocalMetaData of appliedColumnsFromLocalStorage as ColumnMetadataType[]) {
                        if (_updatedLocalMetaData.isSortingAllowed && !_updatedLocalMetaData.sortingFieldName) {
                            _updatedLocalMetaData.sortingFieldName = sortableColumnMap.get(
                                _updatedLocalMetaData.value,
                            ).sortingFieldName //updating column meta data when sortingFieldName is missing
                            isMissingColumn = true
                        }
                    }
                    if (isMissingColumn) {
                        localStorage.appliedColumns = JSON.stringify(appliedColumnsFromLocalStorage)
                    }
                } catch (error) {}
            }
        }
        setAppliedColumns(appliedColumnsFromLocalStorage || _defaultColumns)
    }

    useEffect(() => {
        getUpdatedAppliedColumn()
    }, [])

    const flattenObject = (ob: Object): Object => {
        let toReturn = {}
        for (let i in ob) {
            if (!ob.hasOwnProperty(i)) continue
            const currentElement = ob[i]
            if (typeof currentElement == 'object' && currentElement !== null && !Array.isArray(currentElement)) {
                var flatObject = flattenObject(currentElement)
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue

                    toReturn[i + '.' + x] = flatObject[x]
                }
            } else {
                toReturn[i] = currentElement
            }
        }
        return toReturn
    }

    const getNodeListData = (): void => {
        setClusterDetailsLoader(true)
        setErrorResponseCode(null)
        Promise.all([getNodeList(clusterId), getClusterCapacity(clusterId)])
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response[0].result) {
                    const _flattenNodeList = response[0].result.map((data) => {
                        const _flattenNodeData = flattenObject(data)
                        if (data['errors']) {
                            _flattenNodeData['errorCount'] = Object.keys(data['errors']).length
                        }
                        if (data['taints']) {
                            _flattenNodeData['taintCount'] = Object.keys(data['taints']).length
                        }
                        return _flattenNodeData
                    })
                    setFlattenNodeList(_flattenNodeList)
                }
                if (response[1].result) {
                    setClusterCapacityData(response[1].result)
                    let _errorTitle = '',
                        _errorList = [],
                        _nodeErrors = Object.keys(response[1].result.nodeErrors || {})
                    const _nodeK8sVersions = response[1].result.nodeK8sVersions
                    if (_nodeK8sVersions.length > 1) {
                        let diffType = '',
                            majorVersion,
                            minorVersion
                        for (let index = 0; index < _nodeK8sVersions.length; index++) {
                            const elementArr = _nodeK8sVersions[index].split('.')
                            if (!majorVersion) {
                                majorVersion = elementArr[0]
                            }
                            if (!minorVersion) {
                                minorVersion = elementArr[1]
                            }
                            if (majorVersion !== elementArr[0]) {
                                diffType = 'Major'
                                break
                            } else if (diffType !== 'Minor' && minorVersion !== elementArr[1]) {
                                diffType = 'Minor'
                            }
                        }
                        if (diffType !== '') {
                            _errorTitle = 'Version diff'
                            _errorList.push({
                                errorText: `${diffType} version diff identified among nodes. Current versions `,
                                errorType: ERROR_TYPE.VERSION_ERROR,
                                filterText: _nodeK8sVersions,
                            })
                        }
                    }

                    if (_nodeErrors.length > 0) {
                        _errorTitle += (_errorTitle ? ', ' : '') + _nodeErrors.join(', ')
                        for (let i = 0; i < _nodeErrors.length; i++) {
                            const _errorLength = response[1].result.nodeErrors[_nodeErrors[i]].length
                            _errorList.push({
                                errorText: `${_nodeErrors[i]} on ${
                                    _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                                }`,
                                errorType: ERROR_TYPE.OTHER,
                                filterText: response[1].result.nodeErrors[_nodeErrors[i]],
                            })
                        }
                    }
                    setClusterErrorTitle(_errorTitle)
                    setClusterErrorList(_errorList)
                }
                setClusterDetailsLoader(false)
            })
            .catch((error) => {
                showError(error)
                setErrorResponseCode(error.code)
                setClusterDetailsLoader(false)
            })
    }

    const getClusterAbout = (): void => {
        setClusterAboutLoader(true)
        setErrorResponseCode(null)
        getClusterNote(clusterId)
            .then((response) => {
                if (response.result) {
                    let _moment: moment.Moment
                    let _date: string
                    if (response.result.description && response.result.updated_by && response.result.updated_on) {
                        setDescriptionText(response.result.description)
                        setModifiedDescriptionText(response.result.description)
                        setDescriptionUpdatedBy(response.result.updated_by)
                        _moment = moment(response.result.updated_on, 'YYYY-MM-DDTHH:mm:ssZ')
                        _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.updated_on
                        setDescriptionUpdatedOn(_date)
                    } else {
                        setDescriptionText(defaultClusterNote)
                        setModifiedDescriptionText(defaultClusterNote)
                        setDescriptionUpdatedBy('')
                        setDescriptionUpdatedOn('')
                    }
                    _moment = moment(response.result.cluster_created_on, 'YYYY-MM-DDTHH:mm:ssZ')
                    _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.cluster_created_on
                    setClusterCreatedOn(_date)
                    setClusterCreatedBy(response.result.cluster_created_by)
                    setClusterDetailsName(response.result.cluster_name)
                }
                setClusterAboutLoader(false)
            })
            .catch((error) => {
                showError(error)
                setErrorResponseCode(error.code)
                setClusterAboutLoader(false)
            })
    }

    const updateClusterAbout = (): void => {
        const requestPayload = {
            cluster_id: Number(clusterId),
            description: modifiedDescriptionText,
        }
        setClusterAboutLoader(true)
        patchClusterNote(requestPayload)
            .then((response) => {
                if (response.result) {
                    setDescriptionText(response.result.description)
                    setDescriptionUpdatedBy(response.result.updated_by)
                    let _moment = moment(response.result.updated_on, 'YYYY-MM-DDTHH:mm:ssZ')
                    const _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.updated_on
                    setDescriptionUpdatedOn(_date)
                    setModifiedDescriptionText(response.result.description)
                    toast.success(CLUSTER_DESCRIPTION_UPDATE_MSG)
                    setEditDescriptionView(true)
                }
                setClusterAboutLoader(false)
            })
            .catch((error) => {
                showError(error)
                setClusterAboutLoader(false)
            })
    }

    useEffect(() => {
        if (selectedTabIndex == 0) {
            getClusterAbout()
        }
        if (selectedTabIndex == 1) {
            getNodeListData()
        }
    }, [clusterId, selectedTabIndex])

    useEffect(() => {
        getClusterListMin()
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    const optionList = response.result
                        .filter((cluster) => !cluster.errorInNodeListing)
                        .map((cluster) => {
                            const _clusterId = cluster.id?.toString()
                            if (_clusterId === clusterId) {
                                setSelectedCluster({
                                    label: cluster.name,
                                    value: _clusterId,
                                })
                            }
                            return {
                                label: cluster.name,
                                value: _clusterId,
                            }
                        })
                    setClusterList(optionList)
                }
            })
            .catch((error) => {
                showError(error)
            })
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

    const changeNodeTab = (e): void => {
        const _tabIndex = Number(e.currentTarget.dataset.tabIndex)
        if (_tabIndex === 0) {
            setSelectedTabIndex(0)
        } else if (_tabIndex === 1) {
            setSelectedTabIndex(1)
        }
    }

    const handleUrlChange = (sortedResult) => {
        const queryParams = new URLSearchParams(location.search)
        const selectedNode = sortedResult.find((item) => item.name === queryParams.get('node'))
        if (selectedNode) {
            openTerminal(selectedNode)
        }
    }

    const handleFilterChanges = (): void => {
        let _flattenNodeList = []
        for (let index = 0; index < flattenNodeList.length; index++) {
            const element = flattenNodeList[index]
            if (selectedVersion.value !== defaultVersion.value && element['k8sVersion'] !== selectedVersion.value) {
                continue
            }
            if (selectedSearchTextType === NODE_SEARCH_TEXT.NAME && searchedTextMap.size > 0) {
                let matchFound = false
                for (const [key] of searchedTextMap.entries()) {
                    if (element[NODE_SEARCH_TEXT.NAME].indexOf(key) >= 0) {
                        matchFound = true
                        break
                    }
                }
                if (!matchFound) {
                    continue
                }
            } else if (selectedSearchTextType === NODE_SEARCH_TEXT.LABEL) {
                let matchedLabelCount = 0
                for (let i = 0; i < element[NODE_SEARCH_TEXT.LABELS]?.length; i++) {
                    const currentLabel = element[NODE_SEARCH_TEXT.LABELS][i]
                    const matchedLabel = searchedTextMap.get(currentLabel.key)
                    if (matchedLabel === undefined || (matchedLabel !== null && currentLabel.value !== matchedLabel)) {
                        continue
                    }
                    matchedLabelCount++
                }
                if (searchedTextMap.size !== matchedLabelCount) {
                    continue
                }
            } else if (selectedSearchTextType === NODE_SEARCH_TEXT.NODE_GROUP) {
                let matchFound = false
                for (const [key] of searchedTextMap.entries()) {
                    if (element[NODE_SEARCH_TEXT.NODE_GROUP].indexOf(key) >= 0) {
                        matchFound = true
                        break
                    }
                }
                if (!matchFound) {
                    continue
                }
            }

            _flattenNodeList.push(element)
        }
        if (sortByColumn) {
            const comparatorMethod =
                sortByColumn.sortType === 'number' ? numericComparatorMethod : alphabeticalComparatorMethod
            _flattenNodeList.sort(comparatorMethod)
        }
        setFilteredFlattenNodeList(_flattenNodeList)
        setNoResults(_flattenNodeList.length === 0)
    }

    const numericComparatorMethod = (a, b) => {
        let firstValue = a[sortByColumn.sortingFieldName] || 0
        let secondValue = b[sortByColumn.sortingFieldName] || 0
        if (typeof firstValue === 'string' && firstValue.endsWith('%')) {
            firstValue = firstValue.slice(0, -1)
            secondValue = secondValue.slice(0, -1)
        }
        return sortOrder === OrderBy.ASC ? firstValue - secondValue : secondValue - firstValue
    }

    const alphabeticalComparatorMethod = (a, b) => {
        if (
            (sortOrder === OrderBy.ASC && sortByColumn.sortingFieldName !== 'createdAt') ||
            (sortOrder === OrderBy.DESC && sortByColumn.sortingFieldName === 'createdAt')
        ) {
            return a[sortByColumn.sortingFieldName].localeCompare(b[sortByColumn.sortingFieldName])
        } else {
            return b[sortByColumn.sortingFieldName].localeCompare(a[sortByColumn.sortingFieldName])
        }
    }

    const clearFilter = (): void => {
        setSearchText('')
        setSelectedSearchTextType('')
        setSearchedTextMap(new Map())
    }

    useEffect(() => {
        handleFilterChanges()
    }, [searchedTextMap, searchText, flattenNodeList, sortByColumn, sortOrder])

    const onClusterChange = (selectedValue: OptionType): void => {
        setSelectedCluster(selectedValue)
        history.push(match.url.replace(clusterId, selectedValue.value))
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                clusters: {
                    component: 'Clusters',
                    linked: true,
                },
                ':clusterId': {
                    component: (
                        <ReactSelect
                            options={clusterList}
                            onChange={onClusterChange}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                            }}
                            value={selectedCluster}
                            styles={appSelectorStyle}
                        />
                    ),
                    linked: false,
                },
            },
        },
        [clusterId, clusterList],
    )

    const renderBreadcrumbs = (): JSX.Element => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const handleSortClick = (column: ColumnMetadataType): void => {
        if (sortByColumn.label === column.label) {
            setSortOrder(sortOrder === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC)
        } else {
            setSortByColumn(column)
            setSortOrder(OrderBy.ASC)
        }
    }

    const setCustomFilter = (errorType: ERROR_TYPE, filterText: string): void => {
        if (errorType === ERROR_TYPE.VERSION_ERROR) {
            const selectedVersion = `K8s version: ${filterText}`
            setSelectedVersion({ label: selectedVersion, value: selectedVersion })
        } else {
            const _searchedTextMap = new Map()
            const searchedLabelArr = filterText.split(',')
            for (let index = 0; index < searchedLabelArr.length; index++) {
                const currentItem = searchedLabelArr[index].trim()
                _searchedTextMap.set(currentItem, true)
            }
            setSelectedSearchTextType('name')
            setSearchedTextMap(_searchedTextMap)
            setSearchText(filterText)
        }
    }

    const headerTerminalIcon = (): void => {
        openTerminalComponent({ name: 'autoSelectNode', k8sVersion: 'latest' })
    }

    const renderClusterError = (): JSX.Element => {
        if (clusterErrorList.length === 0) return
        return (
            <div
                className={`pl-20 pr-20 pt-12 bcr-1 dc__border-top dc__border-bottom ${
                    collapsedErrorSection ? ' pb-12 ' : ' pb-8'
                }`}
            >
                <div className={`flexbox dc__content-space ${collapsedErrorSection ? '' : ' mb-16'}`}>
                    <span
                        className="flexbox pointer"
                        onClick={(event) => {
                            setCollapsedErrorSection(!collapsedErrorSection)
                        }}
                    >
                        <Error className="mt-2 mb-2 mr-8 icon-dim-18" />
                        <span className="fw-6 fs-13 cn-9 mr-16">
                            {clusterErrorList.length === 1 ? '1 Error' : clusterErrorList.length + ' Errors in cluster'}
                        </span>
                        {collapsedErrorSection && <span className="fw-4 fs-13 cn-9">{clusterErrorTitle}</span>}
                    </span>
                    <Dropdown
                        className="pointer"
                        style={{ transform: collapsedErrorSection ? 'rotate(0)' : 'rotate(180deg)' }}
                        onClick={(event) => {
                            setCollapsedErrorSection(!collapsedErrorSection)
                        }}
                    />
                </div>
                {!collapsedErrorSection && (
                    <>
                        {clusterErrorList.map((error) => (
                            <div className="fw-4 fs-13 cn-9 mb-8">
                                {error.errorText}
                                {error.errorType === ERROR_TYPE.OTHER ? (
                                    <span
                                        className="cb-5 pointer"
                                        onClick={(event) => {
                                            setCustomFilter(error.errorType, error.filterText.join(','))
                                        }}
                                    >
                                        &nbsp; View nodes
                                    </span>
                                ) : (
                                    error.filterText.map((filter, index) => (
                                        <>
                                            &nbsp;
                                            {index > 0 && ', '}
                                            <span
                                                className="cb-5 pointer"
                                                onClick={(event) => {
                                                    setCustomFilter(error.errorType, filter)
                                                }}
                                            >
                                                {filter}
                                            </span>
                                        </>
                                    ))
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        )
    }

    const renderClusterSummary = (): JSX.Element => {
        return (
            <>
                <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 mt-16 mb-16 ml-20 mr-20 bcn-0 br-4 en-2 bw-1">
                    <div className="flex fw-6 fs-13">
                        <div className="fw-6 fs-14 cn-9 h-20 flex cg-5">
                            <CloudIcon className="icon-dim-16 mr-4" />
                            <span className="h-20 flex">Connected</span>
                        </div>
                        {isSuperAdmin && (
                            <>
                                <span className="dc__divider ml-12 h-16"></span>
                                <div className="flex left cursor pl-12 pr-12 cb-5" onClick={headerTerminalIcon}>
                                    <TerminalIcon className="icon-dim-16 mr-4 fcb-5" />
                                    <span className="h-20">Terminal</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="fs-13 h-20">
                        {lastDataSyncTimeString && (
                            <div className="flex h-20">
                                {lastDataSyncTimeString}
                                <button
                                    className="btn flex btn-link p-0 fw-6 cb-5 ml-5 fs-13"
                                    onClick={getNodeListData}
                                >
                                    <SyncIcon className="icon-dim-16" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flexbox dc__content-space pl-20 pr-20 pb-20">
                    <div className="flexbox dc__content-space mr-16 w-50 p-16 bcn-0 br-4 en-2 bw-1">
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Usage</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Capacity</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Requests</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.requestPercentage}
                            </div>
                        </div>
                        <div className="w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Limits</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.limitPercentage}
                            </div>
                        </div>
                    </div>

                    <div className="flexbox dc__content-space w-50 p-16 bcn-0 br-4 en-2 bw-1">
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Usage</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Capacity</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.capacity}
                            </div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Requests</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.requestPercentage}
                            </div>
                        </div>
                        <div className="w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Limits</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.limitPercentage}
                            </div>
                        </div>
                    </div>
                </div>
                {renderClusterError()}
            </>
        )
    }

    const renderNodeListHeader = (column: ColumnMetadataType): JSX.Element => {
        return (
            <div
                className={`h-36 list-title dc__inline-block mr-16 pt-8 pb-8 ${
                    column.label === 'Node'
                        ? `${
                              fixedNodeNameColumn ? 'bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
                          } w-280 pl-20`
                        : 'w-100px'
                } ${sortByColumn.value === column.value ? 'sort-by' : ''} ${sortOrder === OrderBy.DESC ? 'desc' : ''} ${
                    column.isSortingAllowed ? ' pointer' : ''
                } ${column.value === 'status' && 'w-180'}`}
                onClick={() => {
                    column.isSortingAllowed && handleSortClick(column)
                }}
            >
                <Tippy className="default-tt" arrow={false} placement="top" content={column.label}>
                    <span className="dc__inline-block dc__ellipsis-right mw-85px ">{column.label}</span>
                </Tippy>
                {column.isSortingAllowed && <Sort className="pointer icon-dim-14 dc__position-rel sort-icon" />}
            </div>
        )
    }

    const renderPercentageTippy = (nodeData: Object, column: ColumnMetadataType, children: any): JSX.Element => {
        return (
            <Tippy
                className="default-tt"
                arrow={false}
                placement="top"
                content={
                    <>
                        <span style={{ display: 'block' }}>
                            {column.value === 'cpu.usagePercentage'
                                ? `CPU Usage: ${nodeData['cpu.usage']}`
                                : `Memory Usage: ${nodeData['memory.usage']}`}
                        </span>
                        <span style={{ display: 'block' }}>
                            {column.value === 'cpu.usagePercentage'
                                ? `Allocatable CPU: ${nodeData['cpu.allocatable']}`
                                : `Allocatable Memory: ${nodeData['memory.allocatable']}`}
                        </span>
                    </>
                }
            >
                <div>{children}</div>
            </Tippy>
        )
    }

    const renderConditionalWrap = (column, nodeData) => {
        if (column.value === 'status' && nodeData['unschedulable']) {
            return (
                <span className="flex left">
                    <span>{nodeData[column.value]}</span>
                    <span className="dc__bullet mr-4 ml-4 mw-4 bcn-4"></span>
                    <span className="cr-5"> SchedulingDisabled</span>
                </span>
            )
        } else {
            if (column.value === 'k8sVersion') {
                return (
                    <Tippy className="default-tt" arrow={false} placement="top" content={nodeData[column.value]}>
                        <span className="dc__inline-block dc__ellipsis-right mw-85px ">{nodeData[column.value]}</span>
                    </Tippy>
                )
            } else {
                return nodeData[column.value]
            }
        }
    }

    const renderNodeRow = (column, nodeData) => {
        if (column.value === 'errorCount') {
            return (
                nodeData['errorCount'] > 0 && (
                    <>
                        <Error className="mr-3 icon-dim-16 dc__position-rel top-3" />
                        <span className="cr-5">{nodeData['errorCount'] || '-'}</span>
                    </>
                )
            )
        } else if (column.sortType === 'boolean') {
            return nodeData[column.value] + ''
        } else if (nodeData[column.value] !== undefined) {
            return (
                <ConditionalWrap
                    condition={column.value.indexOf('.usagePercentage') > 0}
                    wrap={(children) => renderPercentageTippy(nodeData, column, children)}
                >
                    {renderConditionalWrap(column, nodeData)}
                </ConditionalWrap>
            )
        } else {
            return '-'
        }
    }

    const renderNodeList = (nodeData: Object): JSX.Element => {
        return (
            <div
                key={nodeData['name']}
                className={`dc_width-max-content dc_min-w-100 fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox  dc__visible-hover ${
                    isSuperAdmin ? 'dc__visible-hover--parent' : ''
                }`}
            >
                {appliedColumns.map((column) => {
                    return column.label === 'Node' ? (
                        <div
                            className={`w-280 dc__inline-flex mr-16 pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? ' bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
                            }`}
                        >
                            <div className="w-100 flex left">
                                <div className="w-250 pr-4 dc__ellipsis-right">
                                    <NavLink to={`${match.url}/${nodeData[column.value]}`}>
                                        {nodeData[column.value]}
                                    </NavLink>
                                </div>
                                <NodeActionsMenu
                                    nodeData={nodeData as NodeDetail}
                                    openTerminal={openTerminalComponent}
                                    getNodeListData={getNodeListData}
                                    isSuperAdmin={isSuperAdmin}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`dc__inline-block dc__ellipsis-right list-title mr-16 pt-12 pb-12 ${
                                column.value === 'status'
                                    ? `w-180 ${TEXT_COLOR_CLASS[nodeData['status']] || 'cn-7'}`
                                    : 'w-100px'
                            }`}
                        >
                            {renderNodeRow(column, nodeData)}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderPagination = (): JSX.Element => {
        return (
            filteredFlattenNodeList.length > pageSize && (
                <Pagination
                    size={filteredFlattenNodeList.length}
                    pageSize={pageSize}
                    offset={nodeListOffset}
                    changePage={(pageNo: number) => setNodeListOffset(pageSize * (pageNo - 1))}
                    isPageSizeFix={true}
                />
            )
        )
    }

    const openTerminalComponent = (nodeData) => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('node', nodeData.name)
        history.push({
            search: queryParams.toString(),
        })
        openTerminal(nodeData)
    }

    function openTerminal(clusterData): void {
        setSelectedNode(clusterData.name)
        setNodeImageList(filterImageList(imageList, clusterData.k8sVersion))
        setTerminal(true)
    }

    const closeTerminal = (skipRedirection: boolean): void => {
        setTerminal(false)
        if (!skipRedirection) {
            history.push(match.url)
        }
    }

    const toggleDescriptionView = () => {
        setModifiedDescriptionText(descriptionText)
        setEditDescriptionView(!isEditDescriptionView)
        setSelectedTab("write")
    }

    const renderClusterTabs = (): JSX.Element => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab pointer" data-tab-index="0" onClick={changeNodeTab}>
                    <div className={`mb-6 fs-13 tab-hover${selectedTabIndex == 0 ? ' fw-6 active' : ' fw-4'}`}>
                        About Cluster
                    </div>
                    {selectedTabIndex == 0 && <div className="node-details__active-tab" />}
                </li>
                <li className="tab-list__tab pointer" data-tab-index="1" onClick={changeNodeTab}>
                    <div className={`mb-6 flexbox fs-13 tab-hover${selectedTabIndex == 1 ? ' fw-6 active' : ' fw-4'}`}>
                        Cluster Detail
                    </div>
                    {selectedTabIndex == 1 && <div className="node-details__active-tab" />}
                </li>
            </ul>
        )
    }

    const randerAboutCluster = (): JSX.Element => {
        if (errorResponseCode) {
            return (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )
        }
        return (
            <div className="cluster-about__body">
                <div className="cluster-column-container">
                    <div className="pr-16 pt-16 pl-16 pb-16 show-shimmer-loading">
                        <div className="cluster-icon-container flex br-4 cb-5 bcb-1 scb-5">
                            <ClusterIcon className="flex cluster-icon icon-dim-24" />
                        </div>
                        <div
                            className={`fs-14 h-36 pt-8 pb-8 fw-6 ${clusterDetailsName ? '' : 'child-shimmer-loading'}`}
                        >
                            {clusterDetailsName}
                        </div>
                    </div>
                    <hr className="mt-0 mb-0" />
                    <div className="pr-16 pt-16 pl-16 show-shimmer-loading">
                        <div className="fs-12 fw-4 lh-20 cn-7">Added by</div>
                        <div
                            className={`fs-13 fw-4 lh-20 cn-9 mt-2 ${clusterCreatedBy ? '' : 'child-shimmer-loading'}`}
                        >
                            {clusterCreatedBy}
                        </div>
                        <div className="fs-12 fw-4 lh-20 cn-7 mt-16">Added on</div>
                        <div
                            className={`fs-13 fw-4 lh-20 cn-9 mt-2  ${clusterCreatedOn ? '' : 'child-shimmer-loading'}`}
                        >
                            {clusterCreatedOn}
                        </div>
                    </div>
                </div>
                {clusterAboutLoader ? <Progressing pageLoader /> : randerClusterNote()}
            </div>
        )
    }
    const randerClusterNote = (): JSX.Element => {
        return (
            <div className="cluster__body-details">
                <div className="pl-16 pr-16 pt-16 pb-16">
                    {isEditDescriptionView ? (
                        <div data-color-mode="light" className="min-w-575 cluster-note__card">
                            <div className="cluster-note__card-header h-36">
                                <div className="flex left fs-13 fw-6 lh-20 cn-9">
                                    <DescriptionIcon className="tags-icon icon-dim-20 mr-8" />
                                    Description
                                </div>
                                {descriptionUpdatedBy && descriptionUpdatedOn && (
                                    <div className="flex left fw-4 cn-7 ml-8">
                                        Last updated by {descriptionUpdatedBy} on {descriptionUpdatedOn}
                                    </div>
                                )}
                                <div
                                    className="dc__align-right pencil-icon cursor flex"
                                    onClick={toggleDescriptionView}
                                >
                                    <Edit className="icon-dim-16 pr-4 cn-4" /> Edit
                                </div>
                            </div>
                            <ReactMde
                                classes={{
                                    reactMde: 'mark-down-editor-container mark-down-editor__no-border',
                                    toolbar: 'mark-down-editor__hidden',
                                    preview: 'mark-down-editor-preview',
                                    textArea: 'mark-down-editor__hidden',
                                }}
                                value={descriptionText}
                                minEditorHeight={window.innerHeight - 165}
                                selectedTab="preview"
                                generateMarkdownPreview={(markdown) =>
                                    Promise.resolve(<MarkDown markdown={markdown} breaks />)
                                }
                            />
                        </div>
                    ) : (
                        <div ref={reactMdeRef} className="min-w-500">
                            <ReactMde
                                classes={{
                                    reactMde: 'mark-down-editor-container',
                                    toolbar: 'mark-down-editor-toolbar tab-list',
                                    preview: 'mark-down-editor-preview',
                                    textArea: 'mark-down-editor-textarea-wrapper',
                                }}
                                toolbarCommands={[
                                    [
                                        'header',
                                        'bold',
                                        'italic',
                                        'strikethrough',
                                        'link',
                                        'quote',
                                        'code',
                                        'image',
                                        'unordered-list',
                                        'ordered-list',
                                        'checked-list',
                                    ],
                                ]}
                                value={modifiedDescriptionText}
                                onChange={setModifiedDescriptionText}
                                minEditorHeight={window.innerHeight - 165}
                                selectedTab={selectedTab}
                                onTabChange={setSelectedTab}
                                generateMarkdownPreview={(markdown) =>
                                    Promise.resolve(<MarkDown markdown={markdown} breaks />)
                                }
                                childProps={{
                                    writeButton: {
                                        className: `tab-list__tab pointer fs-13 ${
                                            selectedTab === 'write' && 'cb-5 fw-6 active active-tab'
                                        }`,
                                    },
                                    previewButton: {
                                        className: `tab-list__tab pointer fs-13 ${
                                            selectedTab === 'preview' && 'cb-5 fw-6 active active-tab'
                                        }`,
                                    },
                                }}
                            />
                            <div className="form cluster__description-footer pt-12 pb-12">
                                <div className="form__buttons pl-16 pr-16">
                                    <button
                                        className="cta cancel flex h-36 mr-12"
                                        type="button"
                                        onClick={toggleDescriptionView}
                                    >
                                        Cancel
                                    </button>
                                    <button className="cta flex h-36" type="submit" onClick={updateClusterAbout}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
    const randerDetailsCluster = (): JSX.Element => {
        if (errorResponseCode) {
            return (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )
        }
        if (clusterDetailsLoader) {
            return <Progressing pageLoader />
        }
        return (
            <div className={`node-list dc__overflow-scroll ${showTerminal ? 'show-terminal' : ''}`}>
                {renderClusterSummary()}
                <div
                    className={`bcn-0 pt-16 list-min-height ${noResults ? 'no-result-container' : ''} ${
                        clusterErrorList?.length ? 'with-error-bar' : ''
                    }`}
                >
                    <div className="pl-20 pr-20">
                        <NodeListSearchFilter
                            defaultVersion={defaultVersion}
                            nodeK8sVersions={clusterCapacityData?.nodeK8sVersions}
                            selectedVersion={selectedVersion}
                            setSelectedVersion={setSelectedVersion}
                            appliedColumns={appliedColumns}
                            setAppliedColumns={setAppliedColumns}
                            selectedSearchTextType={selectedSearchTextType}
                            setSelectedSearchTextType={setSelectedSearchTextType}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            searchedTextMap={searchedTextMap}
                            setSearchedTextMap={setSearchedTextMap}
                        />
                    </div>
                    {noResults ? (
                        <ClusterNodeEmptyState title="No matching nodes" actionHandler={clearFilter} />
                    ) : (
                        <>
                            <div className="mt-16" style={{ width: '100%', overflow: 'auto hidden' }}>
                                <div
                                    className=" fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase"
                                    style={{ width: 'max-content', minWidth: '100%' }}
                                >
                                    {appliedColumns.map((column) => renderNodeListHeader(column))}
                                </div>
                                {filteredFlattenNodeList
                                    .slice(nodeListOffset, nodeListOffset + pageSize)
                                    ?.map((nodeData) => renderNodeList(nodeData))}
                            </div>
                            {!showTerminal && renderPagination()}
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="cluster-about-page">
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderClusterTabs}
            />
            {selectedTabIndex == 0 && randerAboutCluster()}
            {selectedTabIndex == 1 && randerDetailsCluster()}
            {showTerminal && selectedNode && selectedTabIndex == 1 && (
                <ClusterTerminal
                    clusterId={Number(clusterId)}
                    nodeGroups={createGroupSelectList(filteredFlattenNodeList, 'name')}
                    closeTerminal={closeTerminal}
                    clusterImageList={nodeImageList}
                    namespaceList={namespaceList[clusterName]}
                    node={selectedNode}
                    setSelectedNode={setSelectedNode}
                />
            )}
        </div>
    )
}
