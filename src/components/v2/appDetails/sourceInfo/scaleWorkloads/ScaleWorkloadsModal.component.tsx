import React, { useEffect, useState } from 'react'
import { Checkbox, Progressing, showError, VisibleModal } from '../../../../common'
import { ReactComponent as Info } from '../../../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../../../assets/icons/ic-close.svg'
import { ReactComponent as ScaleDown } from '../../../../../assets/icons/ic-scale-down.svg'
import { ReactComponent as Restore } from '../../../../../assets/icons/ic-restore.svg'
import { HibernateRequest, ScaleWorkloadsType, WorkloadCheckType } from './scaleWorkloadsModal.type'
import { hibernateApp, unhibernateApp } from './scaleWorkloadsModal.service'
import MessageUI, { MsgUIType } from '../../../common/message.ui'
import './scaleWorkloadsModal.scss'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'

export default function ScaleWorkloadsModal({
    appId,
    onClose,
    history,
}: {
    appId: string
    onClose: () => void
    history: any
}) {
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

        if (fetchingLatestDetails || (!fetchingLatestDetails && appDetails.resourceTree?.nodes)) {
            const _workloadsToScaleDown = workloadsToScaleDown || new Map<string, ScaleWorkloadsType>()
            const _workloadsToRestore = workloadsToRestore || new Map<string, ScaleWorkloadsType>()
            appDetails.resourceTree.nodes.forEach((node) => {
                if (node.canBeHibernated) {
                    const workloadKey = `${node.kind}/${node.name}`
                    const _workloadTarget: ScaleWorkloadsType = {
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
                        _workloadsToRestore.set(workloadKey, _workloadTarget)

                        // TODO: confirm about this
                        if (
                            _workloadsToScaleDown.has(workloadKey) &&
                            !_workloadsToScaleDown.get(workloadKey).errorMessage
                        ) {
                            _workloadsToScaleDown.delete(workloadKey)
                        }
                    } else {
                        _workloadsToScaleDown.set(workloadKey, _workloadTarget)

                        // TODO: confirm about this
                        if (
                            _workloadsToRestore.has(workloadKey) &&
                            !_workloadsToRestore.get(workloadKey).errorMessage
                        ) {
                            _workloadsToRestore.delete(workloadKey)
                        }
                    }
                }
            })

            setWorkloadsToScaleDown(_workloadsToScaleDown)
            setWorkloadsToRestore(_workloadsToRestore)
        }
    }, [appDetails])

    const renderScaleModalHeader = () => {
        return (
            <>
                <div className="modal__heading flex left">
                    <h1 className="cn-9 fw-6 fs-20 m-0">Scale workloads</h1>
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
                <div className="modal__info mt-24 mb-8">
                    <div className="modal__info-wrapper flex left">
                        <Info className="icon-dim-20 mr-10 " />
                        <div className="fs-13 fw-4">
                            Scaled down workloads will stop using resources until restored or a new deployment is
                            initiated.&nbsp;
                            <a href="#" className="cb-5">
                                How does this work?
                            </a>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function changeDeploymentTab(index: number) {
        if (selectedDeploymentTabIndex === index) {
            return
        }

        setSelectedDeploymentTabIndex(index)
    }

    const getTabName = (tab: string, index: number) => {
        let tabName = tab

        if (workloadsToScaleDown && workloadsToRestore) {
            tabName += index === 0 ? ` (${workloadsToScaleDown.size})` : ` (${workloadsToRestore.size})`
        }

        return tabName
    }

    const renderScaleWorkloadTabs = () => {
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

    const handleAllScaleObjectsName = (isActiveWorkloadsTab: boolean) => {
        const _nameSelectionKey = isActiveWorkloadsTab ? 'scaleDown' : 'restore'
        const _nameSelection = nameSelection[_nameSelectionKey]
        const _workloadsList = isActiveWorkloadsTab ? workloadsToScaleDown : workloadsToRestore
        const _setWorkloadsList = isActiveWorkloadsTab ? setWorkloadsToScaleDown : setWorkloadsToRestore

        if (!_nameSelection.isChecked) {
            for (let [key, value] of _workloadsList) {
                value.value = 'CHECKED'
                value.isChecked = true
                _workloadsList.set(key, value)
            }

            _setWorkloadsList(_workloadsList)
        } else {
            for (let [key, value] of _workloadsList) {
                value.value = 'INTERMEDIATE'
                value.isChecked = false
                _workloadsList.set(key, value)
            }

            _setWorkloadsList(_workloadsList)
        }
        setNameSelection({
            ...nameSelection,
            [_nameSelectionKey]: {
                isChecked: !_nameSelection.isChecked,
                value: _nameSelection.isChecked ? 'INTERMEDIATE' : 'CHECKED',
            },
        })
    }

    const handleWorkloadSelection = (workloadKey: string, isActiveWorkloadsTab: boolean) => {
        const _workloadsList = isActiveWorkloadsTab ? workloadsToScaleDown : workloadsToRestore
        const _setWorkloadsList = isActiveWorkloadsTab ? setWorkloadsToScaleDown : setWorkloadsToRestore

        for (let [key, value] of _workloadsList) {
            if (workloadKey === `${value.kind}/${value.name}`) {
                value.value = !value.isChecked ? 'CHECKED' : 'INTERMEDIATE'
                value.isChecked = !value.isChecked
            }
            _workloadsList.set(key, value)
        }

        _setWorkloadsList(_workloadsList)

        const _nameSelectionKey = isActiveWorkloadsTab ? 'scaleDown' : 'restore'
        const updatedWorkloads = Array.from(_workloadsList.values())
        const isAnySelected = updatedWorkloads.some((workload) => workload.isChecked)
        const areAllSelected = isAnySelected && updatedWorkloads.every((workload) => workload.isChecked)

        if (areAllSelected) {
            return setNameSelection({
                ...nameSelection,
                [_nameSelectionKey]: {
                    isChecked: true,
                    value: 'CHECKED',
                },
            })
        } else if (isAnySelected) {
            return setNameSelection({
                ...nameSelection,
                [_nameSelectionKey]: {
                    isChecked: true,
                    value: 'INTERMEDIATE',
                },
            })
        } else {
            return setNameSelection({
                ...nameSelection,
                [_nameSelectionKey]: {
                    isChecked: false,
                    value: 'CHECKED',
                },
            })
        }
    }

    const handleWorkloadUpdate = async (isHibernateReq: boolean) => {
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

    const renderScaleWorkloadsList = (isActiveWorkloadsTab: boolean) => {
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
                            minHeight: '276px',
                            flexDirection: 'column',
                        }}
                    >
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <>
                        {isWorkloadPresent ? (
                            <>
                                <div className="check-all-workloads cn-7 fw-6 border-bottom">
                                    <Checkbox
                                        rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                        isChecked={_nameSelection.isChecked}
                                        value={_nameSelection.value}
                                        onChange={(e) => {
                                            e.stopPropagation()
                                            handleAllScaleObjectsName(isActiveWorkloadsTab)
                                        }}
                                    >
                                        <div className="pl-16 fw-6">
                                            <span>NAME</span>
                                        </div>
                                    </Checkbox>
                                </div>
                                <div style={{ minHeight: '240px', overflow: 'scroll' }}>
                                    <>
                                        {Array.from(_workloadsList.values()).map((item) => (
                                            <div key={`${item.kind}/${item.name}`} className="check-single-workload">
                                                <Checkbox
                                                    rootClassName={`mb-0 fs-14 cursor bcn-0 p${
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
                                                    <div className="pl-16">
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
                                        ? 'No active workloads found'
                                        : 'No scaled down workloads found'
                                }`}
                                size={20}
                                theme="white"
                                iconClassName="no-readme-icon"
                                msgStyle={{ color: 'var(--N700)', marginTop: '0' }}
                                bodyStyle={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    minHeight: '276px',
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
                                {isActiveWorkloadsTab ? <ScaleDown className="mr-8" /> : <Restore className="mr-8" />}
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
