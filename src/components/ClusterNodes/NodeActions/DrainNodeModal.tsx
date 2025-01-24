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

import { useState } from 'react'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    Checkbox,
    CHECKBOX_VALUE,
    ToastVariantType,
    ToastManager,
    drainNodeCapacity,
    DRAIN_NODE_MODAL_MESSAGING,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import DrainIcon from '../../../assets/icons/ic-clean-brush-medium.svg'
import { ReactComponent as TimerIcon } from '../../../assets/icons/ic-timer.svg'
import { NodeActionModalPropType } from '../types'

const DrainNodeModal = ({ name, version, kind, closePopup }: NodeActionModalPropType) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [gracePeriod, setGracePeriod] = useState('-1')
    const [deleteEmptyDirData, setDeleteEmptyDirData] = useState(false)
    const [disableEviction, setDisableEviction] = useState(false)
    const [forceDrain, setForceDrain] = useState(false)
    const [ignoreDaemonSets, setIgnoreDaemonSets] = useState(false)
    const [apiCallInProgress, setAPICallInProgress] = useState(false)
    const DRAIN_NODE_OPTIONS = [
        {
            isChecked: deleteEmptyDirData,
            onChange: () => {
                setDeleteEmptyDirData((prevState) => !prevState)
            },
            heading: DRAIN_NODE_MODAL_MESSAGING.DeleteEmptyDirectoryData.heading,
            infoText: DRAIN_NODE_MODAL_MESSAGING.DeleteEmptyDirectoryData.infoText,
        },
        {
            isChecked: disableEviction,
            onChange: () => {
                setDisableEviction((prevState) => !prevState)
            },
            heading: DRAIN_NODE_MODAL_MESSAGING.DisableEviction.heading,
            infoText: DRAIN_NODE_MODAL_MESSAGING.DisableEviction.infoText,
        },
        {
            isChecked: forceDrain,
            onChange: () => {
                setForceDrain((prevState) => !prevState)
            },
            heading: DRAIN_NODE_MODAL_MESSAGING.ForceDrain.heading,
            infoText: DRAIN_NODE_MODAL_MESSAGING.ForceDrain.infoText,
        },
        {
            isChecked: ignoreDaemonSets,
            onChange: () => {
                setIgnoreDaemonSets((prevState) => !prevState)
            },
            heading: DRAIN_NODE_MODAL_MESSAGING.IgnoreDaemonSets.heading,
            infoText: DRAIN_NODE_MODAL_MESSAGING.IgnoreDaemonSets.infoText,
        },
    ]

    const onClose = (): void => {
        closePopup()
    }

    const handleInputValue = (e) => {
        const inputValue = e.target.value
        setGracePeriod(Number(inputValue) < -1 ? '-1' : inputValue)
    }

    const handleInputOnBlur = (e) => {
        if (!e.target.value) {
            setGracePeriod('-1')
        } else {
            handleInputValue(e)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputOnBlur(e)
        }
    }

    const drainAPI = async () => {
        try {
            setAPICallInProgress(true)
            const payload = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
                nodeDrainOptions: {
                    gracePeriodSeconds: Number(gracePeriod),
                    deleteEmptyDirData,
                    disableEviction,
                    force: forceDrain,
                    ignoreAllDaemonSets: ignoreDaemonSets,
                },
            }
            await drainNodeCapacity(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: DRAIN_NODE_MODAL_MESSAGING.Actions.draining,
            })
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400 dc__user-select-none">
            <ConfirmationDialog.Icon src={DrainIcon} />
            <ConfirmationDialog.Body title={`${DRAIN_NODE_MODAL_MESSAGING.Actions.drain} ‘${name}’ ?`} />
            <p className="fs-14 fw-4 lh-20 mb-18">{DRAIN_NODE_MODAL_MESSAGING.Actions.infoText}</p>
            <div className="drain-node-options-container fs-14">
                <div className="flex left mb-8">
                    <TimerIcon className="grace-period-timer-icon icon-dim-20 scn-6" />
                    <Tooltip content={DRAIN_NODE_MODAL_MESSAGING.GracePeriod.infoText} alwaysShowTippyOnHover>
                        <span className="ml-5 dc__underline-dotted">
                            {DRAIN_NODE_MODAL_MESSAGING.GracePeriod.heading}
                        </span>
                    </Tooltip>
                    <span className="grace-period-input-wrapper flex left ml-8">
                        <input
                            name="grace-period"
                            type="number"
                            autoComplete="off"
                            min={-1}
                            className="grace-period-input h-28 en-2 bw-1 dc__left-radius-4"
                            value={gracePeriod}
                            onChange={handleInputValue}
                            onBlur={handleInputOnBlur}
                            onKeyDown={handleKeyDown}
                            disabled={apiCallInProgress}
                        />
                        <span className="grace-period-input-unit flex fs-13 fw-4 cn-9 h-28 en-2 bw-1 dc__right-radius-4">
                            sec
                        </span>
                    </span>
                </div>
                {DRAIN_NODE_OPTIONS.map((option) => (
                    <div className="flex left mb-12" key={option.heading}>
                        <Checkbox
                            rootClassName="dc_width-max-content"
                            isChecked={option.isChecked}
                            value={CHECKBOX_VALUE.CHECKED}
                            disabled={apiCallInProgress}
                            onChange={option.onChange}
                        >
                            <Tooltip content={option.infoText} alwaysShowTippyOnHover>
                                <span className="dc__underline-dotted">{option.heading}</span>
                            </Tooltip>
                        </Checkbox>
                    </div>
                ))}
            </div>
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="flex cta cancel h-36" disabled={apiCallInProgress} onClick={onClose}>
                    {DRAIN_NODE_MODAL_MESSAGING.Actions.cancel}
                </button>
                <button type="button" className="flex cta delete h-36" disabled={apiCallInProgress} onClick={drainAPI}>
                    {apiCallInProgress ? <Progressing /> : DRAIN_NODE_MODAL_MESSAGING.Actions.drain}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default DrainNodeModal
