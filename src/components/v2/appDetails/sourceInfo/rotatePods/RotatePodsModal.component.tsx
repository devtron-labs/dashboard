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

import { useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    Checkbox,
    Drawer,
    InfoColourBar,
    CHECKBOX_VALUE,
    MODAL_TYPE,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    RotatePodsModalProps,
    RotatePodsRequest,
    RotatePodsStatus,
    RotatePodsType,
    WorkloadCheckType,
} from './rotatePodsModal.type'
import '../scaleWorkloads/scaleWorkloadsModal.scss'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'
import { ReactComponent as ICHelpOutline } from '../../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Help } from '../../../../../assets/icons/ic-help.svg'
import { GetDeploymentStrategy, RotatePods } from './rotatePodsModal.service'
import RotateResponseModal from './RotateResponseModal'
import { POD_ROTATION_INITIATED, RequiredKinds } from '../../../../../config'
import { ReactComponent as Close } from '../../../../../assets/icons/ic-close.svg'
import { ReactComponent as RotateIcon } from '../../../../../assets/icons/ic-arrows_clockwise.svg'

import { importComponentFromFELibrary } from '../../../../common'

const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')

export default function RotatePodsModal({ onClose, callAppDetailsAPI, isDeploymentBlocked }: RotatePodsModalProps) {
    const [nameSelection, setNameSelection] = useState<Record<string, WorkloadCheckType>>({
        rotate: {
            isChecked: false,
            value: CHECKBOX_VALUE.CHECKED,
        },
    })
    const [podsToRotate, setPodsToRotate] = useState<Map<string, RotatePodsType>>()
    const [result, setResult] = useState<RotatePodsStatus>(null)

    const [rotatingInProgress, setRotatingInProgress] = useState(false)
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [showHelp, setShowHelp] = useState(false)
    const [strategy, setStrategy] = useState('')
    const [deploymentWindowConfimationValue, setDeploymentWindowConfimationValue] = useState('')
    const [showDeploymentWindowConfirmationModal, setShowDeploymentWindowConfirmationModal] = useState(false)
    useEffect(() => {
        getStrategy()
        getPodsToRotate()
    }, [])

    const getStrategy = () => {
        GetDeploymentStrategy(appDetails.appId, appDetails.environmentId)
            .then((response) => {
                if (response.result) {
                    setStrategy(response.result.deploymentTemplate)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    const getPodsToRotate = () => {
        if (appDetails.resourceTree?.nodes) {
            const _podsToRotate = podsToRotate || new Map<string, RotatePodsType>()
            appDetails.resourceTree.nodes.forEach((node) => {
                if (RequiredKinds.includes(node.kind)) {
                    const workloadKey = `${node.kind}/${node.name}`
                    const _workloadTarget: RotatePodsType = {
                        kind: node.kind,
                        name: node.name,
                        group: node.group,
                        version: node.version,
                        namespace: node.namespace,
                        errorMessage: '',
                        isChecked: false,
                        value: CHECKBOX_VALUE.CHECKED,
                    }
                    checkAndUpdateCurrentWorkload(_workloadTarget, workloadKey, _podsToRotate)
                }
            })
            setPodsToRotate(_podsToRotate)
        }
    }

    const checkAndUpdateCurrentWorkload = (
        workloadTarget: RotatePodsType,
        workloadKey: string,
        updateWorkloadsList: Map<string, RotatePodsType>,
    ): void => {
        const _currentWorkload = updateWorkloadsList.get(workloadKey)

        if (_currentWorkload) {
            workloadTarget.errorMessage = _currentWorkload.errorMessage
            workloadTarget.isChecked = _currentWorkload.isChecked
            workloadTarget.value = _currentWorkload.value
        }

        updateWorkloadsList.set(workloadKey, workloadTarget)
    }

    const renderRestartModalHeader = (): JSX.Element => {
        return (
            <div className="bg__primary">
                <div className="flex flex-align-center flex-justify dc__border-bottom bg__primary pt-12 pr-20 pb-12">
                    <div className="lh-1-43 ml-20 flex left">
                        <h1 className="cn-9 fw-6 fs-16 m-0" data-testid="restart-workload-heading-onclick">
                            Restart workloads
                        </h1>
                        <span className="icon-dim-24 fcn-6 mr-4 ml-10 fs-10">
                            <ICHelpOutline onClick={() => setShowHelp(!showHelp)} />
                        </span>
                    </div>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={onClose}>
                        <Close className="icon-dim-24 dc__align-right cursor" />
                    </button>
                </div>
            </div>
        )
    }

    const handleAllScaleObjectsName = (): void => {
        const _nameSelectionKey = 'rotate'
        const _nameSelection = nameSelection[_nameSelectionKey]
        const _workloadsList = podsToRotate

        for (const [key, value] of _workloadsList) {
            value.value = !_nameSelection.isChecked ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE
            value.isChecked = !_nameSelection.isChecked
            _workloadsList.set(key, value)
        }

        setPodsToRotate(_workloadsList)
        setNameSelection({
            ...nameSelection,
            [_nameSelectionKey]: {
                isChecked: !_nameSelection.isChecked,
                value: _nameSelection.isChecked ? CHECKBOX_VALUE.INTERMEDIATE : CHECKBOX_VALUE.CHECKED,
            },
        })
    }

    const handleWorkloadSelection = (workloadKey: string): void => {
        const _workloadsList = podsToRotate

        const selectedWorkload = _workloadsList.get(workloadKey)
        selectedWorkload.value = !selectedWorkload.isChecked ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE
        selectedWorkload.isChecked = !selectedWorkload.isChecked

        setPodsToRotate(_workloadsList)

        const _nameSelectionKey = 'rotate'
        const updatedWorkloads = Array.from(_workloadsList.values())
        const isAnySelected = updatedWorkloads.some((workload) => workload.isChecked)
        const areAllSelected = isAnySelected && updatedWorkloads.every((workload) => workload.isChecked)

        setNameSelection({
            ...nameSelection,
            [_nameSelectionKey]: {
                isChecked: !!(areAllSelected || isAnySelected),
                value: !areAllSelected && isAnySelected ? CHECKBOX_VALUE.INTERMEDIATE : CHECKBOX_VALUE.CHECKED,
            },
        })
    }

    const handlePodsRotation = async (): Promise<void> => {
        setRotatingInProgress(true)
        try {
            const requestPayload: RotatePodsRequest = {
                appId: appDetails.appId,
                environmentId: appDetails.environmentId,
                resources: Array.from(podsToRotate.values())
                    .filter((workload) => workload.isChecked)
                    .map((workload) => ({
                        name: workload.name,
                        namespace: workload.namespace,
                        groupVersionKind: {
                            Group: workload.group,
                            Version: workload.version,
                            Kind: workload.kind,
                        },
                    })),
            }

            const { result } = await RotatePods(requestPayload)
            callAppDetailsAPI()
            if (!result.containsError) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: POD_ROTATION_INITIATED,
                })
                onClose()
            } else {
                setResult(result)
            }
        } catch (e) {
            showError(e)
        } finally {
            setRotatingInProgress(false)
            setShowDeploymentWindowConfirmationModal(false)
            setNameSelection({
                ...nameSelection,
                rotate: {
                    isChecked: false,
                    value: CHECKBOX_VALUE.CHECKED,
                },
            })
        }
    }

    const handleSelectAll = (e: any) => {
        e.stopPropagation()
        handleAllScaleObjectsName()
    }

    const renderDeploymentWindowConfirmtionModal = () =>
        DeploymentWindowConfirmationDialog && (
            <DeploymentWindowConfirmationDialog
                onClose={onClose}
                value={deploymentWindowConfimationValue}
                setValue={setDeploymentWindowConfimationValue}
                isLoading={rotatingInProgress}
                type={MODAL_TYPE.RESTART}
                onClickActionButton={handlePodsRotation}
                strategyName={strategy}
                appId={appDetails.appId}
                envId={appDetails.environmentId}
            />
        )

    const handleRestartWorkloads = (e: any) => {
        e.preventDefault()
        const isWorkloadPresent = podsToRotate && podsToRotate.size > 0
        const isAnySelected = podsToRotate && Array.from(podsToRotate.values()).some((workload) => workload.isChecked)
        if (!rotatingInProgress && isWorkloadPresent && isAnySelected) {
            if (isDeploymentBlocked && DeploymentWindowConfirmationDialog) {
                // Show deployment window confirmation modal if deployment is blocked
                setShowDeploymentWindowConfirmationModal(true)
            } else handlePodsRotation()
        }
    }

    const renderRestartWorkloadsList = (): JSX.Element => {
        const _nameSelection = nameSelection['rotate']
        const isWorkloadPresent = podsToRotate && podsToRotate.size > 0
        const isAnySelected = podsToRotate && Array.from(podsToRotate.values()).some((workload) => workload.isChecked)
        return (
            <div className="scale-worklists-container bg__primary dc__height-inherit dc__overflow-auto">
                {isWorkloadPresent && (
                    <div className="dc__overflow-scroll p-20">
                        <div className="check-all-workloads cn-7 fw-6">
                            <Checkbox
                                rootClassName="mb-0 fs-13 cursor bg__primary p"
                                isChecked={_nameSelection.isChecked}
                                value={_nameSelection.value}
                                onChange={handleSelectAll}
                            >
                                <div className="pl-8 fw-6">
                                    <span>Select all</span>
                                </div>
                            </Checkbox>
                        </div>
                        <div style={{ height: '192px', overflow: 'scroll' }}>
                            {Array.from(podsToRotate.values()).map((item) => (
                                <div key={`${item.kind}/${item.name}`} className="check-single-workload mt-16">
                                    <Checkbox
                                        rootClassName={`mb-0 fs-13 cursor bg__primary p${
                                            item.errorMessage ? ' dc__align-baseline' : ''
                                        }`}
                                        isChecked={item.isChecked}
                                        value={item.value}
                                        onChange={(e) => {
                                            e.stopPropagation()
                                            handleWorkloadSelection(`${item.kind}/${item.name}`)
                                        }}
                                    >
                                        <div className="pl-8">
                                            <span className="cn-9 fw-6">{item.kind} / </span>
                                            <span>{item.name}</span>
                                        </div>
                                        {item.errorMessage && (
                                            <div className="cr-5 fs-11 fw-4 pl-16 mt-4">{item.errorMessage}</div>
                                        )}
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="w-100 dc__border-top flex right pb-16 pt-16 dc__position-fixed dc__position-abs dc__bottom-0 bg__primary scale-workload-modal ">
                    <button
                        className={`cta flex h-36 mr-20  ${
                            rotatingInProgress || !isWorkloadPresent || !isAnySelected ? 'not-allowed' : ''
                        }`}
                        onClick={handleRestartWorkloads}
                        data-testid="restart-workloads"
                    >
                        {rotatingInProgress ? (
                            <Progressing size={24} />
                        ) : (
                            <>
                                <RotateIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-10" /> Restart workloads
                            </>
                        )}
                    </button>
                </div>
            </div>
        )
    }

    const renderRotateModal = (): JSX.Element => {
        if (result) {
            return (
                <RotateResponseModal
                    onClose={onClose}
                    response={result.responses}
                    setResult={setResult}
                    callAppDetailsAPI={callAppDetailsAPI}
                />
            )
        }
        return (
            <>
                {renderRestartModalHeader()}
                {showHelp && (
                    <InfoColourBar
                        message={`Pods for selected workloads will be restarted. Configured deployment strategy "${strategy}" will be used
                to restart selected workloads.`}
                        classname="restart-desciription-bg-v100 flex left pt-10 pb-10 pl-20 pr-20 cn-9"
                        Icon={Help}
                        iconClass="icon-dim-16 mr-12 fcv-5"
                    />
                )}
                {renderRestartWorkloadsList()}
            </>
        )
    }

    if (showDeploymentWindowConfirmationModal) {
        return renderDeploymentWindowConfirmtionModal()
    }

    return (
        <Drawer position="right" width="1024px">
            <div className="dc__window-bg h-100 rotate-pods-container">{renderRotateModal()}</div>
        </Drawer>
    )
}
