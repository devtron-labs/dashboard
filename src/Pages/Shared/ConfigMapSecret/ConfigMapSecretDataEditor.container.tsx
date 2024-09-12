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

import React, { useEffect } from 'react'
import { Prompt } from 'react-router-dom'

import {
    InfoColourBar,
    KeyValueConfig,
    KeyValueTable,
    StyledRadioGroup as RadioGroup,
    YAMLStringify,
    CodeEditor,
    usePrompt,
    deepEqual,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as HideIcon } from '@Icons/ic-visibility-off.svg'
import { ReactComponent as InfoIcon } from '@Icons/info-filled.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { PATTERNS, UNSAVED_CHANGES_PROMPT_MESSAGE } from '@Config/constants'
import { KeyValueFileInput } from '@Components/util/KeyValueFileInput'
import { Info } from '@Components/common'

import {
    CODE_EDITOR_RADIO_STATE,
    CODE_EDITOR_RADIO_STATE_VALUE,
    DATA_HEADER_MAP,
    dataHeaders,
    handleSecretDataYamlChange,
    hasESO,
    hasHashiOrAWS,
    sampleJSONs,
    transformSecretDataJSON,
    VIEW_MODE,
} from './Secret.utils'
import { CM_SECRET_STATE } from './ConfigMapSecret.constants'
import { useKeyValueYaml } from './ConfigMapSecret.components'
import {
    ConfigMapActionTypes,
    ConfigMapSecretDataEditorContainerProps,
    CMSecretComponentType,
    CMSecretYamlData,
} from './ConfigMapSecret.types'

const ConfigMapSecretDataEditor = ({
    componentType,
    state,
    dispatch,
    tempArr,
    setTempArr,
    readonlyView,
    draftMode,
}: ConfigMapSecretDataEditorContainerProps): JSX.Element => {
    const config: KeyValueConfig<'k' | 'v'> = {
        headers: [
            {
                label: state.externalType === '' && state.selectedType === 'volume' ? 'File Name' : 'Key',
                key: 'k',
            },
            {
                label: state.externalType === '' && state.selectedType === 'volume' ? 'File Content' : 'Value',
                key: 'v',
            },
        ],
        rows: state.currentData.map(({ k, v, id }) => ({
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

    const keyValueTableHandleChange = (rowId: string | number, headerKey: string, value: string) => {
        // - When data is changed from the YAML editor to the GUI, IDs are mapped to indices (numbers).
        // - When data is added via the GUI, IDs are created internally by the GUI editor as strings.
        const _currentData = state.currentData.reduce(
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

        dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData.updatedData })
    }

    const keyValueRemove = (rowId: string | number) => {
        // Create a new array by filtering out the item with the matching rowId.
        const _currentData = state.currentData.filter(({ id }) => id !== rowId)
        dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
    }

    const setKeyValueArray = (arr: CMSecretYamlData[]) => {
        if (!state.unAuthorized && !state.secretMode) {
            dispatch({
                type: ConfigMapActionTypes.setFormDirty,
                payload: state.isFormDirty || !deepEqual(arr, state.currentData),
            })
        }
        setTempArr(arr)
    }

    const { yaml, handleYamlChange, error } = useKeyValueYaml(
        state.currentData,
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )
    usePrompt({ shouldPrompt: state.isValidateFormError || state.isFormDirty })

    useEffect(() => {
        if (state.isValidateFormError !== !!error) {
            dispatch({
                type: ConfigMapActionTypes.setValidateFormError,
                payload: !!error,
            })
        }
    }, [error])

    const { yaml: lockedYaml } = useKeyValueYaml(
        state.currentData?.map(({ k }) => ({ k, v: Array(8).fill('*').join('') })),
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )

    const isHashiOrAWS = componentType === CMSecretComponentType.Secret && hasHashiOrAWS(state.externalType)

    const sample = YAMLStringify(sampleJSONs[state.externalType] || sampleJSONs[DATA_HEADER_MAP.DEFAULT])
    const isESO = componentType === CMSecretComponentType.Secret && hasESO(state.externalType)

    const changeEditorMode = () => {
        if (state.isValidateFormError) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve the errors before switching editor mode.',
            })
        } else if (state.yamlMode) {
            if (!state.secretMode) {
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: {
                        currentData: tempArr.current,
                        yamlMode: !state.yamlMode,
                        isFormDirty:
                            !state.unAuthorized &&
                            (state.isFormDirty || !deepEqual(tempArr.current, state.currentData)),
                    },
                })
            } else {
                dispatch({ type: ConfigMapActionTypes.toggleYamlMode })
            }
            setTempArr([])
        } else {
            setTempArr(state.currentData)
            dispatch({ type: ConfigMapActionTypes.toggleYamlMode })
        }
    }

    const handleAddParam = (): void => {
        if (isHashiOrAWS) {
            dispatch({
                type: ConfigMapActionTypes.setSecretData,
                payload: [...state.secretData, { fileName: '', property: '', isBinary: true, name: '' }],
            })
        } else {
            const _currentData = [...state.currentData]
            _currentData.push({ k: '', v: '', keyError: '', valueError: '' })
            dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
        }
    }

    const handleSecretYamlChange = (_yaml) => {
        handleSecretDataYamlChange(_yaml, state.codeEditorRadio, isESO, dispatch)
    }

    const handleCodeEditorRadioChange = (e) => {
        dispatch({
            type: ConfigMapActionTypes.setCodeEditorRadio,
            payload: e.target.value,
        })
    }

    const handleSecretDataChange = (index: number, key: string, value: string | boolean) => {
        let json = { ...state.secretData[index], [key]: value }
        dispatch({
            type: ConfigMapActionTypes.setSecretData,
            payload: json,
        })
        json = transformSecretDataJSON(json)
        dispatch({
            type: ConfigMapActionTypes.setSecretDataYaml,
            payload: YAMLStringify(json),
        })
    }

    const handleSecretDataDelete = (index: number) => {
        const _secretData = [...state.secretData[index]]
        _secretData.splice(index, 1)
        let json = _secretData
        dispatch({
            type: ConfigMapActionTypes.setSecretData,
            payload: _secretData,
        })
        json = json.map((j) => ({
            key: j.fileName,
            name: j.name,
            property: j.property,
            isBinary: j.isBinary,
        }))
        dispatch({
            type: ConfigMapActionTypes.setSecretDataYaml,
            payload: YAMLStringify(json),
        })
    }

    const toggleSecretMode = () => {
        if (!state.secretMode && state.yamlMode) {
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: { secretMode: true, currentData: tempArr.current },
            })
        } else {
            dispatch({
                type: ConfigMapActionTypes.toggleSecretMode,
            })
        }
    }

    const getESOYaml = () => {
        if (state.codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE) {
            return sample
        }
        if (isESO) {
            return state.esoSecretYaml
        }
        return state.secretDataYaml
    }

    const renderSecretShowHide = (showDivider = true): JSX.Element =>
        componentType === CMSecretComponentType.Secret &&
        !state.external &&
        !state.unAuthorized && (
            <>
                <button
                    type="button"
                    className="dc__unset-button-styles edit flex cursor cn-7 fw-6 dc__gap-6"
                    onClick={toggleSecretMode}
                >
                    {state.secretMode ? (
                        <>
                            <ICPencil className="icon-dim-16 scn-7" />
                            Show/Edit values
                        </>
                    ) : (
                        <>
                            <HideIcon className="icon-dim-16 fcn-7" />
                            Hide values
                        </>
                    )}
                </button>
                {showDivider && <div className="dc__divider" />}
            </>
        )

    const renderInfotext = () => (
        <div className="flex top">
            GUI Recommended for multi-line data.
            <br />
            Boolean and numeric values must be wrapped in double quotes Eg. &quot;true&quot;, &quot;123&quot;
        </div>
    )

    const renderCodeEditor = (
        value: string,
        handleOnChange: (yaml) => void,
        sheBangText: string,
        readOnly: boolean,
    ): JSX.Element => (
        <div className="yaml-container">
            <CodeEditor
                value={value}
                mode="yaml"
                inline
                height={350}
                onChange={handleOnChange}
                readOnly={(state.cmSecretState === CM_SECRET_STATE.INHERITED && !draftMode) || readonlyView || readOnly}
                shebang={sheBangText}
            >
                <CodeEditor.Header>
                    {state.external ? (
                        <RadioGroup
                            className="gui-yaml-switch"
                            name="data-mode"
                            initialTab={state.codeEditorRadio}
                            disabled={false}
                            onChange={handleCodeEditorRadioChange}
                        >
                            <RadioGroup.Radio value={CODE_EDITOR_RADIO_STATE.DATA}>
                                {CODE_EDITOR_RADIO_STATE_VALUE.DATA}
                            </RadioGroup.Radio>
                            <RadioGroup.Radio value={CODE_EDITOR_RADIO_STATE.SAMPLE}>
                                {CODE_EDITOR_RADIO_STATE_VALUE.SAMPLE}
                            </RadioGroup.Radio>
                        </RadioGroup>
                    ) : (
                        <CodeEditor.ValidationError />
                    )}
                    <div className="flexbox dc__align-items-center dc__gap-8">
                        {renderSecretShowHide()}
                        <CodeEditor.Clipboard />
                    </div>
                </CodeEditor.Header>
                {!state.external && state.yamlMode && (
                    <InfoColourBar
                        message={renderInfotext()}
                        Icon={InfoIcon}
                        iconSize={20}
                        classname="info_bar cn-9 lh-20 dc__no-border-radius dc__no-right-border dc__no-left-border dc__no-top-border"
                    />
                )}
                {!state.external && error && (
                    <div className="validation-error-block">
                        <Info color="var(--R500)" style={{ height: '16px', width: '16px' }} />
                        <div>{error}</div>
                    </div>
                )}
            </CodeEditor>
        </div>
    )

    const externalSecretEditor = (): JSX.Element => {
        if ((isHashiOrAWS || isESO) && state.yamlMode) {
            return renderCodeEditor(
                getESOYaml(),
                handleSecretYamlChange,
                state.codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA
                    ? '#Check sample for usage.'
                    : dataHeaders[state.externalType] || dataHeaders[DATA_HEADER_MAP.DEFAULT],
                false,
            )
        }
        return (
            isHashiOrAWS && (
                <>
                    {state.secretData.map((data, index) => (
                        <KeyValueFileInput
                            key={`${data.name}-${data.fileName}`}
                            index={index}
                            fileName={data.fileName}
                            name={data.name}
                            property={data.property}
                            isBinary={data.isBinary}
                            handleChange={handleSecretDataChange}
                            handleDelete={handleSecretDataDelete}
                        />
                    ))}
                    {(state.cmSecretState !== CM_SECRET_STATE.INHERITED || draftMode) &&
                        !state.unAuthorized &&
                        !state.secretMode &&
                        !state.yamlMode &&
                        !state.external && (
                            <button
                                type="button"
                                className="dc__unset-button-styles pb-10 dc_max-width__max-content fw-7 cb-5"
                                onClick={handleAddParam}
                            >
                                + Add params
                            </button>
                        )}
                </>
            )
        )
    }

    const renderGUIEditor = () => (
        <KeyValueTable
            isAdditionNotAllowed={
                (state.cmSecretState === CM_SECRET_STATE.INHERITED && !draftMode) ||
                state.unAuthorized ||
                state.secretMode ||
                state.yamlMode ||
                state.external
            }
            readOnly={
                (state.cmSecretState === CM_SECRET_STATE.INHERITED && !draftMode) ||
                readonlyView ||
                state.unAuthorized ||
                state.secretMode
            }
            isSortable
            config={config}
            placeholder={{
                k: 'Enter Key',
                v: 'Enter Value',
            }}
            onChange={keyValueTableHandleChange}
            maskValue={{
                v: state.secretMode || state.unAuthorized,
            }}
            onDelete={keyValueRemove}
            showError
            validationSchema={(value, key) => {
                if (key === 'k' && value) {
                    const isValid = new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(value)
                    return isValid
                }
                return true
            }}
            errorMessages={['Can only contain alphanumeric chars and ( - ), ( _ ), ( . )', 'Spaces not allowed']}
            onError={(err) => {
                if (state.isValidateFormError !== err) {
                    dispatch({
                        type: ConfigMapActionTypes.setValidateFormError,
                        payload: err,
                    })
                }
            }}
            headerComponent={renderSecretShowHide(false)}
            validateEmptyKeys
        />
    )

    const getCodeEditorValue = (): string => {
        if (componentType === CMSecretComponentType.Secret && (state.secretMode || state.unAuthorized)) {
            return lockedYaml
        }
        return yaml
    }

    const renderDataEditorSelector = (): JSX.Element => {
        if (
            (componentType === CMSecretComponentType.Secret && state.externalType === 'KubernetesSecret') ||
            (componentType !== CMSecretComponentType.Secret && state.external)
        ) {
            return null
        }

        return (
            <div className="flex left mb-16">
                <b className="mr-5 dc__bold dc__required-field">Data</b>
                {!isESO && (
                    <RadioGroup
                        className="gui-yaml-switch"
                        name="yaml-mode"
                        initialTab={state.yamlMode ? VIEW_MODE.YAML : VIEW_MODE.GUI}
                        disabled={false}
                        onChange={changeEditorMode}
                    >
                        <RadioGroup.Radio value={VIEW_MODE.GUI} canSelect={false}>
                            {VIEW_MODE.GUI.toUpperCase()}
                        </RadioGroup.Radio>
                        <RadioGroup.Radio value={VIEW_MODE.YAML} canSelect={false}>
                            {VIEW_MODE.YAML.toUpperCase()}
                        </RadioGroup.Radio>
                    </RadioGroup>
                )}
            </div>
        )
    }

    return (
        <>
            <Prompt when={state.isValidateFormError || state.isFormDirty} message={UNSAVED_CHANGES_PROMPT_MESSAGE} />
            {renderDataEditorSelector()}
            {!state.external &&
                (state.yamlMode
                    ? renderCodeEditor(
                          getCodeEditorValue(),
                          handleYamlChange,
                          '#key: value',
                          state.unAuthorized || state.secretMode,
                      )
                    : renderGUIEditor())}
            {externalSecretEditor()}
        </>
    )
}

export const ConfigMapSecretDataEditorContainer = React.memo(ConfigMapSecretDataEditor)
