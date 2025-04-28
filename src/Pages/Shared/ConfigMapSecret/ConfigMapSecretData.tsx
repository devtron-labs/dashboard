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

import { ChangeEvent, useEffect, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CMSecretExternalType,
    CODE_EDITOR_RADIO_STATE,
    CodeEditor,
    ComponentSizeType,
    configMapSecretMountDataMap,
    convertKeyValuePairToYAML,
    convertYAMLToKeyValuePair,
    isCodeMirrorEnabled,
    KeyValueTable,
    KeyValueTableData,
    MODES,
    noop,
    OverrideMergeStrategyType,
    SelectPickerOptionType,
    StyledRadioGroup,
    ToastManager,
    ToastVariantType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { ReactComponent as HideIcon } from '@Icons/ic-visibility-off.svg'
import { importComponentFromFELibrary } from '@Components/common'

import {
    CODE_EDITOR_RADIO_STATE_VALUE,
    CONFIG_MAP_SECRET_REQUIRED_FIELD_ERROR,
    DATA_HEADER_MAP,
    sampleJSONs,
    VIEW_MODE,
} from './constants'
import { externalTypeSecretCodeEditorDataHeaders, renderYamlInfoText } from './helpers'
import { ConfigMapSecretDataProps } from './types'
import {
    getCMCSExpressEditComparisonDataDiffConfig,
    getConfigMapSecretKeyValueTableRows,
    getConfigMapSecretKeyValueTableValidationSchema,
    getExpressEditComparisonViewLHS,
    getLockedYamlString,
} from './utils'

const ExpressEditDiffEditor = importComponentFromFELibrary('ExpressEditDiffEditor', null, 'function')

export const ConfigMapSecretData = ({
    useFormProps,
    isUnAuthorized,
    isESO,
    isHashiOrAWS,
    readOnly,
    isPatchMode,
    hasPublishedConfig,
    isExpressEditView,
    isExpressEditComparisonView,
    draftData,
    publishedConfigMapSecretData,
    hidePatchOption,
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
            hasPublishedConfig,
        }),
    )

    // CONSTANTS
    const isLocked = data.isSecret && (secretMode || (data.externalType === '' && isUnAuthorized))
    const isSelectedTypeVolume =
        data.externalType === '' && data.selectedType === configMapSecretMountDataMap.volume.value

    // METHODS
    const onMergeStrategySelect = (newValue: SelectPickerOptionType) => {
        handleMergeStrategyChange(newValue.value as OverrideMergeStrategyType)
    }

    const keyValueTableHandleChange = (onChange: (value: unknown) => void) => (keyValueData: KeyValueTableData[]) => {
        // call useForm register 'onChange' method to update the form data value
        onChange(keyValueData)
        // Convert the current key-value data to YAML format and set it in the 'yaml' field.
        setValue('yaml', convertKeyValuePairToYAML(keyValueData), { shouldDirty: true })
    }

    const keyValueHandleError = (err: boolean) => {
        // Sets the useForm 'hasCurrentDataErr' field, this is used while validation to block save action if GUI has errors.
        setValue('hasCurrentDataErr', err)
    }

    /** Toggles between the secret mode (show/hide values) */
    const toggleSecretMode = () => setSecretMode(!secretMode)

    /**
     * Toggles the editor mode between YAML view and key-value pair view.
     *
     * @param mode - The selected mode to switch to, either YAML or key-value pair view.
     *
     * @remarks
     * - This function ensures that there are no validation errors before switching modes.
     * - If there are validation errors in `yaml` or `currentData` that are not equal to the `NO_DATA_ERROR`,
     *   a toast notification is displayed, and the mode switch is prevented.
     * - The function uses `setValue` from `useForm` to update the `yamlMode` state without marking the form as dirty.
     *   This is because switching modes does not alter the data, and the dirty state is unnecessary.
     *
     * @throws Will display a toast notification if there are unresolved validation errors.
     * ```
     */
    const toggleYamlMode = (mode: (typeof VIEW_MODE)[keyof typeof VIEW_MODE]) => {
        // The selected mode from the event (either YAML view or key-value pair view).

        // Check if there are any errors in 'yaml' or 'currentData' and ensure they are not equal to the 'NO_DATA_ERROR' error.
        const hasDataError =
            data.hasCurrentDataErr ||
            ((errors.yaml || errors.currentData) &&
                (errors.yaml?.[0] || errors.currentData?.[0]) !== CONFIG_MAP_SECRET_REQUIRED_FIELD_ERROR)

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
        setValue('yamlMode', mode === VIEW_MODE.YAML)
    }

    const handleGuiYamlSwitch = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        toggleYamlMode(value as (typeof VIEW_MODE)[keyof typeof VIEW_MODE])
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
                hasPublishedConfig,
            }),
        )
    }

    // USE-EFFECTS
    useEffect(() => {
        // Switch to YAML mode if the user is in the express edit comparison view.
        if (isExpressEditComparisonView) {
            toggleYamlMode(VIEW_MODE.YAML)
        }

        // Set the initial state of the express edit comparison view LHS, whenever the isExpressEditComparisonView changes.
        // This is used to show the draft data in the comparison view by default on opening.
        setExpressEditComparisonViewLHS(
            getExpressEditComparisonViewLHS({
                isDraft: true,
                draftData,
                publishedConfigMapSecretData,
                isSecret: data.isSecret,
                hasPublishedConfig,
            }),
        )
    }, [isExpressEditComparisonView])

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
                        onChange={handleGuiYamlSwitch}
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
                    hidePatchOption,
                })}
                readOnly={readOnly}
                lhsEditor={{
                    value: expressEditComparisonViewLHS?.yaml || '',
                }}
                rhsEditor={{
                    value: getCodeEditorValue(),
                    onChange: !isLocked && !data.isResolvedData ? onChange : noop,
                }}
                showDraftOption={!!draftData}
                handleCompareWithChange={handleExpressEditCompareWithChange}
                hideEditor={{
                    lhs: expressEditComparisonViewLHS?.external,
                    rhs: data.external,
                }}
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
                    {!isCodeMirrorEnabled() &&
                        codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA &&
                        errors[codeEditorFormKey] && (
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
                    key={`${isExpressEditView}-${data.isResolvedData}`}
                    isAdditionNotAllowed={secretMode || data.yamlMode || data.external}
                    readOnly={readOnly || secretMode}
                    headerLabel={{
                        key: isSelectedTypeVolume ? 'File Name' : 'Key',
                        value: isSelectedTypeVolume ? 'File Content' : 'Value',
                    }}
                    rows={getConfigMapSecretKeyValueTableRows(data.currentData)}
                    placeholder={{
                        key: 'Enter Key',
                        value: 'Enter Value',
                    }}
                    onChange={keyValueTableHandleChange(onChange)}
                    maskValue={{
                        value: isLocked,
                    }}
                    showError
                    validationSchema={getConfigMapSecretKeyValueTableValidationSchema}
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

    const externalExpressEditEditor = () => {
        if (data.external && isExpressEditComparisonView) {
            return renderCodeEditor({ sheBangText: '' })
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
            {externalExpressEditEditor()}
        </div>
    )
}
