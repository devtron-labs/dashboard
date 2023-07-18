import React from 'react'
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
    VIEW_MODE,
} from '../Secret/secret.utils'
import { KeyValueFileInput } from '../../util/KeyValueFileInput'
import { CM_SECRET_STATE } from '../Constants'

export const ConfigMapSecretDataEditorContainer = React.memo(
    ({
        componentType,
        state,
        dispatch,
        tempArr,
        handleSecretFetch,
    }: ConfigMapSecretDataEditorContainerProps): JSX.Element => {
        const memoisedHandleChange = (index, k, v) =>
            dispatch({ type: ConfigMapActionTypes.keyValueChange, value: { index, k, v } })
        const memoisedRemove = (e, idx) => dispatch({ type: ConfigMapActionTypes.keyValueDelete, value: { index: idx } })

        function setKeyValueArray(arr) {
            tempArr.current = arr
        }
        const { yaml, handleYamlChange, error } = useKeyValueYaml(
            state.currentData,
            setKeyValueArray,
            PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
            `Key must consist of alphanumeric characters, '.', '-' and '_'`,
        )
        const { yaml: lockedYaml } = useKeyValueYaml(
            state.currentData?.map(({ k, v }) => ({ k, v: Array(8).fill('*').join('') })),
            setKeyValueArray,
            PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
            `Key must consist of alphanumeric characters, '.', '-' and '_'`,
        )

        const isHashiOrAWS = componentType === 'secret' && hasHashiOrAWS(state.externalType)

        const sample = YAML.stringify(sampleJSONs[state.externalType] || sampleJSONs[DATA_HEADER_MAP.DEFAULT])
        const isESO = componentType === 'secret' && hasESO(state.externalType)

        function changeEditorMode() {
            if (state.yamlMode) {
                dispatch({
                    type: ConfigMapActionTypes.multipleOptions,
                    payload: { currentData: tempArr.current, yamlMode: !state.yamlMode },
                })
                tempArr.current = []
                return
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
                dispatch({ type: ConfigMapActionTypes.addParam })
            }
        }

        const handleSecretYamlChange = (yaml) => {
            handleSecretDataYamlChange(yaml, state.codeEditorRadio, isESO, dispatch)
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
                            readOnly={state.cmSecretState === CM_SECRET_STATE.INHERITED || state.secretMode}
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
                            {state.secretMode && (
                                <div style={{ marginLeft: 'auto' }} className="edit flex" onClick={handleSecretFetch}>
                                    <Pencil />
                                </div>
                            )}
                        </div>

                        {state.yamlMode ? (
                            <div className="yaml-container">
                                <CodeEditor
                                    value={componentType === 'secret' && state.secretMode ? lockedYaml : yaml}
                                    mode="yaml"
                                    inline
                                    height={350}
                                    onChange={handleYamlChange}
                                    readOnly={state.cmSecretState === CM_SECRET_STATE.INHERITED || state.secretMode}
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
                            <>
                                {[...state.currentData].map((config, idx) => (
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
                                        {...{ ...config, v: state.secretMode ? Array(8).fill('*').join('') : config.v }}
                                        index={idx}
                                        onChange={
                                            state.cmSecretState === CM_SECRET_STATE.INHERITED || state.secretMode
                                                ? null
                                                : memoisedHandleChange
                                        }
                                        onDelete={memoisedRemove}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
                {externalSecretEditor()}
                {state.cmSecretState !== CM_SECRET_STATE.INHERITED && !state.yamlMode && !state.secretMode && (
                    <span className="dc__bold anchor pointer" onClick={handleAddParam}>
                        +Add params
                    </span>
                )}
            </>
        )
    },
)
