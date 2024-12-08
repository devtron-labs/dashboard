import { ChangeEvent } from 'react'

import { Checkbox, CHECKBOX_VALUE, CustomInput, ResizableTextarea, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ConfigOverlayProps, VariableDataTableActionType } from './types'

export const VariableConfigOverlay = ({ row, handleRowUpdateAction }: ConfigOverlayProps) => {
    const { id: rowId, data, customState } = row
    const { variableDescription, isVariableRequired } = customState

    // METHODS
    const handleVariableName = (e: ChangeEvent<HTMLInputElement>) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_ROW,
            rowId,
            headerKey: 'variable',
            actionValue: e.target.value,
        })
    }

    const handleVariableDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_VARIABLE_DESCRIPTION,
            rowId,
            actionValue: e.target.value,
        })
    }

    const handleVariableRequired = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_VARIABLE_REQUIRED,
            rowId,
            actionValue: !isVariableRequired,
        })
    }

    return (
        <>
            <div className="p-12 flexbox-col dc__gap-12">
                <CustomInput
                    name="variable-name"
                    onChange={handleVariableName}
                    value={data.variable.value}
                    label="Variable"
                    isRequiredField
                />
                <div className="flexbox-col dc__gap-6">
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label className="m-0 fs-13 lh-20 cn-7 fw-4">Description</label>
                    <ResizableTextarea
                        value={variableDescription}
                        minHeight={84}
                        maxHeight={84}
                        placeholder="Describe this variable"
                        onChange={handleVariableDescriptionChange}
                    />
                </div>
            </div>
            <div className="dc__border-top-n1 p-12 flexbox-col dc__gap-8">
                <Checkbox
                    isChecked={isVariableRequired}
                    rootClassName="mb-0 flex top dc_max-width__max-content"
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={handleVariableRequired}
                    data-testid="ask-value-is-required"
                >
                    <Tooltip
                        alwaysShowTippyOnHover
                        className="w-200"
                        placement="bottom-start"
                        content={
                            <div className="fs-12 lh-18">
                                <p className="m-0 fw-6 cn-0">Value is required</p>
                                <p className="m-0 cn-50">Get this tooltip from Utkarsh</p>
                            </div>
                        }
                    >
                        <div className="dc__border-dashed--n3-bottom fs-13 cn-9 lh-20">Value is required</div>
                    </Tooltip>
                </Checkbox>
            </div>
        </>
    )
}
