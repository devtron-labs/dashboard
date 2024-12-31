import { ChangeEvent, useEffect, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ComponentSizeType,
    CustomInput,
    FilePropertyTypeSizeUnit,
    PATTERNS,
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
import { importComponentFromFELibrary } from '@Components/common'

import { ConfigOverlayProps, VariableDataTableActionType } from './types'
import { FILE_UPLOAD_SIZE_UNIT_OPTIONS, FORMAT_OPTIONS_MAP } from './constants'
import { VariableDataTablePopupMenu } from './VariableDataTablePopupMenu'

const AskValueAtRuntimeCheckbox = importComponentFromFELibrary('AskValueAtRuntimeCheckbox', null, 'function')

export const ValueConfigOverlay = ({ row, handleRowUpdateAction }: ConfigOverlayProps) => {
    const { id: rowId, data, customState } = row
    const { choices: initialChoices, askValueAtRuntime, blockCustomValue, fileInfo } = customState

    // STATES
    const [choices, setChoices] = useState([])
    const [fileSize, setFileSize] = useState({ value: fileInfo.maxUploadSize, error: '' })

    // CONSTANTS
    const isFormatNumber = data.format.value === VariableTypeFormat.NUMBER
    const isFormatBoolOrDate =
        data.format.value === VariableTypeFormat.BOOL || data.format.value === VariableTypeFormat.DATE
    const isFormatFile = data.format.value === VariableTypeFormat.FILE
    const hasChoicesError = choices.some(({ error }) => !!error)
    const hasFileMountError = !fileInfo.fileMountDir
    const showIconDot = !!choices.length || askValueAtRuntime || blockCustomValue || isFormatFile

    useEffect(() => {
        setChoices(initialChoices.map((choice, id) => ({ id, value: choice, error: '' })))
    }, [data.format.value])

    // METHODS
    const handleAddChoices = () => {
        setChoices([{ value: '', id: choices.length + 1, error: '' }, ...choices])
    }

    const handleChoiceChange = (choiceId: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const choiceValue = e.target.value
        setChoices(
            choices.map((choice) =>
                choice.id === choiceId
                    ? {
                          id: choiceId,
                          value: choiceValue,
                          error:
                              isFormatNumber && !PATTERNS.NATURAL_NUMBERS.test(choiceValue)
                                  ? 'Choice is not a number'
                                  : '',
                      }
                    : choice,
            ),
        )
    }

    const handleChoiceDelete = (choiceId: number) => () => {
        setChoices(choices.filter(({ id }) => id !== choiceId))
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
        const fileMountDir = e.target.value
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_FILE_MOUNT,
            rowId,
            actionValue: fileMountDir,
        })
    }

    const handleFileAllowedExtensionsChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_FILE_ALLOWED_EXTENSIONS,
            rowId,
            actionValue: e.target.value,
        })
    }

    const handleFilePropertyChange = ({
        maxUploadSize = fileInfo.maxUploadSize,
        sizeUnit = fileInfo.sizeUnit,
    }: Partial<Pick<typeof fileInfo, 'maxUploadSize' | 'sizeUnit'>>) => {
        setFileSize({
            value: maxUploadSize,
            error: maxUploadSize && !PATTERNS.DECIMAL_NUMBERS.test(maxUploadSize) ? 'File size must be a number' : '',
        })
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_FILE_MAX_SIZE,
            rowId,
            actionValue: {
                maxUploadSize,
                sizeUnit,
            },
        })
    }

    const handleFileMaxSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFilePropertyChange({ maxUploadSize: e.target.value })
    }

    const handleFileSizeUnitChange = (unit: SelectPickerOptionType<number>) => {
        if (fileInfo.sizeUnit.value !== unit.value) {
            // MULTIPLIER IS SWITCHING BETWEEN 'KB' and 'MB'
            const unitMultiplier = unit.label === FilePropertyTypeSizeUnit.MB ? 1 / 1024 : 1024
            const maxSize = fileInfo.maxUploadSize
                ? (parseFloat(fileInfo.maxUploadSize) * unitMultiplier).toFixed(3)
                : fileInfo.maxUploadSize

            handleFilePropertyChange({ maxUploadSize: maxSize, sizeUnit: unit })
        }
    }

    const handlePopupClose = () => {
        // FILTERING EMPTY VALUES
        const filteredChoices = choices.filter(({ value }) => !!value)
        setChoices(filteredChoices)
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS,
            rowId,
            actionValue: filteredChoices.map(({ value }) => value),
        })
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
                        value={fileInfo.fileMountDir}
                        onChange={handleFileMountChange}
                        dataTestid={`file-mount-${rowId}`}
                        inputWrapClassName="w-100"
                        isRequiredField
                        error={hasFileMountError ? 'This field is required' : ''}
                        autoFocus
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
                                value={fileSize.value}
                                label="Restrict file size"
                                placeholder="Enter size"
                                error={fileSize.error}
                            />
                        </div>
                        <div className={`${fileSize.error ? 'mt-2 dc__align-self-center' : 'dc__align-self-end'}`}>
                            <SelectPicker
                                inputId="file-max-size-unit-selector"
                                classNamePrefix="file-max-size-unit-selector"
                                value={fileInfo.sizeUnit}
                                onChange={handleFileSizeUnitChange}
                                options={FILE_UPLOAD_SIZE_UNIT_OPTIONS}
                                size={ComponentSizeType.large}
                                menuSize={ComponentSizeType.xs}
                                isDisabled={!!fileSize.error}
                                menuPortalTarget={document.getElementById('visible-modal')}
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
                        {choices.map(({ id, value, error }, index) => (
                            <div key={id} className="flexbox dc__align-items-center dc__gap-4 w-100">
                                <CustomInput
                                    placeholder="Enter choice"
                                    name={`choice-${id}`}
                                    autoFocus={index === 0}
                                    value={value}
                                    onChange={handleChoiceChange(id)}
                                    dataTestid={`choice-${id}`}
                                    inputWrapClassName="w-100"
                                    error={error}
                                />
                                <div className="mt-2 dc__align-self-start">
                                    <Button
                                        dataTestId="delete-choice"
                                        ariaLabel="Delete choice"
                                        showAriaLabelInTippy={false}
                                        icon={<ICClose />}
                                        variant={ButtonVariantType.borderLess}
                                        size={ComponentSizeType.medium}
                                        onClick={handleChoiceDelete(id)}
                                        style={ButtonStyleType.negativeGrey}
                                    />
                                </div>
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
        <VariableDataTablePopupMenu
            heading={row.data.variable.value || 'Value configuration'}
            onClose={handlePopupClose}
            showIconDot={showIconDot}
            disableClose={
                (row.data.format.value === VariableTypeFormat.FILE && (hasFileMountError || !!fileSize.error)) ||
                (row.data.format.value === VariableTypeFormat.NUMBER && hasChoicesError)
            }
            placement="left"
        >
            <>
                {renderContent()}
                {(choices.length || AskValueAtRuntimeCheckbox) && (
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
                                        <div className="fs-12 lh-18 flexbox-col dc__gap-2">
                                            <p className="m-0 fw-6 cn-0">Allow custom input</p>
                                            <p className="m-0 cn-50">
                                                Allow entering any value other than provided choices
                                            </p>
                                        </div>
                                    }
                                >
                                    <div className="dc__border-dashed--n3-bottom fs-13 cn-9 lh-20">
                                        Allow Custom input
                                    </div>
                                </Tooltip>
                            </Checkbox>
                        )}
                        {AskValueAtRuntimeCheckbox && (
                            <AskValueAtRuntimeCheckbox
                                isChecked={askValueAtRuntime}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={handleAskValueAtRuntime}
                            />
                        )}
                    </div>
                )}
            </>
        </VariableDataTablePopupMenu>
    )
}
