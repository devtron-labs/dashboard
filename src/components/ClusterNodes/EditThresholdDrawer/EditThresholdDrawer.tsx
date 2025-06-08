import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Drawer,
    DynamicDataTable,
    Icon,
    noop,
    post,
    showError,
    stopPropagation,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { NODE_RESOURCE_DEFAULT_THRESHOLD } from '../constants'
import { THRESHOLD_TABLE_HEADERS, THRESHOLD_TABLE_OPERATOR_OPTIONS } from './constants'
import {
    EditThresholdDrawerProps,
    SaveNodeThresholdPayload,
    ThresholdTableHeaderKeys,
    ThresholdTableType,
} from './types'
import {
    getInitialThresholdTableCellError,
    getSaveNodeThresholdPayloadData,
    getThresholdTableCellValidation,
    getThresholdTableRows,
} from './utils'

import './styles.scss'

export const EditThresholdDrawer = ({
    cpuData,
    memoryData,
    nodeDetail,
    clusterId,
    nodeName,
    closeDrawer,
}: EditThresholdDrawerProps) => {
    // STATES
    const [thresholdRows, setThresholdRows] = useState<ThresholdTableType['rows']>(
        getThresholdTableRows({ cpuData, memoryData, nodeDetail }),
    )
    const [thresholdTableCellError, setThresholdTableCellError] = useState<ThresholdTableType['cellError']>(
        getInitialThresholdTableCellError(thresholdRows),
    )
    const [isSavingThreshold, setIsSavingThreshold] = useState(false)

    // HANDLERS
    const handleClose = () => closeDrawer()

    const handleActionButtonClick = (id: ThresholdTableType['rows'][number]['id']) => () => {
        const updatedThresholdRows = structuredClone(thresholdRows)
        const rowToUpdateIndex = updatedThresholdRows.findIndex((row) => row.id === id)
        const rowToUpdate = updatedThresholdRows[rowToUpdateIndex]

        const isThresholdEditable = !rowToUpdate.customState.isThresholdEditable

        rowToUpdate.data[ThresholdTableHeaderKeys.OPERATOR].disabled = !isThresholdEditable
        rowToUpdate.data[ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD].disabled = !isThresholdEditable
        rowToUpdate.customState.isThresholdEditable = isThresholdEditable

        if (!isThresholdEditable) {
            rowToUpdate.data[ThresholdTableHeaderKeys.OPERATOR].value = THRESHOLD_TABLE_OPERATOR_OPTIONS[0].value
            rowToUpdate.data[ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD].value =
                `${NODE_RESOURCE_DEFAULT_THRESHOLD.value}%`
        }

        updatedThresholdRows[rowToUpdateIndex] = rowToUpdate
        setThresholdRows(updatedThresholdRows)

        const updatedThresholdTableCellError = structuredClone(thresholdTableCellError)
        updatedThresholdTableCellError[id][ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD] =
            getThresholdTableCellValidation(rowToUpdate, ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD)
        setThresholdTableCellError(updatedThresholdTableCellError)
    }

    const handleThresholdRowEdit: ThresholdTableType['onRowEdit'] = ({ id }, headerKey, value) => {
        const updatedThresholdRows = structuredClone(thresholdRows)
        const rowToUpdateIndex = updatedThresholdRows.findIndex((row) => row.id === id)
        const rowToUpdate = updatedThresholdRows[rowToUpdateIndex]

        rowToUpdate.data[headerKey].value = value
        updatedThresholdRows[rowToUpdateIndex] = rowToUpdate
        setThresholdRows(updatedThresholdRows)

        const updatedThresholdTableCellError = structuredClone(thresholdTableCellError)
        updatedThresholdTableCellError[id][headerKey] = getThresholdTableCellValidation(rowToUpdate, headerKey)
        setThresholdTableCellError(updatedThresholdTableCellError)
    }

    const handleSaveThreshold = async () => {
        setIsSavingThreshold(true)

        try {
            await post<void, SaveNodeThresholdPayload>(URLS.SAVE_NODE_THRESHOLD, {
                clusterId,
                nodeName,
                data: getSaveNodeThresholdPayloadData(thresholdRows),
            })

            ToastManager.showToast({
                description: 'Node thresholds saved successfully',
                variant: ToastVariantType.success,
            })

            setIsSavingThreshold(false)
            closeDrawer(true)
        } catch (err) {
            setIsSavingThreshold(false)
            showError(err)
        }
    }

    // RENDERERS
    const actionButtonRenderer: ThresholdTableType['actionButtonConfig']['renderer'] = ({ id, customState }) => (
        <button
            type="button"
            aria-label="make-threshold-editable"
            className={`edit-threshold-action-button dc__transparent h-100 flex top py-10 px-8 ${customState.isThresholdEditable ? 'edit-threshold-action-button--editable dc__hover-r50' : 'dc__hover-n50'}`}
            onClick={handleActionButtonClick(id)}
        >
            <Icon name={customState.isThresholdEditable ? 'ic-close-small' : 'ic-swap'} color="N600" />
        </button>
    )

    return (
        <Drawer position="right" width="800px" onEscape={handleClose}>
            <div className="h-100 bg__primary flexbox-col" onClick={stopPropagation}>
                <div className="px-20 pt-12 pb-11 border__primary--bottom flex dc__content-space">
                    <h2 className="m-0 fs-16 lh-24 fw-6 cn-9">Edit Resource Threshold</h2>
                    <Button
                        dataTestId="close-edit-threshold-drawer"
                        ariaLabel="close-edit-threshold-drawer"
                        showAriaLabelInTippy={false}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        icon={<Icon name="ic-close-large" color={null} />}
                        onClick={handleClose}
                    />
                </div>
                <div className="flex-grow-1 p-20">
                    <DynamicDataTable
                        headers={THRESHOLD_TABLE_HEADERS}
                        rows={thresholdRows}
                        onRowEdit={handleThresholdRowEdit}
                        onRowAdd={noop}
                        onRowDelete={noop}
                        cellError={thresholdTableCellError}
                        actionButtonConfig={{
                            key: ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD,
                            position: 'end',
                            renderer: actionButtonRenderer,
                        }}
                        isAdditionNotAllowed
                        isDeletionNotAllowed
                    />
                </div>
                <div className="flex right dc__gap-12 px-20 pb-12 pt-11 border__primary--top">
                    <Button
                        dataTestId="edit-threshold-drawer-cancel-btn"
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                        text="Cancel"
                        onClick={handleClose}
                    />
                    <Button
                        dataTestId="edit-threshold-drawer-save-btn"
                        text="Save"
                        isLoading={isSavingThreshold}
                        onClick={handleSaveThreshold}
                    />
                </div>
            </div>
        </Drawer>
    )
}
