import React, { useState } from 'react'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    TippyCustomized,
    TippyTheme,
    stopPropagation,
    Checkbox,
    CHECKBOX_VALUE,
} from '@devtron-labs/devtron-fe-common-lib'
import DrainIcon from '../../../assets/icons/ic-clean-brush-medium.svg'
import { ReactComponent as QuestionIcon } from '../../v2/assets/icons/ic-question.svg'
import { ReactComponent as HelpIcon } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as TimerIcon } from '../../../assets/icons/ic-timer.svg'
import { DRAIN_NODE_MODAL_MESSAGING } from '../constants'
import { NodeActionModalPropType } from '../types'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { drainNodeCapacity } from '../clusterNodes.service'

export default function DrainNodeModal({ name, version, kind, closePopup }: NodeActionModalPropType) {
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
                name: name,
                version: version,
                kind: kind,
                nodeDrainOptions: {
                    gracePeriodSeconds: Number(gracePeriod),
                    deleteEmptyDirData: deleteEmptyDirData,
                    disableEviction: disableEviction,
                    force: forceDrain,
                    ignoreAllDaemonSets: ignoreDaemonSets,
                },
            }
            await drainNodeCapacity(payload)
            toast.success(DRAIN_NODE_MODAL_MESSAGING.Actions.draining)
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
                    <span className="ml-5">{DRAIN_NODE_MODAL_MESSAGING.GracePeriod.heading}</span>
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
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300"
                        placement="top"
                        Icon={HelpIcon}
                        iconClass="fcv-5"
                        heading={DRAIN_NODE_MODAL_MESSAGING.GracePeriod.heading}
                        infoText={DRAIN_NODE_MODAL_MESSAGING.GracePeriod.infoText}
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <QuestionIcon className="icon-dim-16 fcn-6 ml-8 cursor" onClick={stopPropagation} />
                    </TippyCustomized>
                </div>
                {DRAIN_NODE_OPTIONS.map((option) => {
                    return (
                        <div className="flex left mb-12" key={option.heading}>
                            <Checkbox
                                rootClassName="dc_width-max-content"
                                isChecked={option.isChecked}
                                value={CHECKBOX_VALUE.CHECKED}
                                disabled={apiCallInProgress}
                                onChange={option.onChange}
                            >
                                {option.heading}
                            </Checkbox>
                            <TippyCustomized
                                theme={TippyTheme.white}
                                className="w-300"
                                placement="top"
                                Icon={HelpIcon}
                                iconClass="fcv-5"
                                heading={option.heading}
                                infoText={option.infoText}
                                showCloseButton={true}
                                trigger="click"
                                interactive={true}
                            >
                                <QuestionIcon
                                    className="drain-option-help-icon icon-dim-16 fcn-6 ml-8 cursor"
                                    onClick={stopPropagation}
                                />
                            </TippyCustomized>
                        </div>
                    )
                })}
            </div>
            <ConfirmationDialog.ButtonGroup>
                <button
                    type="button"
                    className="flex cta cancel h-36"
                    disabled={apiCallInProgress}
                    onClick={onClose}
                >
                    {DRAIN_NODE_MODAL_MESSAGING.Actions.cancel}
                </button>
                <button type="button" className="flex cta delete h-36" disabled={apiCallInProgress} onClick={drainAPI}>
                    {apiCallInProgress ? <Progressing /> : DRAIN_NODE_MODAL_MESSAGING.Actions.drain}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
