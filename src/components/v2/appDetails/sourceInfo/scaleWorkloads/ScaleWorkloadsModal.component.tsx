import React, { useEffect, useState } from 'react'
import { Checkbox, DetailsProgressing, Progressing, showError, VisibleModal } from '../../../../common'
import { ReactComponent as Info } from '../../../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../../../assets/icons/ic-close.svg'
import { ReactComponent as ScaleDown } from '../../../../../assets/icons/ic-scale-down.svg'
import { ReactComponent as Restore } from '../../../../../assets/icons/ic-restore.svg'
import {
    HibernateRequest,
    ScaleWorkloadsModalProps,
    ScaleWorkloadsType,
    WorkloadCheckType,
} from './scaleWorkloadsModal.type'
import { hibernateApp, unhibernateApp } from './scaleWorkloadsModal.service'
import MessageUI, { MsgUIType } from '../../../common/message.ui'
import './scaleWorkloadsModal.scss'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'

export default function ScaleWorkloadsModal({ appId, onClose, history }: ScaleWorkloadsModalProps) {
    const [nameSelection, setNameSelection] = useState<Record<string, WorkloadCheckType>>({
        scaleDown: {
            isChecked: false,
            value: 'CHECKED',
        },
        restore: {
            isChecked: false,
            value: 'CHECKED',
        },
    })
    const [workloadsToScaleDown, setWorkloadsToScaleDown] = useState<Map<string, ScaleWorkloadsType>>()
    const [workloadsToRestore, setWorkloadsToRestore] = useState<Map<string, ScaleWorkloadsType>>()
    const [selectedDeploymentTabIndex, setSelectedDeploymentTabIndex] = useState<number>(0)
    const [scalingInProgress, setScalingInProgress] = useState(false)
    const [fetchingLatestDetails, setFetchingLatestDetails] = useState(false)
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const scaleWorkloadTabs = ['Active workloads', 'Scaled down workloads']

    useEffect(() => {
        if (fetchingLatestDetails) {
            setFetchingLatestDetails(false)
        }

        if (appDetails.resourceTree?.nodes) {
            const _workloadsToScaleDown = workloadsToScaleDown || new Map<string, ScaleWorkloadsType>()
            const _workloadsToRestore = workloadsToRestore || new Map<string, ScaleWorkloadsType>()
            appDetails.resourceTree.nodes.forEach((node) => {
                if (node.canBeHibernated) {
                    const workloadKey = `${node.kind}/${node.name}`
                    let _workloadTarget: ScaleWorkloadsType = {
                        kind: node.kind,
                        name: node.name,
                        group: node.group,
                        version: node.version,
                        namespace: node.namespace,
                        errorMessage: '',
                        isChecked: false,
                        value: 'CHECKED',
                    }

                    if (node.isHibernated) {
                        checkAndUpdateCurrentWorkload(
                            _workloadTarget,
                            workloadKey,
                            _workloadsToRestore,
                            _workloadsToScaleDown,
                        )
                    } else {
                        checkAndUpdateCurrentWorkload(
                            _workloadTarget,
                            workloadKey,
                            _workloadsToScaleDown,
                            _workloadsToRestore,
                        )
                    }
                }
            })

            setWorkloadsToScaleDown(_workloadsToScaleDown)
            setWorkloadsToRestore(_workloadsToRestore)
        }
    }, [appDetails])

    const checkAndUpdateCurrentWorkload = (
        workloadTarget: ScaleWorkloadsType,
        workloadKey: string,
        updateWorkloadsList: Map<string, ScaleWorkloadsType>,
        deleteFromWorkloadsList: Map<string, ScaleWorkloadsType>,
    ): void => {
        const _currentWorkload = updateWorkloadsList.get(workloadKey)

        if (_currentWorkload) {
            workloadTarget.errorMessage = _currentWorkload.errorMessage
            workloadTarget.isChecked = _currentWorkload.isChecked
            workloadTarget.value = _currentWorkload.value
        }

        updateWorkloadsList.set(workloadKey, workloadTarget)

        if (deleteFromWorkloadsList.has(workloadKey)) {
            deleteFromWorkloadsList.delete(workloadKey)
        }
    }

    const renderScaleModalHeader = (): JSX.Element => {
        return (
            <>
                <div className="modal__heading flex left">
                    <h1 className="cn-9 fw-6 fs-16 m-0">Scale workloads</h1>
                    <button
                        type="button"
                        className="transparent p-0"
                        style={{
                            lineHeight: '0',
                            margin: 'auto',
                            marginRight: '0',
                            cursor: scalingInProgress || fetchingLatestDetails ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => onClose()}
                        disabled={scalingInProgress || fetchingLatestDetails}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="modal__info mt-16">
                    <div className="modal__info-wrapper flex left">
                        <Info className="icon-dim-20 mr-10 " />
                        <div className="fs-13 fw-4">
                            Scaled down workloads will stop using resources until restored.
                            {/* <a href="#" className="cb-5">
                                How does this work?
                            </a> */}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function changeDeploymentTab(index: number): void {
        if (selectedDeploymentTabIndex === index) {
            return
        }

        setSelectedDeploymentTabIndex(index)
    }

    const getTabName = (tab: string, index: number): string => {
        let tabName = tab

        if (workloadsToScaleDown && workloadsToRestore) {
            tabName += index === 0 ? ` (${workloadsToScaleDown.size})` : ` (${workloadsToRestore.size})`
        }

        return tabName
    }

    const renderScaleWorkloadTabs = (): JSX.Element => {
        return (
            <ul className="tab-list deployment-tab-list tab-list--borderd mr-20">
                {scaleWorkloadTabs.map((tab, index) => {
                    return (
                        <li
                            onClick={() => {
                                if (!scalingInProgress && !fetchingLatestDetails) {
                                    changeDeploymentTab(index)
                                }
                            }}
                            key={tab}
                            className="tab-list__tab"
                        >
                            <div
                                className={`tab-list__tab-link ${selectedDeploymentTabIndex == index ? 'active' : ''}`}
                                style={{
                                    cursor: scalingInProgress || fetchingLatestDetails ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {getTabName(tab, index)}
                            </div>
                        </li>
                    )
                })}
            </ul>
        )
    }

    const handleAllScaleObjectsName = (isActiveWorkloadsTab: boolean): void => {
        const _nameSelectionKey = isActiveWorkloadsTab ? 'scaleDown' : 'restore'
        const _nameSelection = nameSelection[_nameSelectionKey]
        const _workloadsList = isActiveWorkloadsTab ? workloadsToScaleDown : workloadsToRestore
        const _setWorkloadsList = isActiveWorkloadsTab ? setWorkloadsToScaleDown : setWorkloadsToRestore

        for (let [key, value] of _workloadsList) {
            value.value = !_nameSelection.isChecked ? 'CHECKED' : 'INTERMEDIATE'
            value.isChecked = !_nameSelection.isChecked ? true : false
            _workloadsList.set(key, value)
        }

        _setWorkloadsList(_workloadsList)
        setNameSelection({
            ...nameSelection,
            [_nameSelectionKey]: {
                isChecked: !_nameSelection.isChecked,
                value: _nameSelection.isChecked ? 'INTERMEDIATE' : 'CHECKED',
            },
        })
    }

    const handleWorkloadSelection = (workloadKey: string, isActiveWorkloadsTab: boolean): void => {
        const _workloadsList = isActiveWorkloadsTab ? workloadsToScaleDown : workloadsToRestore
        const _setWorkloadsList = isActiveWorkloadsTab ? setWorkloadsToScaleDown : setWorkloadsToRestore
        
        const selectedWorkload = _workloadsList.get(workloadKey)
        selectedWorkload.value = !selectedWorkload.isChecked ? 'CHECKED' : 'INTERMEDIATE'
        selectedWorkload.isChecked = !selectedWorkload.isChecked

        _setWorkloadsList(_workloadsList)

        const _nameSelectionKey = isActiveWorkloadsTab ? 'scaleDown' : 'restore'
        const updatedWorkloads = Array.from(_workloadsList.values())
        const isAnySelected = updatedWorkloads.some((workload) => workload.isChecked)
        const areAllSelected = isAnySelected && updatedWorkloads.every((workload) => workload.isChecked)

        setNameSelection({
            ...nameSelection,
            [_nameSelectionKey]: {
                isChecked: areAllSelected || isAnySelected ? true : false,
                value: !areAllSelected && isAnySelected ? 'INTERMEDIATE' : 'CHECKED',
            },
        })
    }

    const handleWorkloadUpdate = async (isHibernateReq: boolean): Promise<void> => {
        const _nameSelectionKey = isHibernateReq ? 'scaleDown' : 'restore'

        try {
            setScalingInProgress(true)
            const workloadUpdate = isHibernateReq ? hibernateApp : unhibernateApp
            const _workloadsList = isHibernateReq ? workloadsToScaleDown : workloadsToRestore
            const _setWorkloadsList = isHibernateReq ? setWorkloadsToScaleDown : setWorkloadsToRestore
            const requestPayload: HibernateRequest = {
                appId,
                resources: Array.from(_workloadsList.values())
                    .filter((workload) => workload.isChecked)
                    .map((workload) => ({
                        kind: workload.kind,
                        name: workload.name,
                        group: workload.group,
                        version: workload.version,
                        namespace: workload.namespace,
                    })),
            }

            const { result } = await workloadUpdate(requestPayload)

            if (Array.isArray(result)) {
                result.forEach((status) => {
                    _workloadsList.set(`${status.targetObject.kind}/${status.targetObject.name}`, {
                        ...status.targetObject,
                        errorMessage: status.errorMessage || '',
                        isChecked: false,
                        value: 'CHECKED',
                    })
                })

                setFetchingLatestDetails(true)
                _setWorkloadsList(_workloadsList)
                history.push(`${history.location.pathname}?refetchData=true`)
            }
        } catch (e) {
            showError(e)
        } finally {
            setScalingInProgress(false)
            setNameSelection({
                ...nameSelection,
                [_nameSelectionKey]: {
                    isChecked: false,
                    value: 'CHECKED',
                },
            })
        }
    }

    const renderScaleWorkloadsList = (isActiveWorkloadsTab: boolean): JSX.Element => {
        const _nameSelection = nameSelection[isActiveWorkloadsTab ? 'scaleDown' : 'restore']
        const _workloadsList = isActiveWorkloadsTab ? workloadsToScaleDown : workloadsToRestore
        const isWorkloadPresent = _workloadsList && _workloadsList.size > 0
        const isAnySelected =
            _workloadsList && Array.from(_workloadsList.values()).some((workload) => workload.isChecked)

        return (
            <div className="scale-worklists-container">
                {fetchingLatestDetails ? (
                    <div
                        className="flex"
                        style={{
                            height: '234px',
                            flexDirection: 'column',
                        }}
                    >
                        <DetailsProgressing
                            pageLoader
                            fullHeight={true}
                            loadingText={`${
                                isActiveWorkloadsTab ? 'Scaling down' : 'Restoring'
                            } workloads. Please wait...`}
                        />
                    </div>
                ) : (
                    <>
                        {isWorkloadPresent ? (
                            <>
                                <div className="check-all-workloads cn-7 fw-6 border-bottom">
                                    <Checkbox
                                        rootClassName="mb-0 fs-13 cursor bcn-0 p"
                                        isChecked={_nameSelection.isChecked}
                                        value={_nameSelection.value}
                                        onChange={(e) => {
                                            e.stopPropagation()
                                            handleAllScaleObjectsName(isActiveWorkloadsTab)
                                        }}
                                    >
                                        <div className="pl-8 fw-6">
                                            <span>NAME</span>
                                        </div>
                                    </Checkbox>
                                </div>
                                <div style={{ height: '192px', overflow: 'scroll' }}>
                                    <>
                                        {Array.from(_workloadsList.values()).map((item) => (
                                            <div key={`${item.kind}/${item.name}`} className="check-single-workload">
                                                <Checkbox
                                                    rootClassName={`mb-0 fs-13 cursor bcn-0 p${
                                                        item.errorMessage ? ' align-baseline' : ''
                                                    }`}
                                                    isChecked={item.isChecked}
                                                    value={item.value}
                                                    onChange={(e) => {
                                                        e.stopPropagation()
                                                        handleWorkloadSelection(
                                                            `${item.kind}/${item.name}`,
                                                            isActiveWorkloadsTab,
                                                        )
                                                    }}
                                                >
                                                    <div className="pl-8">
                                                        <span className="cn-9 fw-6">{item.kind} / </span>
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {item.errorMessage && (
                                                        <div className="cr-5 fs-11 fw-4 pl-16 mt-4">
                                                            {item.errorMessage}
                                                        </div>
                                                    )}
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </>
                                </div>
                            </>
                        ) : (
                            <MessageUI
                                icon={MsgUIType.INFO}
                                msg={`${
                                    isActiveWorkloadsTab
                                        ? 'No active workloads available'
                                        : 'No scaled down workloads available'
                                }`}
                                size={20}
                                theme="white"
                                iconClassName="no-readme-icon"
                                msgStyle={{ color: 'var(--N700)', marginTop: '0' }}
                                bodyStyle={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    minHeight: '0',
                                    height: '234px',
                                    paddingTop: 0,
                                }}
                            />
                        )}
                    </>
                )}
                <div className="scale-workloads-cta">
                    <button
                        className={`cta flex ${
                            scalingInProgress || !isWorkloadPresent || !isAnySelected ? 'not-allowed' : ''
                        }`}
                        onClick={(e) => {
                            e.preventDefault()
                            if (!scalingInProgress && isWorkloadPresent && isAnySelected) {
                                handleWorkloadUpdate(isActiveWorkloadsTab)
                            }
                        }}
                    >
                        {scalingInProgress ? (
                            <Progressing size={24} />
                        ) : (
                            <>
                                {isActiveWorkloadsTab ? (
                                    <ScaleDown className="cta-icon mr-8" />
                                ) : (
                                    <Restore className="cta-icon mr-8" />
                                )}
                                {isActiveWorkloadsTab ? 'Scale workloads to 0 (zero)' : 'Restore workloads'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <VisibleModal className="scale-workload-modal">
            <div className={`modal__body br-4`}>
                {renderScaleModalHeader()}
                {renderScaleWorkloadTabs()}
                {renderScaleWorkloadsList(selectedDeploymentTabIndex === 0)}
            </div>
        </VisibleModal>
    )
}
