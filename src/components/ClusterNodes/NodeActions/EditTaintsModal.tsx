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
import { useParams } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Drawer,
    DynamicDataTable,
    Icon,
    InfoBlock,
    showError,
    stopPropagation,
    TippyCustomized,
    TippyTheme,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as HelpIcon } from '../../../assets/icons/ic-help.svg'
import { updateTaints } from '../clusterNodes.service'
import { EDIT_TAINTS_MODAL_MESSAGING, TAINTS_TABLE_HEADERS } from '../constants'
import { EditTaintsModalType, EditTaintsRequest, TaintsTableHeaderKeys, TaintsTableType } from '../types'
import {
    getTaintsPayload,
    getTaintsRowCellError,
    getTaintsTableCellError,
    getTaintsTableCellValidateState,
    getTaintsTableRow,
    getTaintsTableRows,
    getTaintTableValidateState,
    validateUniqueTaintKey,
} from './utils'

const TaintInfoMessage = () => (
    <div className="fs-13 fw-4 lh-20">
        <span>{EDIT_TAINTS_MODAL_MESSAGING.infoText}</span> &nbsp;
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-400"
            placement="top"
            Icon={HelpIcon}
            iconClass="fcv-5"
            heading={EDIT_TAINTS_MODAL_MESSAGING.tippyTitle}
            infoText=""
            showCloseButton
            trigger="click"
            interactive
            additionalContent={
                <div className="p-12 fs-13">
                    <div>{EDIT_TAINTS_MODAL_MESSAGING.tippyDescription.message}</div>
                    <ul className="p-0" style={{ listStyleType: 'none' }}>
                        {EDIT_TAINTS_MODAL_MESSAGING.tippyDescription.messageList.map((message) => (
                            <li key={`msg-${message}`}>{message}</li>
                        ))}
                    </ul>
                </div>
            }
        >
            <span className="cb-5 cursor" onClick={stopPropagation}>
                {EDIT_TAINTS_MODAL_MESSAGING.infoLinkText}
            </span>
        </TippyCustomized>
    </div>
)

const EditTaintsModal = ({ name, version, kind, taints, closePopup }: EditTaintsModalType) => {
    // STATES
    const [apiCallInProgress, setAPICallInProgress] = useState(false)
    const [taintList, setTaintList] = useState<TaintsTableType['rows']>(getTaintsTableRows(taints))
    const [taintCellError, setTaintCellError] = useState<TaintsTableType['cellError']>(
        getTaintsTableCellError(taintList),
    )

    // HOOKS
    const { clusterId } = useParams<{ clusterId: string }>()

    // HANDLERS
    const onClose = () => {
        if (!apiCallInProgress) {
            closePopup()
        }
    }

    const handleAddTaint: TaintsTableType['onRowAdd'] = () => {
        const updatedTaintList: typeof taintList = [getTaintsTableRow(), ...taintList]
        const updatedTaintCellError = taintCellError
        updatedTaintCellError[updatedTaintList[0].id] = getTaintsRowCellError()

        setTaintList(updatedTaintList)
        setTaintCellError(updatedTaintCellError)
    }

    const handleDeleteTaint: TaintsTableType['onRowDelete'] = (row) => {
        const filteredTaintList = taintList.filter(({ id }) => id !== row.id)
        setTaintList(filteredTaintList)
    }

    const handleEditTaint: TaintsTableType['onRowEdit'] = (row, headerKey, value) => {
        const updatedTaintList = taintList.map((taint) =>
            taint.id === row.id
                ? { ...taint, data: { ...taint.data, [headerKey]: { ...taint.data[headerKey], value } } }
                : taint,
        )
        const updatedTaintCellError = {
            ...taintCellError,
            [row.id]: {
                ...taintCellError[row.id],
                [headerKey]: getTaintsTableCellValidateState(headerKey, value),
            },
        }
        validateUniqueTaintKey({ taintCellError: updatedTaintCellError, taintList: updatedTaintList })

        setTaintList(updatedTaintList)
        setTaintCellError(updatedTaintCellError)
    }

    const onSave = async () => {
        const { isValid, taintCellError: updatedTaintCellError } = getTaintTableValidateState({ taintList })
        setTaintCellError(updatedTaintCellError)
        if (!isValid) {
            return
        }

        try {
            setAPICallInProgress(true)
            const payload: EditTaintsRequest = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
                taints: getTaintsPayload(taintList),
            }
            await updateTaints(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: EDIT_TAINTS_MODAL_MESSAGING.Actions.saving,
            })
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px" onEscape={onClose}>
            <div className="flexbox-col bg__primary h-100 flex-grow-1 mh-0">
                <div className="flex flex-align-center flex-justify bg__primary pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 cn-9 dc__truncate">{`${EDIT_TAINTS_MODAL_MESSAGING.titlePrefix} '${name}'`}</h2>
                    <Button
                        dataTestId="edit-taints-modal-close"
                        ariaLabel="edit-taints-modal-close"
                        icon={<Icon name="ic-close-large" color={null} />}
                        onClick={onClose}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        showAriaLabelInTippy={false}
                    />
                </div>
                <div className="flexbox-col px-20 py-16 dc__overflow-auto flex-grow-1 dc__gap-16">
                    <InfoBlock description={<TaintInfoMessage />} />
                    {taintList.length ? (
                        <DynamicDataTable<TaintsTableHeaderKeys>
                            headers={TAINTS_TABLE_HEADERS}
                            rows={taintList}
                            onRowAdd={handleAddTaint}
                            onRowDelete={handleDeleteTaint}
                            onRowEdit={handleEditTaint}
                            cellError={taintCellError}
                            addBtnTooltip="Add taint"
                        />
                    ) : (
                        <div className="p-8 bg__secondary dc__border-dashed--n3 br-4 flex dc__content-space">
                            {/* TODO: update this text */}
                            <p className="m-0 fs-12 lh-18 cn-7">Add Taint</p>
                            <Button
                                dataTestId="add-taint"
                                variant={ButtonVariantType.text}
                                text="Add Taint"
                                startIcon={<Icon name="ic-add" color={null} />}
                                onClick={handleAddTaint}
                            />
                        </div>
                    )}
                </div>
                <div className="dc__border-top flex right p-16 dc__gap-8">
                    <Button
                        dataTestId="edit-taints-modal-cancel"
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                        disabled={apiCallInProgress}
                        text={EDIT_TAINTS_MODAL_MESSAGING.Actions.cancel}
                        onClick={onClose}
                    />
                    <Button
                        dataTestId="edit-taints-modal-save"
                        isLoading={apiCallInProgress}
                        text={EDIT_TAINTS_MODAL_MESSAGING.Actions.save}
                        onClick={onSave}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default EditTaintsModal
