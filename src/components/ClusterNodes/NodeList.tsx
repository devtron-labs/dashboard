import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams, useHistory } from 'react-router'
import './clusterNodes.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getClusterCapacity, getNodeList, getClusterList } from './clusterNodes.service'
import {
    BreadCrumb,
    handleUTCTime,
    Progressing,
    showError,
    useBreadcrumb,
    Option as OptionWithCheckbox,
} from '../common'
import { ClusterCapacityType, ClusterListResponse, NodeRowDetail } from './types'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import PageHeader from '../common/header/PageHeader'
import ReactSelect, { components, MultiValue } from 'react-select'
import { DropdownIndicator, appSelectorStyle } from '../AppSelector/AppSelectorUtil'
import { OptionType } from '../app/types'
import { Option } from '../v2/common/ReactSelect.utils'
import { containerImageSelectStyles } from '../CIPipelineN/ciPipeline.utils'
import { ReactComponent as Setting } from '../../assets/icons/ic-nav-gear.svg'

export default function NodeList() {
    const match = useRouteMatch()
    const history = useHistory()
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    //const [nodeList, setNodeList] = useState<NodeRowDetail[]>([])
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
    const [selectedVersion, setSelectedVersion] = useState<OptionType>(defaultVersion)
    const [selectedColumns, setSelectedColumns] = useState<MultiValue<OptionType>>([
        { label: 'Node', value: 'name' },
        { label: 'Status', value: 'status' },
        { label: 'Roles', value: 'roles' },
        { label: 'Errors', value: 'errors' },
        { label: 'K8S Version', value: 'k8sVersion' },
        { label: 'Pods', value: 'podCount' },
        { label: 'Taints', value: 'taintCount' },
        { label: 'CPU Usage', value: 'cpu.usagePercentage' },
        { label: 'Mem Usage', value: 'memory.usagePercentage' },
    ])
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<OptionType>>([
        { label: 'Node', value: 'name' },
        { label: 'Status', value: 'status' },
        { label: 'Roles', value: 'roles' },
        { label: 'Errors', value: 'errors' },
        { label: 'K8S Version', value: 'k8sVersion' },
        { label: 'Pods', value: 'podCount' },
        { label: 'Taints', value: 'taintCount' },
        { label: 'CPU Usage', value: 'cpu.usagePercentage' },
        { label: 'Mem Usage', value: 'memory.usagePercentage' },
    ])
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [clusterErrorTitle, setClusterErrorTitle] = useState('')
    const [clusterErrorList, setClusterErrorList] = useState<string[]>([])
    const [flattenNodeList, setFlattenNodeList] = useState<object[]>([])

    const columnMetadata = [
        { label: 'Node', value: 'name', disabled: true },
        { label: 'Status', value: 'status' },
        { label: 'Roles', value: 'roles' },
        { label: 'Errors', value: 'errors' },
        { label: 'K8S Version', value: 'k8sVersion' },
        { label: 'Pods', value: 'podCount' },
        { label: 'Taints', value: 'taintCount' },
        { label: 'CPU Usage', value: 'cpu.usagePercentage' },
        { label: 'Mem Usage', value: 'memory.usagePercentage' },
        { label: 'External IP', value: 'externalIp' },
        { label: 'Internal IP', value: 'internalIp' },
        { label: 'Unschedulable', value: 'unschedulable' },
    ]

    const flattenObject = (ob: Object): Object => {
        var toReturn = {}

        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue

            if (typeof ob[i] == 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
                var flatObject = flattenObject(ob[i])
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue

                    toReturn[i + '.' + x] = flatObject[x]
                }
            } else {
                toReturn[i] = ob[i]
            }
        }
        return toReturn
    }

    const getNodeListData = () => {
        setLoader(true)
        Promise.all([getNodeList(clusterId), getClusterCapacity(clusterId)])
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response[0].result) {
                    //setNodeList(response[0].result)
                    setFlattenNodeList(response[0].result.map((data) => flattenObject(data)))
                    //console.log(response[0].result.map((data) => flattenObject(data)))
                }
                if (response[1].result) {
                    setClusterCapacityData(response[1].result)
                    let _errorTitle,
                        _errorList = [],
                        _nodeErrors = Object.keys(response[1].result.nodeErrors || {})

                    if (response[1].result.nodeK8sVersions.length > 1) {
                        _errorTitle = 'Version diff'
                        _errorList.push(
                            'Major version diff identified among nodes. Current versions ' +
                                response[1].result.nodeK8sVersions,
                        )
                    }

                    if (_nodeErrors.length > 0) {
                        _errorTitle = _errorTitle ? ', ' : '' + _nodeErrors
                        for (let i = 0; i < _nodeErrors.length; i++) {
                            const _errorLength = response[1].result.nodeErrors[_nodeErrors[i]].length
                            _errorList.push(
                                `${_nodeErrors[i]} on ${
                                    _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                                }`,
                            )
                        }
                    }
                    setClusterErrorTitle(_errorTitle)
                    setClusterErrorList(_errorList)
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }

    useEffect(() => {
        getNodeListData()
    }, [clusterId])

    useEffect(() => {
        getClusterList()
            .then((response: ClusterListResponse) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    const optionList = response.result
                        .filter((cluster) => !cluster.errorInNodeListing)
                        .map((cluster) => {
                            const _clusterId = cluster.id.toString()
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

    const handleFilterChanges = (selected, key): void => {}

    const onVersionChange = (selectedValue: OptionType): void => {
        setSelectedVersion(selectedValue)
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search-wrapper ">
                <div className="position-rel en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder="Search charts"
                        value={searchText}
                        className="search__input"
                        onChange={(event) => {
                            setSearchText(event.target.value)
                        }}
                    />
                    {searchApplied ? (
                        <button
                            className="search__clear-button"
                            type="button"
                            onClick={(e) => handleFilterChanges(e, 'clear')}
                        >
                            <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                        </button>
                    ) : null}
                </div>
                <ReactSelect
                    options={[
                        defaultVersion,
                        ...(clusterCapacityData?.nodeK8sVersions?.map((version) => ({
                            label: 'K8s version: ' + version,
                            value: version,
                        })) || []),
                    ]}
                    onChange={onVersionChange}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option,
                    }}
                    value={selectedVersion}
                    styles={containerImageSelectStyles}
                />
                <div className="border-left h-20 mt-6"></div>
                <ReactSelect
                    menuIsOpen={isMenuOpen}
                    name="columns"
                    value={selectedColumns}
                    options={columnMetadata}
                    onChange={setSelectedColumns}
                    isMulti={true}
                    isSearchable={false}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onMenuOpen={() => handleMenuState(true)}
                    onMenuClose={handleCloseFilter}
                    isOptionDisabled={(option) => option['disabled']}
                    components={{
                        Option: OptionWithCheckbox,
                        ValueContainer,
                        IndicatorSeparator: null,
                        ClearIndicator: null,
                        MenuList: (props) => <MenuList {...props} />,
                    }}
                    styles={{
                        ...containerImageSelectStyles,
                        menuList: (base, state) => ({
                            ...base,
                            borderRadius: '4px',
                            paddingTop: 0,
                            paddingBottom: 0,
                        }),
                        option: (base, state) => ({
                            ...base,
                            padding: '10px 12px',
                            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                            color: 'var(--N900)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                        }),
                        dropdownIndicator: (base, state) => ({
                            ...base,
                            color: 'var(--N400)',
                            transition: 'all .2s ease',
                            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            padding: '0 8px',
                        }),
                    }}
                />
            </div>
        )
    }

    const handleApplySelectedColumns = () => {
        setMenuOpen(false)
        setAppliedColumns(selectedColumns)
    }

    const handleMenuState = (menuOpenState: boolean): void => {
        if (menuOpenState) {
            setSelectedColumns(appliedColumns)
        }
        setMenuOpen(menuOpenState)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
        setSelectedColumns(appliedColumns)
    }

    const MenuList = (props: any): JSX.Element => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="flex react-select__bottom bcn-0 p-8">
                    <button className="flex cta apply-filter" onClick={handleApplySelectedColumns}>
                        Apply
                    </button>
                </div>
            </components.MenuList>
        )
    }

    const ValueContainer = (props: any): JSX.Element => {
        const length = props.getValue().length

        return (
            <components.ValueContainer {...props}>
                {length > 0 ? (
                    <>
                        {!props.selectProps.menuIsOpen && (
                            <>
                                <Setting className="icon-dim-16 setting-icon mr-5" />
                                Columns &nbsp;
                                {length === props.options.length ? 'All' : <span className="badge">{length}</span>}
                            </>
                        )}
                        {React.cloneElement(props.children[1])}
                    </>
                ) : (
                    <>{props.children}</>
                )}
            </components.ValueContainer>
        )
    }

    // const ValueContainer = (props: any): JSX.Element => {
    //     const length = props.getValue().length

    //     return (
    //         <components.ValueContainer {...props}>
    //             {!props.selectProps.menuIsOpen && (
    //                 <>
    //                     <Setting className="icon-dim-16 setting-icon mr-5" />
    //                     Columns {length === props.options.length ? 'All' : <span className="badge">{length}</span>}
    //                     {React.cloneElement(props.children[1])}
    //                 </>
    //             )}
    //         </components.ValueContainer>
    //     )
    // }

    const onClusterChange = (selectedValue: OptionType): void => {
        setSelectedCluster(selectedValue)
        const currentUrl = match.url.replace(clusterId, selectedValue.value)
        history.push(currentUrl)
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

    if (loader) {
        return <Progressing />
    }

    return (
        <>
            <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs={true} />
            <div className="node-list">
                <div className="flexbox content-space pl-20 pr-20 pt-16 pb-16">
                    <div className="fw-6 fs-14 cn-9">Resource allocation and usage</div>
                    <div className="app-tabs-sync">
                        {lastDataSyncTimeString && (
                            <span>
                                {lastDataSyncTimeString}{' '}
                                <button className="btn btn-link p-0 fw-6 cb-5" onClick={getNodeListData}>
                                    Refresh
                                </button>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flexbox content-space pl-20 pr-20 pb-20">
                    <div className="flexbox content-space mr-16 width-50 p-16 bcn-0 br-8">
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Usage</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Capacity</div>
                            <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Requests</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.requestPercentage}
                            </div>
                        </div>
                        <div className="width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Limits</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.limitPercentage}
                            </div>
                        </div>
                    </div>

                    <div className="flexbox content-space width-50 p-16 bcn-0 br-8">
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Usage</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Capacity</div>
                            <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.memory?.capacity}</div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Requests</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.requestPercentage}
                            </div>
                        </div>
                        <div className="width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Limits</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.limitPercentage}
                            </div>
                        </div>
                    </div>
                </div>
                {clusterErrorList.length > 0 && (
                    <div className="pl-20 pr-20 pt-18 pb-18 bcr-1 border-top border-bottom">
                        <div className={`flexbox content-space ${collapsedErrorSection ? '' : ' mb-16'}`}>
                            <span
                                className="flexbox pointer"
                                onClick={(event) => {
                                    setCollapsedErrorSection(!collapsedErrorSection)
                                }}
                            >
                                <Info className="error-icon mt-2 mb-2 mr-8 icon-dim-18" />
                                <span className="fw-6 fs-14 cn-9 mr-16">
                                    {clusterErrorList.length === 1 ? '1 Error' : clusterErrorList.length + ' Errors'}
                                </span>
                                {collapsedErrorSection && <span className="fw-4 fs-14 cn-9">{clusterErrorTitle}</span>}
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
                                    <div className="fw-4 fs-13 cn-9 mb-16">{error}</div>
                                ))}
                                {/* <div className="fw-4 fs-13 cn-9 mb-16">
                                    Major version diff identified among nodes. Current versions{' '}
                                    {clusterCapacityData?.nodeK8sVersions}
                                </div>
                                <div className="fw-4 fs-13 cn-9">Memory pressure on 2 nodes.</div> */}
                            </>
                        )}
                    </div>
                )}
                <div className="bcn-0 pt-16">
                    <div className="pl-20 pr-20">{renderSearch()}</div>
                    <div
                        className="mt-16 en-2 bw-1"
                        style={{ minHeight: 'calc(100vh - 125px)', width: '100%', overflow: 'auto' }}
                    >
                        <div
                            className=" fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 text-uppercase"
                            style={{ width: 'max-content', minWidth: '100%' }}
                        >
                            <div style={{ paddingLeft: '296px' }}>
                                {appliedColumns.map((columnName) => (
                                    <div
                                        className={` inline-block ellipsis-right mr-16 ${
                                            columnName.label === 'Node'
                                                ? 'w-280 pl-20 bcn-0 position-abs left-65'
                                                : 'w-100-px'
                                        }`}
                                    >
                                        {columnName.label}
                                    </div>
                                ))}
                            </div>
                            {/* <div>Node</div>
                            <div>Status</div>
                            <div>Role</div>
                            <div>Errors</div>
                            <div>K8s version</div>
                            <div>Pods</div>
                            <div>Taints</div>
                            <div>CPU Usage</div>
                            <div>Mem Usage</div>
                            <div>Age</div> */}
                        </div>
                        {flattenNodeList?.map((nodeData) => (
                            <div
                                className="fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20"
                                style={{ width: 'max-content', minWidth: '100%' }}
                            >
                                {/* <div className="cb-5 ellipsis-right">
                                    <NavLink to={`${match.url}/${nodeData.name}`}>{nodeData.name}</NavLink>
                                </div>
                                <div>{nodeData.status || '-'}</div>
                                <div>{nodeData.roles || '-'}</div>
                                <div>{nodeData.errors?.length > 0 ? nodeData.errors.length : ''}</div>
                                <div>{nodeData.k8sVersion || '-'}</div>
                                <div>{nodeData.podCount || '-'}</div>
                                <div>{nodeData.taintCount || '-'}</div>
                                <div>
                                    <div>{nodeData.cpu?.usagePercentage || '-'}</div>
                                    {nodeData.cpu?.allocatable && (
                                        <div>{nodeData.cpu.allocatable + '/' + nodeData.cpu.usage}</div>
                                    )}
                                </div>
                                <div>
                                    <div>{nodeData.memory?.usagePercentage || '-'}</div>
                                    {nodeData.memory?.allocatable && (
                                        <div>{nodeData.memory.allocatable + '/' + nodeData.memory.usage}</div>
                                    )}
                                </div>
                                <div>{nodeData.age || '-'}</div> */}
                                <div style={{ paddingLeft: '296px' }}>
                                    {appliedColumns.map((columnName) => {
                                        return columnName.label === 'Node' ? (
                                            <div className="cb-5 ellipsis-right w-280 inline-block pl-20 bcn-0 position-abs left-65">
                                                <NavLink to={`${match.url}/${nodeData[columnName.value]}`}>
                                                    {nodeData[columnName.value]}
                                                </NavLink>
                                            </div>
                                        ) : (
                                            <div className="w-100-px inline-block ellipsis-right mr-16">
                                                {nodeData[columnName.value] || '-'}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
