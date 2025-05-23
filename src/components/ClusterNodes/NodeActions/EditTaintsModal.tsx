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
    GenericEmptyState,
    Icon,
    InfoIconTippy,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import ImgEmptyChartGroup from '@Images/ic-empty-chartgroup@2x.png'

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

const AdditionalContent = () => (
    <div className="p-12 h-200 dc__overflow-auto fs-13 lh-20">
        {EDIT_TAINTS_MODAL_MESSAGING.infoText}
        <br />
        <br />
        <div>
            {EDIT_TAINTS_MODAL_MESSAGING.description.title}
            <br />
            <ol className="pl-24">
                {EDIT_TAINTS_MODAL_MESSAGING.description.messageList.map((text) => (
                    <li key={text}>{text}</li>
                ))}
            </ol>
        </div>
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

    // CONSTANTS
    const isTaintListEmpty = taintList.length === 0

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
        const updatedTaintCellError = structuredClone(taintCellError)
        delete updatedTaintCellError[row.id]

        setTaintList(filteredTaintList)
        setTaintCellError(updatedTaintCellError)
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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve errors and try again',
            })
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
        <Drawer position="right" width="100%" minWidth="800px" maxWidth="1024px" onEscape={onClose}>
            <div className="flexbox-col bg__primary h-100 flex-grow-1 mh-0">
                <div className="flex flex-align-center flex-justify bg__primary px-20 pt-12 pb-11 border__primary--bottom">
                    <h2 className="fs-16 fw-6 lh-1-5 m-0 cn-9 dc__truncate">{`${EDIT_TAINTS_MODAL_MESSAGING.titlePrefix} '${name}'`}</h2>
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
                <div className="flex-grow-1 dc__overflow-auto flexbox-col dc__gap-16 p-20">
                    {isTaintListEmpty ? (
                        <GenericEmptyState
                            title={EDIT_TAINTS_MODAL_MESSAGING.emptyState.title}
                            subTitle={EDIT_TAINTS_MODAL_MESSAGING.emptyState.subTitle}
                            image={ImgEmptyChartGroup}
                            isButtonAvailable
                            renderButton={() => (
                                <Button
                                    dataTestId="add-taint"
                                    text={EDIT_TAINTS_MODAL_MESSAGING.addTaint}
                                    startIcon={<Icon name="ic-add" color={null} />}
                                    onClick={handleAddTaint}
                                />
                            )}
                        />
                    ) : (
                        <>
                            <div className="flex dc__content-space">
                                <div className="flex">
                                    <Icon name="ic-spray-can" color="N900" />
                                    <h3 className="fs-14 lh-20 fw-6 cn-9 mt-0 mb-0 ml-8 mr-4">
                                        {EDIT_TAINTS_MODAL_MESSAGING.infoTitle}
                                    </h3>
                                    <InfoIconTippy
                                        heading="Taints"
                                        documentationLinkText="View documentation"
                                        documentationLink="TAINT"
                                        additionalContent={<AdditionalContent />}
                                    />
                                </div>
                                <Button
                                    dataTestId="add-taint"
                                    variant={ButtonVariantType.secondary}
                                    startIcon={<Icon name="ic-add" color={null} />}
                                    size={ComponentSizeType.small}
                                    text={EDIT_TAINTS_MODAL_MESSAGING.addTaint}
                                    onClick={handleAddTaint}
                                />
                            </div>
                            <DynamicDataTable<TaintsTableHeaderKeys>
                                headers={TAINTS_TABLE_HEADERS}
                                rows={taintList}
                                onRowAdd={handleAddTaint}
                                onRowDelete={handleDeleteTaint}
                                onRowEdit={handleEditTaint}
                                cellError={taintCellError}
                                isAdditionNotAllowed
                                shouldAutoFocusOnMount
                            />
                        </>
                    )}
                </div>
                {!isTaintListEmpty && (
                    <div className="dc__border-top flex right p-16 dc__gap-12">
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
                )}
            </div>
        </Drawer>
    )
}

export default EditTaintsModal
