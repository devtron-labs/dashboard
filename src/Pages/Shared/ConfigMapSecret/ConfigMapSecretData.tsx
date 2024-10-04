import { ChangeEvent, useState } from 'react'
import {
    CodeEditor,
    KeyValueConfig,
    KeyValueTable,
    noop,
    StyledRadioGroup,
    ToastManager,
    ToastVariantType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { ReactComponent as HideIcon } from '@Icons/ic-visibility-off.svg'
import { Info } from '@Components/common'
import { PATTERNS } from '@Config/constants'

import {
    CODE_EDITOR_RADIO_STATE,
    CODE_EDITOR_RADIO_STATE_VALUE,
    CONFIG_MAP_SECRET_NO_DATA_ERROR,
    DATA_HEADER_MAP,
    sampleJSONs,
    VIEW_MODE,
} from './constants'
import { externalTypeSecretCodeEditorDataHeaders, renderYamlInfoText } from './helpers'
import { convertKeyValuePairToYAML, convertYAMLToKeyValuePair, getLockedYamlString } from './utils'
import { CMSecretExternalType, ConfigMapSecretDataProps } from './types'

export const ConfigMapSecretData = ({
    useFormProps,
    isUnAuthorized,
    isESO,
    isHashiOrAWS,
}: ConfigMapSecretDataProps) => {
    // USE FORM PROPS
    const { data, errors, setValue, register } = useFormProps

    // STATES
    const [secretMode, setSecretMode] = useState(false)
    const [codeEditorRadio, setCodeEditorRadio] = useState(CODE_EDITOR_RADIO_STATE.DATA)

    // CONSTANTS
    const isLocked = data.isSecret && (secretMode || (data.externalType === '' && isUnAuthorized))

    // METHODS & CONFIGURATIONS
    const config: KeyValueConfig<'k' | 'v'> = {
        headers: [
            {
                label: data.externalType === '' && data.selectedType === 'volume' ? 'File Name' : 'Key',
                key: 'k',
            },
            {
                label: data.externalType === '' && data.selectedType === 'volume' ? 'File Content' : 'Value',
                key: 'v',
            },
        ],
        rows: data.currentData.map(({ k, v, id }) => ({
            data: {
                k: {
                    value: k,
                },
                v: {
                    value: v,
                },
            },
            id,
        })),
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
                            keyError: '',
                            valueError: '',
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
                    keyError: '',
                    valueError: '',
                    id: rowId,
                })
            }

            // call useForm register 'onChange' method to update the form data value
            onChange(_currentData.updatedData)
        }

    const keyValueHandleDelete = (onChange: (e: unknown) => void) => (rowId: string | number) => {
        // Create a new array by filtering out the item with the matching rowId.
        const _currentData = data.currentData.filter(({ id }) => id !== rowId)
        // call useForm register 'onChange' method to update the form data value
        onChange(_currentData)
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
        // Check if there are any errors in 'yaml' or 'currentData' and ensure they are not equal to the '__NO_DATA__' error.
        const hasDataError =
            (errors.yaml || errors.currentData) &&
            (errors.yaml || errors.currentData) !== CONFIG_MAP_SECRET_NO_DATA_ERROR

        // If there are validation errors, show a toast notification and return the current mode without switching.
        if (hasDataError) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve the errors before switching editor mode.', // Error message in the toast.
            })

            // Return to prevent switching due to errors.
            return
        }

        // If the selected mode is YAML, convert the current key-value data to YAML format and set it in the 'yaml' field.
        if (yamlMode === VIEW_MODE.YAML) {
            setValue('yaml', convertKeyValuePairToYAML(data.currentData), { shouldDirty: true })
        } else {
            // If the selected mode is key-value pairs, convert the YAML data to key-value pairs and set it in 'currentData'.
            setValue('currentData', convertYAMLToKeyValuePair(data.yaml), { shouldDirty: true })
        }

        /*
         * We use setValue instead of the register method from useForm to avoid marking the form as dirty when switching modes. \
         * Since the data doesn't change during mode switches, the dirty state is unnecessary.
         * Additionally, we require the form state for data processing upon submission, so we're not using useState.
         */
        // Set 'yamlMode' true if the selected mode is YAML, otherwise return false.
        setValue('yamlMode', yamlMode === VIEW_MODE.YAML)
    }

    const handleCodeEditorRadioChange = (e: ChangeEvent<HTMLInputElement>) => setCodeEditorRadio(e.target.value)

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

        return isLocked
            ? getLockedYamlString(data[getCodeEditorFormKey()] as string)
            : (data[getCodeEditorFormKey()] as string)
    }

    // RENDERERS
    const renderDataEditorSelector = () => {
        if (
            (data.isSecret && data.externalType === CMSecretExternalType.KubernetesSecret) ||
            (!data.isSecret && data.external)
        ) {
            return null
        }

        return (
            <div className="flex left dc__gap-12">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="m-0 fs-13 lh-20 dc__required-field">Data</label>
                {!isESO && !isHashiOrAWS && (
                    <StyledRadioGroup
                        className="gui-yaml-switch"
                        disabled={false}
                        initialTab={data.yamlMode ? VIEW_MODE.YAML : VIEW_MODE.GUI}
                        name="yamlMode"
                        // Check comment inside `toggleYamlMode` to see why we haven't used register method from useForm
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
                    <button
                        type="button"
                        className={`dc__unset-button-styles edit flex cursor cn-7 fw-6 dc__gap-6 ${isDisabled ? 'cursor-not-allowed dc__opacity-0_5' : ''}`}
                        onClick={toggleSecretMode}
                        disabled={isDisabled}
                    >
                        {secretMode ? (
                            <>
                                <ICPencil className="icon-dim-16 scn-7" />
                                Show/Edit values
                            </>
                        ) : (
                            <>
                                <HideIcon className="icon-dim-16 scn-7" />
                                Hide values
                            </>
                        )}
                    </button>
                    {showDivider && <div className="dc__divider" />}
                </>
            )
        )
    }

    const renderCodeEditor = ({ sheBangText }: { sheBangText: string }) => {
        const { onChange, onFocus } = register(getCodeEditorFormKey(), null, { isCustomComponent: true })

        return (
            <div className="dc__border br-4 dc__overflow-hidden">
                <CodeEditor
                    value={getCodeEditorValue()}
                    onChange={!isLocked && codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA ? onChange : noop}
                    onFocus={onFocus}
                    mode="yaml"
                    inline
                    height={350}
                    shebang={sheBangText}
                    readOnly={isLocked || codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE}
                >
                    <CodeEditor.Header className="configmap-secret-form__code-editor flex right dc__gap-6 py-6 px-12 bcn-50 dc__border-bottom fs-13 lh-20">
                        {data.external ? (
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
                        <div className="flexbox dc__align-items-center dc__gap-8">
                            {renderSecretShowHide()}
                            <div className="flex p-4">
                                <CodeEditor.Clipboard />
                            </div>
                        </div>
                    </CodeEditor.Header>
                    {!data.external && errors.yaml && errors.yaml !== CONFIG_MAP_SECRET_NO_DATA_ERROR && (
                        <div className="validation-error-block">
                            <Info color="var(--R500)" style={{ height: '16px', width: '16px' }} />
                            <div>{errors.yaml}</div>
                        </div>
                    )}
                </CodeEditor>
                {!data.external && data.yamlMode && renderYamlInfoText()}
            </div>
        )
    }

    const renderGUIEditor = () => {
        const { onChange } = register('currentData', null, { isCustomComponent: true })

        return (
            <div>
                <KeyValueTable
                    isAdditionNotAllowed={isUnAuthorized || secretMode || data.yamlMode || data.external}
                    readOnly={isUnAuthorized || secretMode}
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
        <div className="flexbox-col dc__gap-12">
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
