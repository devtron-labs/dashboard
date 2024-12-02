import { ChangeEvent } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ComponentSizeType,
    CustomInput,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICChoicesDropdown } from '@Icons/ic-choices-dropdown.svg'

import { AddChoicesOverlayProps, VariableDataTableActionType } from './types'
import { validateChoice } from './utils'

export const AddChoicesOverlay = ({
    choices,
    askValueAtRuntime,
    blockCustomValue,
    rowId,
    handleRowUpdateAction,
}: AddChoicesOverlayProps) => {
    // METHODS
    const handleAddChoices = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId,
            headerKey: null,
            actionValue: (currentChoices) => [{ value: '', id: currentChoices.length, error: '' }, ...currentChoices],
        })
    }

    const handleChoiceChange = (choiceId: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const choiceValue = e.target.value
        // TODO: Rethink validation disc with product
        const error = !validateChoice(choiceValue) ? 'This is a required field' : ''
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId,
            headerKey: null,
            actionValue: (currentChoices) =>
                currentChoices.map((choice) =>
                    choice.id === choiceId ? { id: choiceId, value: choiceValue, error } : choice,
                ),
        })
    }

    const handleChoiceDelete = (choiceId: number) => () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_CHOICES,
            rowId,
            headerKey: null,
            actionValue: (currentChoices) => currentChoices.filter(({ id }) => id !== choiceId),
        })
    }

    const handleAllowCustomInput = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT,
            rowId,
            headerKey: null,
            actionValue: !blockCustomValue,
        })
    }

    const handleAskValueAtRuntime = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME,
            rowId,
            headerKey: null,
            actionValue: !askValueAtRuntime,
        })
    }

    return (
        <div className="flexbox-col w-100 mxh-300">
            {choices.length ? (
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
                        {choices.map(({ id, value, error }) => (
                            <div key={id} className="flex top left dc__gap-4 w-100">
                                <CustomInput
                                    placeholder="Enter choice"
                                    name={`${id}`}
                                    value={value}
                                    onChange={handleChoiceChange(id)}
                                    dataTestid={`tag-choice-${id}`}
                                    inputWrapClassName="w-100"
                                    error={error}
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
            ) : (
                <div className="p-12 flex-grow-1">
                    <div className="dc__border-dashed br-6 p-16 flexbox-col dc__align-items-center dc__gap-12">
                        <ICChoicesDropdown />
                        <div className="w-100 dc__text-center fs-12 lh-18">
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
            )}
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
        </div>
    )
}
