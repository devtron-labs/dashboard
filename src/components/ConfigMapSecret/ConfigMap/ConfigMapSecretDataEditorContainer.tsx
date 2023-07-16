import React, { useRef } from 'react'
import { Info, RadioGroup, Pencil } from '../../common'
import { KeyValueInput, useKeyValueYaml } from '../ConfigMapSecret.components'
import CodeEditor from '../../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { PATTERNS } from '../../../config'
import { ConfigMapSecretDataEditorContainerProps } from '../Types'
import { ConfigMapActionTypes } from './ConfigMap.type'
import {
    CODE_EDITOR_RADIO_STATE,
    CODE_EDITOR_RADIO_STATE_VALUE,
    DATA_HEADER_MAP,
    dataHeaders,
    handleSecretDataYamlChange,
    hasESO,
    hasHashiOrAWS,
    sampleJSONs,
    unlockSecrets,
    VIEW_MODE,
} from '../Secret/secret.utils'
import { KeyValueFileInput } from '../../util/KeyValueFileInput'
import { useParams } from 'react-router-dom'

export const ConfigMapSecretDataEditorContainer = React.memo(
    ({
        id,
        configMapSecretData,
        isOverrideView,
        componentType,
        state,
        dispatch,
        tempArr,
    }: ConfigMapSecretDataEditorContainerProps): JSX.Element => {
        const { appId, envId } = useParams<{ appId; envId }>()
        function memoisedRemove(e, idx) {
            dispatch({ type: ConfigMapActionTypes.keyValueDelete, payload: { index: idx } })
        }
        const memoisedHandleChange = (index, k, v) => dispatch({ type: 'key-value-change', value: { index, k, v } })

        function setKeyValueArray(arr) {
            tempArr.current = arr
        }
        const { yaml, handleYamlChange, error } = useKeyValueYaml(
            configMapSecretData?.global ? state.duplicate : state.externalValues,
            setKeyValueArray,
            PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
            `Key must consist of alphanumeric characters, '.', '-' and '_'`,
        )

        const { yaml: lockedYaml } = useKeyValueYaml(
            (configMapSecretData?.global ? state.duplicate : state.externalValues).map(({ k, v }) => ({
                k,
                v: Array(8).fill('*').join(''),
            })),
            setKeyValueArray,
            PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
            `Key must consist of alphanumeric characters, '.', '-' and '_'`,
        )

        const isHashiOrAWS = componentType === 'secret' && hasHashiOrAWS(state.externalType)

        const sample = YAML.stringify(sampleJSONs[state.externalType] || sampleJSONs[DATA_HEADER_MAP.DEFAULT])
        const isESO = componentType === 'secret' && hasESO(state.externalType)

        function changeEditorMode() {
            if (state.yamlMode) {
                if (state.duplicate) {
                    dispatch({
                        type: ConfigMapActionTypes.multipleOptions,
                        payload: { duplicate: tempArr.current, yamlMode: !state.yamlMode },
                    })
                    tempArr.current = []
                    return
                }
                tempArr.current = []
            }
            dispatch({ type: ConfigMapActionTypes.toggleYamlMode })
        }

        function stringify(value) {
            if (!value) return value
            if (typeof value === 'object') {
                return YAML.stringify(value, { indent: 2 })
            }
            if (typeof value === 'string') {
                return value
            }
            try {
                return value.toString()
            } catch (err) {
                return ''
            }
        }

        const handleAddParam = (): void => {
            if (isOverrideView) {
                if (isHashiOrAWS) {
                    dispatch({
                        type: ConfigMapActionTypes.setSecretData,
                        payload: [...state.secretData, { fileName: '', property: '', isBinary: true, name: '' }],
                    })
                } else {
                    dispatch({ type: ConfigMapActionTypes.addParam })
                }
            } else {
                if (isHashiOrAWS) {
                    dispatch({
                        type: ConfigMapActionTypes.setSecretData,
                        payload: [...state.secretData, { fileName: '', property: '', isBinary: true, name: '' }],
                    })
                } else
                    dispatch({
                        type: ConfigMapActionTypes.setExternalValues,
                        payload: [...state.externalValues, { k: '', v: '', keyError: '', valueError: '' }],
                    })
            }
        }

        const handleSecretYamlChange = (yaml) => {
            handleSecretDataYamlChange(yaml, state.codeEditorRadio, isESO, dispatch)
        }

        const handleEditSecret = () => {
            unlockSecrets(id, +appId, +envId, state.configName.value, configMapSecretData.global, isESO, dispatch)
        }

        const handleCodeEditorRadioChange = (e) => {
            dispatch({
                type: ConfigMapActionTypes.setCodeEditorRadio,
                payload: e.target.value,
            })
        }

        function handleSecretDataChange(index: number, key: string, value: string | boolean): void {
            let json = { ...state.secretData[index], [key]: value }
            dispatch({
                type: ConfigMapActionTypes.setSecretData,
                payload: json,
            })
            json = json.map((j) => {
                let temp = {}
                temp['isBinary'] = j.isBinary
                if (j.fileName) {
                    temp['key'] = j.fileName
                }
                if (j.property) {
                    temp['property'] = j.property
                }
                if (j.name) {
                    temp['name'] = j.name
                }
                return temp
            })
            dispatch({
                type: ConfigMapActionTypes.setSecretDataYaml,
                payload: YAML.stringify(json),
            })
        }

        function handleSecretDataDelete(index: number): void {
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
                payload: YAML.stringify(json),
            })
        }

        const getCodeEditorData = (): string => {
            if (componentType === 'secret') return state.secretMode || state.locked ? lockedYaml : yaml
            else {
                return state.duplicate ? yaml : YAML.stringify(configMapSecretData?.defaultData, { indent: 2 })
            }
        }

        const externalSecretEditor = (): JSX.Element => {
            if ((isHashiOrAWS || isESO) && state.yamlMode) {
                return (
                    <div className="yaml-container">
                        <CodeEditor
                            value={
                                state.codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE
                                    ? sample
                                    : isESO
                                    ? state.esoSecretYaml
                                    : state.secretDataYaml
                            }
                            mode="yaml"
                            inline
                            height={350}
                            onChange={handleSecretYamlChange}
                            readOnly={state.secretMode && state.codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE}
                            shebang={
                                state.codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA
                                    ? '#Check sample for usage.'
                                    : dataHeaders[state.externalType] || dataHeaders[DATA_HEADER_MAP.DEFAULT]
                            }
                        >
                            <CodeEditor.Header>
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
                                <CodeEditor.Clipboard />
                            </CodeEditor.Header>
                        </CodeEditor>
                    </div>
                )
            } else {
                return (
                    <React.Fragment>
                        {isHashiOrAWS &&
                            state.secretData.map((data, index) => (
                                <div>
                                    <KeyValueFileInput
                                        key={index}
                                        index={index}
                                        fileName={data.fileName}
                                        name={data.name}
                                        property={data.property}
                                        isBinary={data.isBinary}
                                        handleChange={handleSecretDataChange}
                                        handleDelete={handleSecretDataDelete}
                                    />
                                </div>
                            ))}
                    </React.Fragment>
                )
            }
        }

        const renderKeyValue = (): JSX.Element => {
            if (configMapSecretData?.global) {
                if (state.duplicate) {
                    return (
                        <>
                            {state.duplicate.map((config, idx) => (
                                <KeyValueInput
                                    keyLabel={
                                        state.externalType === '' && state.selectedType === 'volume'
                                            ? 'File Name'
                                            : 'Key'
                                    }
                                    valueLabel={
                                        state.externalType === '' && state.selectedType === 'volume'
                                            ? 'File Content'
                                            : 'Value'
                                    }
                                    key={`editable-${idx}`}
                                    {...{ ...config, v: state.locked ? Array(8).fill('*').join('') : config.v }}
                                    index={idx}
                                    onChange={state.locked ? null : memoisedHandleChange}
                                />
                            ))}
                        </>
                    )
                } else {
                    return (
                        <>
                            {Object.keys(state.defaultData).map((config, idx) => (
                                <KeyValueInput
                                    keyLabel={
                                        state.externalType === '' && state.selectedType === 'volume'
                                            ? 'File Name'
                                            : 'Key'
                                    }
                                    valueLabel={
                                        state.externalType === '' && state.selectedType === 'volume'
                                            ? 'File Content'
                                            : 'Value'
                                    }
                                    onDelete={null}
                                    key={`locked-${idx}`}
                                    k={config}
                                    v={Array(8).fill('*').join('')}
                                    index={idx}
                                    onChange={null}
                                />
                            ))}
                        </>
                    )
                }
            } else {
                return (
                    <>
                        {state.externalValues.map((data, idx) => (
                            <KeyValueInput
                                keyLabel={
                                    state.externalType === '' && state.selectedType === 'volume' ? 'File Name' : 'Key'
                                }
                                valueLabel={
                                    state.externalType === '' && state.selectedType === 'volume'
                                        ? 'File Content'
                                        : 'Value'
                                }
                                k={data.k}
                                v={state.secretMode ? Array(8).fill('*').join('') : data.v}
                                keyError={data.keyError}
                                valueError={data.valueError}
                                key={idx}
                                index={idx}
                                onChange={state.secretMode ? null : state.handleChange}
                                onDelete={state.secretMode ? null : state.handleDeleteParam}
                            />
                        ))}
                    </>
                )
            }
        }

        return (
            <>
                {!state.external && (
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
                                    <RadioGroup.Radio value={VIEW_MODE.GUI}>
                                        {VIEW_MODE.GUI.toUpperCase()}
                                    </RadioGroup.Radio>
                                    <RadioGroup.Radio value={VIEW_MODE.YAML}>
                                        {VIEW_MODE.YAML.toUpperCase()}
                                    </RadioGroup.Radio>
                                </RadioGroup>
                            )}
                            {isOverrideView && configMapSecretData?.global && state.locked && (
                                <div style={{ marginLeft: 'auto' }} className="edit flex" onClick={handleEditSecret}>
                                    <Pencil className="pointer" />
                                </div>
                            )}
                        </div>

                        {state.yamlMode ? (
                            <div className="yaml-container">
                                <CodeEditor
                                    value={getCodeEditorData()}
                                    mode="yaml"
                                    inline
                                    height={350}
                                    onChange={handleYamlChange}
                                    readOnly={isOverrideView && configMapSecretData?.global && state.locked}
                                    shebang="#key: value"
                                >
                                    <CodeEditor.Header>
                                        <CodeEditor.ValidationError />
                                        <CodeEditor.Clipboard />
                                    </CodeEditor.Header>
                                    {error && (
                                        <div className="validation-error-block">
                                            <Info color="#f32e2e" style={{ height: '16px', width: '16px' }} />
                                            <div>{error}</div>
                                        </div>
                                    )}
                                </CodeEditor>
                            </div>
                        ) : (
                            renderKeyValue()
                        )}
                    </>
                )}
                {externalSecretEditor()}
                {(!isOverrideView || state.duplicate) && !state.yamlMode && !state.locked && (
                    <span className="dc__bold anchor pointer" onClick={handleAddParam}>
                        +Add params
                    </span>
                )}
            </>
        )
    },
)
