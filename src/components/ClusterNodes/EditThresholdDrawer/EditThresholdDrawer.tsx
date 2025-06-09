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
    Tooltip,
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
    getThresholdValidation,
} from './utils'

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

        const isThresholdLinked = !rowToUpdate.customState.isThresholdLinked

        rowToUpdate.data[ThresholdTableHeaderKeys.OPERATOR].disabled = isThresholdLinked
        rowToUpdate.data[ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD].disabled = isThresholdLinked
        rowToUpdate.customState.isThresholdLinked = isThresholdLinked

        if (isThresholdLinked) {
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
        const { isValid, cellError } = getThresholdValidation(thresholdRows)
        setThresholdTableCellError(cellError)

        if (!isValid) {
            ToastManager.showToast({
                description: 'Please resolve errors before saving',
                variant: ToastVariantType.error,
            })
            return
        }

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

    const handleThresholdLinkUnLinkMouseEnter = (id: ThresholdTableType['rows'][number]['id']) => () => {
        setThresholdRows((prev) => {
            const updatedThresholdRows = structuredClone(prev)
            const rowToUpdateIndex = updatedThresholdRows.findIndex((row) => row.id === id)
            const rowToUpdate = updatedThresholdRows[rowToUpdateIndex]

            rowToUpdate.customState.isThresholdButtonHovered = true
            updatedThresholdRows[rowToUpdateIndex] = rowToUpdate

            return updatedThresholdRows
        })
    }

    const handleThresholdLinkUnLinkMouseLeave = (id: ThresholdTableType['rows'][number]['id']) => () => {
        setThresholdRows((prev) => {
            const updatedThresholdRows = structuredClone(prev)
            const rowToUpdateIndex = updatedThresholdRows.findIndex((row) => row.id === id)
            const rowToUpdate = updatedThresholdRows[rowToUpdateIndex]

            rowToUpdate.customState.isThresholdButtonHovered = false
            updatedThresholdRows[rowToUpdateIndex] = rowToUpdate

            return updatedThresholdRows
        })
    }

    // RENDERERS
    const actionButtonRenderer: ThresholdTableType['actionButtonConfig']['renderer'] = ({
        id,
        customState: { isThresholdButtonHovered, isThresholdLinked },
    }) => {
        const showLinkIcon = isThresholdLinked ? !isThresholdButtonHovered : isThresholdButtonHovered

        return (
            <Tooltip
                alwaysShowTippyOnHover={isThresholdButtonHovered}
                content={showLinkIcon ? 'Inherit from cluster' : 'Unlink & Override'}
            >
                <div>
                    <button
                        type="button"
                        aria-label="threshold-link-unlink-button"
                        className="dc__transparent h-100 flex top py-10 px-8 dc__hover-n50"
                        onClick={handleActionButtonClick(id)}
                        onMouseEnter={handleThresholdLinkUnLinkMouseEnter(id)}
                        onMouseLeave={handleThresholdLinkUnLinkMouseLeave(id)}
                    >
                        <Icon
                            name={showLinkIcon ? 'ic-link' : 'ic-link-broken'}
                            color={isThresholdButtonHovered ? 'N900' : 'N600'}
                        />
                    </button>
                </div>
            </Tooltip>
        )
    }

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
