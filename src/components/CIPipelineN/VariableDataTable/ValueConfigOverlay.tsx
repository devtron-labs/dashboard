import { ChangeEvent } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ComponentSizeType,
    CustomInput,
    ResizableTextarea,
    SelectPicker,
    SelectPickerOptionType,
    Tooltip,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICChoicesDropdown } from '@Icons/ic-choices-dropdown.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'

import { ConfigOverlayProps, VariableDataTableActionType } from './types'
import { FILE_UPLOAD_SIZE_UNIT_OPTIONS, FORMAT_OPTIONS_MAP } from './constants'
import { testValueForNumber } from './utils'

export const ValueConfigOverlay = ({ row, handleRowUpdateAction }: ConfigOverlayProps) => {
    const { id: rowId, data, customState } = row
    const { choices, askValueAtRuntime, blockCustomValue, fileInfo } = customState

    // CONSTANTS
    const isFormatNumber = data.format.value === VariableTypeFormat.NUMBER
    const isFormatBoolOrDate =
        data.format.value === VariableTypeFormat.BOOL || data.format.value === VariableTypeFormat.DATE
    const isFormatFile = data.format.value === VariableTypeFormat.FILE

    // METHODS
    const handleAddChoices = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId,
            actionValue: (currentChoices) => [{ value: '', id: currentChoices.length, error: '' }, ...currentChoices],
        })
    }

    const handleChoiceChange = (choiceId: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const choiceValue = e.target.value
        if (isFormatNumber && !testValueForNumber(choiceValue)) {
            return
        }

        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId,
            actionValue: (currentChoices) =>
                currentChoices.map((choice) =>
                    choice.id === choiceId ? { id: choiceId, value: choiceValue } : choice,
                ),
        })
    }

    const handleChoiceDelete = (choiceId: number) => () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId,
            actionValue: (currentChoices) => currentChoices.filter(({ id }) => id !== choiceId),
        })
    }

    const handleAllowCustomInput = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT,
            rowId,
            actionValue: !blockCustomValue,
        })
    }

    const handleAskValueAtRuntime = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME,
            rowId,
            actionValue: !askValueAtRuntime,
        })
    }

    const handleFileMountChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_FILE_MOUNT,
            rowId,
            actionValue: e.target.value,
        })
    }

    const handleFileAllowedExtensionsChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_FILE_ALLOWED_EXTENSIONS,
            rowId,
            actionValue: e.target.value,
        })
    }

    const handleFileMaxSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const maxSize = e.target.value
        if (!testValueForNumber(maxSize)) {
            return
        }
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_FILE_MAX_SIZE,
            rowId,
            actionValue: {
                size: maxSize,
                unit: fileInfo.unit,
            },
        })
    }

    const handleFileSizeUnitChange = (unit: SelectPickerOptionType<number>) => {
        if (fileInfo.unit !== unit) {
            const maxSize = fileInfo.maxUploadSize
                ? (parseFloat(fileInfo.maxUploadSize) * unit.value).toString()
                : fileInfo.maxUploadSize
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_FILE_MAX_SIZE,
                rowId,
                actionValue: {
                    size: maxSize,
                    unit,
                },
            })
        }
    }

    // RENDERERS
    const renderContent = () => {
        if (isFormatFile) {
            return (
                <div className="dc__overflow-auto p-12 flex-grow-1 flexbox-col dc__gap-12">
                    <CustomInput
                        name="fileMount"
                        label="File mount path"
                        placeholder="Enter file mount path"
                        value={fileInfo.mountDir}
                        onChange={handleFileMountChange}
                        dataTestid={`file-mount-${rowId}`}
                        inputWrapClassName="w-100"
                        isRequiredField
                    />
                    <div className="flexbox-col dc__gap-6">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label className="m-0 fs-13 lh-20 cn-7 fw-4">Restrict file type</label>
                        <ResizableTextarea
                            value={fileInfo.allowedExtensions}
                            minHeight={96}
                            maxHeight={96}
                            placeholder="Enter file types separated by commas Eg. .xls, .csv, .tar"
                            onChange={handleFileAllowedExtensionsChange}
                        />
                    </div>
                    <div className="flexbox dc__align-items-center">
                        <div className="flex-grow-1">
                            <CustomInput
                                name="fileMaxSize"
                                onChange={handleFileMaxSizeChange}
                                value={fileInfo.maxUploadSize}
                                label="Restrict file size"
                                placeholder="Enter size"
                            />
                        </div>
                        <div className="dc__align-self-end">
                            <SelectPicker
                                inputId="file-max-size-unit-selector"
                                classNamePrefix="file-max-size-unit-selector"
                                value={fileInfo.unit}
                                onChange={handleFileSizeUnitChange}
                                options={FILE_UPLOAD_SIZE_UNIT_OPTIONS}
                                size={ComponentSizeType.large}
                                menuSize={ComponentSizeType.xs}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (isFormatBoolOrDate) {
            return (
                <div className="p-12 flex-grow-1">
                    <div className="dc__border-dashed br-6 p-16 flexbox-col dc__align-items-center dc__gap-12">
                        <ICInfoOutlineGrey className="icon-dim-24" />
                        <div className="w-100 dc__text-center fs-12 lh-18 flexbox-col dc__gap-2">
                            <p className="m-0 fw-6">Choices not allowed</p>
                            <p className="m-0 cn-7">{`Variable type "${FORMAT_OPTIONS_MAP[data.format.value]}" does not support choices`}</p>
                        </div>
                    </div>
                </div>
            )
        }

        if (choices.length) {
            return (
                <div className="flexbox-col dc__gap-6 pt-12 min-h-100">
                    <div className="py-4 px-12">
                        <Button
                            text="Add choice"
                            onClick={handleAddChoices}
                            dataTestId="add-choice-button"
                            startIcon={<ICAdd />}
                            variant={ButtonVariantType.text}
                            size={ComponentSizeType.small}
                        />
                    </div>
                    <div className="flexbox-col dc__gap-6 dc__overflow-auto pb-12 px-12">
                        {choices.map(({ id, value }) => (
                            <div key={id} className="flexbox dc__align-items-center dc__gap-4 w-100">
                                <CustomInput
                                    placeholder="Enter choice"
                                    name={`${id}`}
                                    value={value}
                                    onChange={handleChoiceChange(id)}
                                    dataTestid={`tag-choice-${id}`}
                                    inputWrapClassName="w-100"
                                />
                                <Button
                                    dataTestId="delete-tag-choice"
                                    ariaLabel="Delete tag choice"
                                    showAriaLabelInTippy={false}
                                    icon={<ICClose />}
                                    variant={ButtonVariantType.borderLess}
                                    size={ComponentSizeType.medium}
                                    onClick={handleChoiceDelete(id)}
                                    style={ButtonStyleType.negativeGrey}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        return (
            <div className="p-12 flex-grow-1">
                <div className="dc__border-dashed br-6 p-16 flexbox-col dc__align-items-center dc__gap-12">
                    <ICChoicesDropdown />
                    <div className="w-100 dc__text-center fs-12 lh-18 flexbox-col dc__gap-2">
                        <p className="m-0 fw-6">Set value choices</p>
                        <p className="m-0">Allow users to select a value from a pre-defined set of choices</p>
                    </div>
                    <div className="py-4 px-12">
                        <Button
                            text="Add choice"
                            onClick={handleAddChoices}
                            dataTestId="add-choice-button"
                            startIcon={<ICAdd />}
                            variant={ButtonVariantType.text}
                            size={ComponentSizeType.small}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {renderContent()}
            <div className="dc__border-top-n1 p-12 flexbox-col dc__gap-8">
                {!!choices.length && (
                    <Checkbox
                        isChecked={!blockCustomValue}
                        rootClassName="mb-0 flex top dc_max-width__max-content"
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={handleAllowCustomInput}
                        data-testid="allow-custom-input"
                    >
                        <Tooltip
                            alwaysShowTippyOnHover
                            className="w-200"
                            placement="bottom-start"
                            content={
                                <div className="fs-12 lh-18">
                                    <p className="m-0 fw-6 cn-0">Allow custom input</p>
                                    <p className="m-0 cn-50">Allow entering any value other than provided choices</p>
                                </div>
                            }
                        >
                            <div className="dc__border-dashed--n3-bottom fs-13 cn-9 lh-20">Allow Custom input</div>
                        </Tooltip>
                    </Checkbox>
                )}
                <Checkbox
                    isChecked={askValueAtRuntime}
                    rootClassName="mb-0 flex top dc_max-width__max-content"
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={handleAskValueAtRuntime}
                    data-testid="ask-value-at-runtime"
                >
                    <Tooltip
                        alwaysShowTippyOnHover
                        className="w-200"
                        placement="bottom-start"
                        content={
                            <div className="fs-12 lh-18">
                                <p className="m-0 fw-6 cn-0">Ask value at runtime</p>
                                <p className="m-0 cn-50">
                                    Value can be provided at runtime. Entered value will be pre-filled as default
                                </p>
                            </div>
                        }
                    >
                        <div className="dc__border-dashed--n3-bottom fs-13 cn-9 lh-20">Ask value at runtime</div>
                    </Tooltip>
                </Checkbox>
            </div>
        </>
    )
}
