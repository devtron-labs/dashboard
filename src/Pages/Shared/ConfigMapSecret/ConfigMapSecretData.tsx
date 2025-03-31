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

import { ChangeEvent, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CMSecretExternalType,
    CodeEditor,
    ComponentSizeType,
    KeyValueConfig,
    KeyValueTable,
    noop,
    StyledRadioGroup,
    ToastManager,
    ToastVariantType,
    YAMLStringify,
    convertKeyValuePairToYAML,
    configMapSecretMountDataMap,
    convertYAMLToKeyValuePair,
    CODE_EDITOR_RADIO_STATE,
    PATTERNS,
    MODES,
    OverrideMergeStrategyType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { ReactComponent as HideIcon } from '@Icons/ic-visibility-off.svg'
import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { importComponentFromFELibrary } from '@Components/common'

import {
    CODE_EDITOR_RADIO_STATE_VALUE,
    CONFIG_MAP_SECRET_NO_DATA_ERROR,
    DATA_HEADER_MAP,
    sampleJSONs,
    VIEW_MODE,
} from './constants'
import { externalTypeSecretCodeEditorDataHeaders, renderYamlInfoText } from './helpers'
import {
    getCMCSExpressEditComparisonDataDiffConfig,
    getExpressEditComparisonViewLHS,
    getLockedYamlString,
} from './utils'
import { ConfigMapSecretDataProps } from './types'

const ExpressEditDiffEditor = importComponentFromFELibrary('ExpressEditDiffEditor', null, 'function')

export const ConfigMapSecretData = ({
    useFormProps,
    isUnAuthorized,
    isESO,
    isHashiOrAWS,
    readOnly,
    isPatchMode,
    isExpressEditComparisonView,
    draftData,
    publishedConfigMapSecretData,
    handleMergeStrategyChange,
}: ConfigMapSecretDataProps) => {
    // USE FORM PROPS
    const { data, errors, setValue, register } = useFormProps

    // STATES
    const [secretMode, setSecretMode] = useState(false)
    const [codeEditorRadio, setCodeEditorRadio] = useState(CODE_EDITOR_RADIO_STATE.DATA)
    const [expressEditComparisonViewLHS, setExpressEditComparisonViewLHS] = useState<typeof data>(
        getExpressEditComparisonViewLHS({
            isDraft: true,
            draftData,
            publishedConfigMapSecretData,
            isSecret: data.isSecret,
        }),
    )

    // CONSTANTS
    const isLocked = data.isSecret && (secretMode || (data.externalType === '' && isUnAuthorized))
    const isSelectedTypeVolume =
        data.externalType === '' && data.selectedType === configMapSecretMountDataMap.volume.value

    // METHODS & CONFIGURATIONS
    const config: KeyValueConfig<'k' | 'v'> = {
        headers: [
            {
                label: isSelectedTypeVolume ? 'File Name' : 'Key',
                key: 'k',
            },
            {
                label: isSelectedTypeVolume ? 'File Content' : 'Value',
                key: 'v',
            },
        ],
        rows: data.currentData.map(({ k, v, id }) => ({
            data: {
                k: {
                    value: k,
                },
                v: {
                    value: typeof v === 'object' ? YAMLStringify(v) : v.toString(),
                },
            },
            id,
        })),
    }

    const onMergeStrategySelect = (newValue: SelectPickerOptionType) => {
        handleMergeStrategyChange(newValue.value as OverrideMergeStrategyType)
    }

    const keyValueTableHandleChange =
        (onChange: (value: unknown) => void) => (rowId: string | number, headerKey: string, value: string) => {
            // - When data is changed from the YAML editor to the GUI, IDs are mapped to indices (numbers).
            // - When data is added via the GUI, IDs are created internally by the GUI editor as strings.
            const _currentData = data.currentData.reduce(
                (acc, currentData) => {
                    if (currentData.id === rowId) {
                        // If the item is found, update it with the new value and reset errors.
                        acc.found = true
                        acc.updatedData.push({
                            ...currentData,
                            [headerKey]: value,
                        })
                    } else {
                        // If the item is not the one we're looking for, just add it as is.
                        acc.updatedData.push(currentData)
                    }
                    return acc
                },
                { updatedData: [], found: false },
            )

            // If the item is not found, it means it's a new entry added via the GUI editor.
            // Create a new data object and add it to the current data state.
            if (!_currentData.found) {
                _currentData.updatedData.push({
                    k: '',
                    v: '',
                    [headerKey]: value,
                    id: rowId,
                })
            }

            // call useForm register 'onChange' method to update the form data value
            onChange(_currentData.updatedData)
            // Convert the current key-value data to YAML format and set it in the 'yaml' field.
            setValue('yaml', convertKeyValuePairToYAML(_currentData.updatedData), { shouldDirty: true })
        }

    const keyValueHandleDelete = (onChange: (e: unknown) => void) => (rowId: string | number) => {
        // Create a new array by filtering out the item with the matching rowId.
        const _currentData = data.currentData.filter(({ id }) => id !== rowId)
        // call useForm register 'onChange' method to update the form data value
        onChange(_currentData)
        // Convert the current key-value data to YAML format and set it in the 'yaml' field.
        setValue('yaml', convertKeyValuePairToYAML(_currentData), { shouldDirty: true })
    }

    const keyValueHandleError = (err: boolean) => {
        // Sets the useForm 'hasCurrentDataErr' field, this is used while validation to block save action if GUI has errors.
        setValue('hasCurrentDataErr', err)
    }

    /** Toggles between the secret mode (show/hide values) */
    const toggleSecretMode = () => setSecretMode(!secretMode)

    /**
     * Toggles between YAML view mode and key-value pair mode in the editor.
     *
     * @param e - The change event triggered by switching modes (YAML or key-value pair).
     * @returns The current mode if there are unresolved errors, or the selected mode.
     */
    const toggleYamlMode = (e: ChangeEvent<HTMLInputElement>) => {
        // The selected mode from the event (either YAML view or key-value pair view).
        const yamlMode = e.target.value
        // Check if there are any errors in 'yaml' or 'currentData' and ensure they are not equal to the 'NO_DATA_ERROR' error.
        const hasDataError =
            data.hasCurrentDataErr ||
            ((errors.yaml || errors.currentData) &&
                (errors.yaml?.[0] || errors.currentData?.[0]) !== CONFIG_MAP_SECRET_NO_DATA_ERROR)

        // If there are validation errors, show a toast notification and return the current mode without switching.
        if (hasDataError) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve the errors before switching editor mode.',
            })

            // Return to prevent switching due to errors.
            return
        }

        /*
         * We use setValue instead of the register method from useForm to avoid marking the form as dirty when switching modes. \
         * Since the data does not change during mode switches, the dirty state is unnecessary.
         * Additionally, we require the form state for data processing upon submission, so we're not using useState.
         */
        // Set 'yamlMode' true if the selected mode is YAML, otherwise return false.
        setValue('yamlMode', yamlMode === VIEW_MODE.YAML)
    }

    const handleCodeEditorRadioChange = (e: ChangeEvent<HTMLInputElement>) =>
        setCodeEditorRadio(e.target.value as CODE_EDITOR_RADIO_STATE)

    /**
     * Determines the key to be used for the code editor form based on the current configuration.
     * @returns The key in the `data` object corresponding to the selected mode (ESO, HashiCorp/AWS, or YAML).
     */
    const getCodeEditorFormKey = (): keyof typeof data => {
        // If ESO is enabled, return 'esoSecretYaml'.
        if (isESO) {
            return 'esoSecretYaml'
        }
        // If using HashiCorp or AWS, return 'secretDataYaml'.
        if (isHashiOrAWS) {
            return 'secretDataYaml'
        }
        // Otherwise, default to 'yaml'.
        return 'yaml'
    }

    const getCodeEditorValue = () => {
        if (codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE) {
            return YAMLStringify(sampleJSONs[data.externalType] || sampleJSONs[DATA_HEADER_MAP.DEFAULT])
        }

        const codeEditorValue = isLocked
            ? getLockedYamlString(data[getCodeEditorFormKey()] as string)
            : (data[getCodeEditorFormKey()] as string)

        return codeEditorValue
    }

    const handleExpressEditCompareWithChange = (isDraft: boolean) => {
        setExpressEditComparisonViewLHS(
            getExpressEditComparisonViewLHS({
                isDraft,
                draftData,
                publishedConfigMapSecretData,
                isSecret: data.isSecret,
            }),
        )
    }

    // RENDERERS
    const renderDataEditorSelector = () => {
        if (
            (data.isSecret && data.externalType === CMSecretExternalType.KubernetesSecret) ||
            (!data.isSecret && data.external) ||
            isExpressEditComparisonView
        ) {
            return null
        }

        return (
            <div className="flex left dc__gap-12">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="m-0 fs-13 lh-20 dc__required-field">{isPatchMode ? 'Patch data' : 'Data'}</label>
                {!isESO && !isHashiOrAWS && (
                    <StyledRadioGroup
                        className="gui-yaml-switch"
                        disabled={false}
                        initialTab={data.yamlMode ? VIEW_MODE.YAML : VIEW_MODE.GUI}
                        name="yamlMode"
                        /** @note Check comment inside `toggleYamlMode` to see why we haven't used register method from useForm */
                        onChange={toggleYamlMode}
                    >
                        {Object.keys(VIEW_MODE).map((key) =>
                            VIEW_MODE[key] !== VIEW_MODE.MANIFEST ? (
                                <StyledRadioGroup.Radio key={key} value={VIEW_MODE[key]} canSelect={false}>
                                    {VIEW_MODE[key].toUpperCase()}
                                </StyledRadioGroup.Radio>
                            ) : null,
                        )}
                    </StyledRadioGroup>
                )}
            </div>
        )
    }

    const renderSecretShowHide = (showDivider = true) => {
        const isDisabled = !!errors.yaml

        return (
            data.isSecret &&
            !data.external &&
            !isUnAuthorized && (
                <>
                    <Button
                        dataTestId="toggle-show-hide-button"
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.neutral}
                        size={ComponentSizeType.small}
                        onClick={toggleSecretMode}
                        disabled={isDisabled}
                        text={secretMode ? ' Show/Edit values' : 'Hide values'}
                        startIcon={secretMode ? <ICPencil /> : <HideIcon />}
                    />
                    {showDivider && <div className="dc__divider" />}
                </>
            )
        )
    }

    const renderCodeEditor = ({ sheBangText }: { sheBangText: string }) => {
        const codeEditorFormKey = getCodeEditorFormKey()
        const { onChange, onFocus } = register(codeEditorFormKey, {
            sanitizeFn: (value: string) => {
                if (codeEditorFormKey === 'yaml') {
                    // Convert the YAML data to key-value pairs and set it in 'currentData'.
                    setValue('currentData', convertYAMLToKeyValuePair(value), { shouldDirty: true })
                }
                return value
            },
            isCustomComponent: true,
        })

        return isExpressEditComparisonView ? (
            <ExpressEditDiffEditor
                dataDiffConfig={getCMCSExpressEditComparisonDataDiffConfig({
                    lhs: expressEditComparisonViewLHS,
                    rhs: data,
                    onMergeStrategySelect,
                })}
                readOnly={readOnly}
                lhsEditor={{
                    value: expressEditComparisonViewLHS.yaml,
                }}
                rhsEditor={{
                    value: getCodeEditorValue(),
                    onChange: !isLocked && !data.isResolvedData ? onChange : noop,
                }}
                showDraftOption={!!draftData}
                handleCompareWithChange={handleExpressEditCompareWithChange}
            />
        ) : (
            <CodeEditor.Container overflowHidden>
                <CodeEditor
                    key={codeEditorRadio}
                    mode={MODES.YAML}
                    readOnly={
                        readOnly || isHashiOrAWS || isLocked || codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE
                    }
                    codeEditorProps={{
                        value: getCodeEditorValue(),
                        // Skip calling onChange if resolvedData exists
                        onChange: !isLocked && !data.isResolvedData ? onChange : noop,
                        onFocus,
                        inline: true,
                        adjustEditorHeightToContent: true,
                        shebang: sheBangText,
                    }}
                    codeMirrorProps={{
                        value: getCodeEditorValue(),
                        // Skip calling onChange if resolvedData exists
                        onChange: !isLocked && !data.isResolvedData ? onChange : noop,
                        onFocus,
                        height: '100%',
                        shebang: sheBangText,
                    }}
                >
                    <CodeEditor.Header>
                        <div className="flex dc__content-space">
                            {!isHashiOrAWS && data.external ? (
                                <StyledRadioGroup
                                    name="code-editor-radio"
                                    className="gui-yaml-switch"
                                    initialTab={codeEditorRadio}
                                    onChange={handleCodeEditorRadioChange}
                                >
                                    {Object.keys(CODE_EDITOR_RADIO_STATE).map((key) => (
                                        <StyledRadioGroup.Radio key={key} value={CODE_EDITOR_RADIO_STATE[key]}>
                                            {CODE_EDITOR_RADIO_STATE_VALUE[key]}
                                        </StyledRadioGroup.Radio>
                                    ))}
                                </StyledRadioGroup>
                            ) : null}
                            <div className="flex right dc__gap-8 ml-auto">
                                {renderSecretShowHide()}
                                <div className="flex p-4">
                                    <CodeEditor.Clipboard />
                                </div>
                            </div>
                        </div>
                    </CodeEditor.Header>
                    {codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA && errors[codeEditorFormKey] && (
                        <div className="flex left px-16 py-8 dc__gap-8 bcr-1 cr-5 fs-12 lh-20">
                            <ICErrorExclamation className="icon-dim-16 dc__no-shrink" />
                            <p className="m-0">{errors[codeEditorFormKey]}</p>
                        </div>
                    )}
                </CodeEditor>
                {!data.external && data.yamlMode && renderYamlInfoText()}
            </CodeEditor.Container>
        )
    }

    const renderGUIEditor = () => {
        const { onChange } = register('currentData', { isCustomComponent: true })

        return (
            <div>
                <KeyValueTable
                    key={data.isResolvedData.toString()}
                    isAdditionNotAllowed={secretMode || data.yamlMode || data.external}
                    readOnly={readOnly || secretMode}
                    isSortable
                    config={config}
                    placeholder={{
                        k: 'Enter Key',
                        v: 'Enter Value',
                    }}
                    onChange={keyValueTableHandleChange(onChange)}
                    maskValue={{
                        v: isLocked,
                    }}
                    onDelete={keyValueHandleDelete(onChange)}
                    showError
                    validationSchema={(value, key) => {
                        if (key === 'k' && value) {
                            const isValid = new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(value)
                            return isValid
                        }
                        return true
                    }}
                    errorMessages={[
                        'Can only contain alphanumeric chars and ( - ), ( _ ), ( . )',
                        'Spaces not allowed',
                    ]}
                    onError={keyValueHandleError}
                    headerComponent={renderSecretShowHide(false)}
                    validateEmptyKeys
                    validateDuplicateKeys
                />
            </div>
        )
    }

    const externalSecretEditor = () => {
        if ((isHashiOrAWS || isESO) && data.yamlMode) {
            return renderCodeEditor({
                sheBangText:
                    codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA
                        ? '#Check sample for usage.'
                        : externalTypeSecretCodeEditorDataHeaders[data.externalType] ||
                          externalTypeSecretCodeEditorDataHeaders[DATA_HEADER_MAP.DEFAULT],
            })
        }

        return null
    }

    return (
        <div className="flex-grow-1 flexbox-col dc__gap-12">
            {renderDataEditorSelector()}
            {!data.external &&
                (data.yamlMode
                    ? renderCodeEditor({
                          sheBangText: '#key: value',
                      })
                    : renderGUIEditor())}
            {externalSecretEditor()}
        </div>
    )
}
