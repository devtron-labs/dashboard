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

import React from 'react'

import {
    InfoColourBar,
    KeyValueConfig,
    KeyValueTable,
    StyledRadioGroup as RadioGroup,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ShowIcon } from '@Icons/ic-visibility-on.svg'
import { ReactComponent as HideIcon } from '@Icons/ic-visibility-off.svg'
import { ReactComponent as InfoIcon } from '@Icons/info-filled.svg'
import { PATTERNS } from '@Config/constants'
import { KeyValueFileInput } from '@Components/util/KeyValueFileInput'
import CodeEditor from '@Components/CodeEditor/CodeEditor'
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
        rows: state.currentData.map(({ k, v, id }, idx) => ({
            data: {
                k: {
                    value: k,
                },
                v: {
                    value: v,
                },
            },
            id: id || idx,
        })),
    }

    const keyValueTableHandleChange = (rowId: string | number, headerKey: string, value: string) => {
        // We check if rowId is a string or not because:
        // - When data is changed from the YAML editor to the GUI, IDs are mapped to indices (numbers).
        // - When data is added via the GUI, IDs are created internally by the GUI editor as strings.

        // Check if rowId is not a string (i.e., it's a number, representing an index).
        if (typeof rowId !== 'string') {
            const _currentData = state.currentData.map((currentData, idx) =>
                rowId === idx
                    ? {
                          ...currentData,
                          [headerKey]: value,
                          keyError: '',
                          valueError: '',
                      }
                    : currentData,
            )
            dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
        } else {
            // When rowId is a string, it means the data was added via the GUI editor where IDs are strings.
            // Find the index of the current data item with the matching ID.
            const index = state.currentData.findIndex(({ id }) => rowId === id)
            if (index > -1) {
                // If the item is found, update the current data object with the new value and reset errors.
                const _currentData = state.currentData.map((currentData, idx) =>
                    index === idx
                        ? {
                              ...currentData,
                              [headerKey]: value,
                              keyError: '',
                              valueError: '',
                          }
                        : currentData,
                )
                dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
            } else {
                // If the item is not found, it means it's a new entry added via the GUI editor.
                // Create a new data object and add it to the current data state.
                const _currentData = [
                    ...state.currentData,
                    { k: '', v: '', [headerKey]: value, keyError: '', valueError: '', id: rowId },
                ]
                dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
            }
        }
    }

    const keyValueRemove = (rowId: string) => {
        // Create a new array by filtering out the item with the matching rowId.
        // If rowId is a string, it means we're dealing with an ID from the GUI.
        // If rowId is a number, it means we're dealing with an index mapped as ID from the YAML editor.
        const _currentData = state.currentData.filter(({ id }, idx) =>
            // When rowId is a string, remove the item with the matching ID.
            // When rowId is a number, remove the item at the matching index.
            typeof rowId === 'string' ? id !== rowId : idx !== rowId,
        )
        dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
    }

    const setKeyValueArray = (arr) => {
        setTempArr(arr)
    }

    const { yaml, handleYamlChange, error } = useKeyValueYaml(
        state.currentData,
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )

    if (state.isValidateFormError !== !!error) {
        dispatch({
            type: ConfigMapActionTypes.setValidateFormError,
            payload: !!error,
        })
    }

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
        if (state.yamlMode) {
            if (!state.secretMode) {
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: { currentData: tempArr.current, yamlMode: !state.yamlMode },
                })
                setTempArr([])
                return
            }
            setTempArr([])
        }
        dispatch({ type: ConfigMapActionTypes.toggleYamlMode })
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
        json = json.map((j) => {
            return {
                key: j.fileName,
                name: j.name,
                property: j.property,
                isBinary: j.isBinary,
            }
        })
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

    const renderCodeEditor = (
        value: string,
        handleOnChange: (yaml) => void,
        sheBangText: string,
        readOnly: boolean,
    ): JSX.Element => {
        return (
            <div className="yaml-container">
                <CodeEditor
                    value={value}
                    mode="yaml"
                    inline
                    height={350}
                    onChange={handleOnChange}
                    readOnly={
                        (state.cmSecretState === CM_SECRET_STATE.INHERITED && !draftMode) || readonlyView || readOnly
                    }
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

                        <CodeEditor.Clipboard />
                    </CodeEditor.Header>
                    {!state.external && error && (
                        <div className="validation-error-block">
                            <Info color="var(--R500)" style={{ height: '16px', width: '16px' }} />
                            <div>{error}</div>
                        </div>
                    )}
                </CodeEditor>
            </div>
        )
    }

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
                            <div
                                className="dc__bold anchor pointer pb-10 dc_max-width__max-content"
                                onClick={handleAddParam}
                            >
                                + Add params
                            </div>
                        )}
                </>
            )
        )
    }

    const renderGUIEditor = () => {
        return (
            <KeyValueTable
                isAdditionNotAllowed={
                    (state.cmSecretState === CM_SECRET_STATE.INHERITED && !draftMode) ||
                    state.unAuthorized ||
                    state.secretMode ||
                    state.yamlMode ||
                    state.external
                }
                isSortable
                config={config}
                placeholder={{
                    k: 'Enter Key',
                    v: 'Enter Value',
                }}
                onChange={
                    !draftMode &&
                    (state.cmSecretState === CM_SECRET_STATE.INHERITED || readonlyView || state.unAuthorized)
                        ? null
                        : keyValueTableHandleChange
                }
                maskValue={{
                    v: state.secretMode || state.unAuthorized,
                }}
                onDelete={keyValueRemove}
            />
        )
    }

    const getCodeEditorValue = (): string => {
        if (componentType === CMSecretComponentType.Secret && (state.secretMode || state.unAuthorized)) {
            return lockedYaml
        }
        return yaml
    }

    const renderSecretShowHide = (): JSX.Element => {
        if (componentType === CMSecretComponentType.Secret && !state.external && !state.unAuthorized) {
            return (
                <div style={{ marginLeft: 'auto' }} className="edit flex cursor" onClick={toggleSecretMode}>
                    {state.secretMode ? (
                        <>
                            <ShowIcon className="icon-dim-16 mr-4 mw-18" />
                            Show values
                        </>
                    ) : (
                        <>
                            <HideIcon className="icon-dim-16 mr-4 mw-18" />
                            Hide values
                        </>
                    )}
                </div>
            )
        }
        return null
    }

    const renderInfotext = () => (
        <div className="flex top">
            GUI Recommended for multi-line data.
            <br />
            Boolean and numeric values must be wrapped in double quotes Eg. &quot;true&quot;, &quot;123&quot;
        </div>
    )

    const renderDataEditorSelector = (): JSX.Element => {
        if (
            (componentType === CMSecretComponentType.Secret && state.externalType === 'KubernetesSecret') ||
            (componentType !== CMSecretComponentType.Secret && state.external)
        ) {
            return null
        }

        return (
            <>
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
                            <RadioGroup.Radio value={VIEW_MODE.GUI}>{VIEW_MODE.GUI.toUpperCase()}</RadioGroup.Radio>
                            <RadioGroup.Radio value={VIEW_MODE.YAML}>{VIEW_MODE.YAML.toUpperCase()}</RadioGroup.Radio>
                        </RadioGroup>
                    )}
                    {renderSecretShowHide()}
                </div>
                {componentType !== CMSecretComponentType.Secret && !state.external && state.yamlMode && (
                    <InfoColourBar
                        message={renderInfotext()}
                        Icon={InfoIcon}
                        iconSize={20}
                        classname="info_bar cn-9 mt-16 mb-16 lh-20"
                    />
                )}
            </>
        )
    }

    return (
        <>
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
