import React from 'react'
import { Info, RadioGroup } from '../common'
import { KeyValueInput, useKeyValueYaml } from './ConfigMapSecret.components'
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { PATTERNS } from '../../config'
import { ConfigMapActionTypes, ConfigMapSecretDataEditorContainerProps } from './Types'
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
} from './Secret/secret.utils'
import { KeyValueFileInput } from '../util/KeyValueFileInput'
import { CM_SECRET_STATE } from './Constants'
import { ReactComponent as ShowIcon } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as HideIcon } from '../../assets/icons/ic-visibility-off.svg'

export const ConfigMapSecretDataEditorContainer = React.memo(
    ({ componentType, state, dispatch, tempArr }: ConfigMapSecretDataEditorContainerProps): JSX.Element => {
        const memoisedHandleChange = (index, k, v) => {
            const _currentData = [...state.currentData]
            _currentData[index] = {
                k: k,
                v: v,
                keyError: '',
                valueError: '',
            }
            dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
        }
        const memoisedRemove = (e, idx) => {
            const _currentData = [...state.currentData]
            _currentData.splice(idx, 1)
            dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: _currentData })
        }

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
                if (!state.secretMode) {
                    dispatch({
                        type: ConfigMapActionTypes.multipleOptions,
                        payload: { currentData: tempArr.current, yamlMode: !state.yamlMode },
                    })
                    tempArr.current = []
                    return
                }
                tempArr.current = []
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

        const toggleSecretMode = () => {
            if (!state.secretMode) {
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
            } else if (isESO) {
                return state.esoSecretYaml
            } else {
                return state.secretDataYaml
            }
        }

        const externalSecretEditor = (): JSX.Element => {
            if ((isHashiOrAWS || isESO) && state.yamlMode) {
                return renderCodeEditor(
                    getESOYaml(),
                    handleSecretYamlChange,
                    state.codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA
                        ? '#Check sample for usage.'
                        : dataHeaders[state.externalType] || dataHeaders[DATA_HEADER_MAP.DEFAULT],
                )
            } else {
                return (
                    <>
                        {isHashiOrAWS &&
                            state.secretData.map((data, index) => (
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
                            ))}
                    </>
                )
            }
        }

        const renderGUIEditor = (): JSX.Element => {
            return (
                <>
                    {state.currentData.map((config, idx) => (
                        <KeyValueInput
                            keyLabel={
                                state.externalType === '' && state.selectedType === 'volume' ? 'File Name' : 'Key'
                            }
                            valueLabel={
                                state.externalType === '' && state.selectedType === 'volume' ? 'File Content' : 'Value'
                            }
                            key={`editable-${idx}`}
                            {...{
                                ...config,
                                v: state.secretMode || state.unAuthorized ? Array(8).fill('*').join('') : config.v,
                            }}
                            index={idx}
                            onChange={
                                state.cmSecretState === CM_SECRET_STATE.INHERITED || state.unAuthorized
                                    ? null
                                    : memoisedHandleChange
                            }
                            onDelete={memoisedRemove}
                        />
                    ))}
                </>
            )
        }

        const renderCodeEditor = (value: string, handleOnChange: (yaml) => void, sheBangText: string): JSX.Element => {
            return (
                <div className="yaml-container">
                    <CodeEditor
                        value={value}
                        mode="yaml"
                        inline
                        height={350}
                        onChange={handleOnChange}
                        readOnly={state.cmSecretState === CM_SECRET_STATE.INHERITED || state.unAuthorized}
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
                                <Info color="#f32e2e" style={{ height: '16px', width: '16px' }} />
                                <div>{error}</div>
                            </div>
                        )}
                    </CodeEditor>
                </div>
            )
        }

        const getCodeEditorValue = (): string => {
            if (componentType === 'secret' && (state.secretMode || state.unAuthorized)) {
                return lockedYaml
            } else {
                return yaml
            }
        }

        const renderSecretShowHide = (): JSX.Element => {
            if (componentType === 'secret' && !state.external && !state.unAuthorized) {
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

        const renderDataEditorSelector = (): JSX.Element => {
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
                            <RadioGroup.Radio value={VIEW_MODE.GUI}>{VIEW_MODE.GUI.toUpperCase()}</RadioGroup.Radio>
                            <RadioGroup.Radio value={VIEW_MODE.YAML}>{VIEW_MODE.YAML.toUpperCase()}</RadioGroup.Radio>
                        </RadioGroup>
                    )}
                    {renderSecretShowHide()}
                </div>
            )
        }

        return (
            <>
                {renderDataEditorSelector()}
                {!state.external && (
                    <>
                        {state.yamlMode
                            ? renderCodeEditor(getCodeEditorValue(), handleYamlChange, '#key: value')
                            : renderGUIEditor()}
                    </>
                )}
                {externalSecretEditor()}
                {state.cmSecretState !== CM_SECRET_STATE.INHERITED && !state.yamlMode && !state.unAuthorized && (
                    <span className="dc__bold anchor pointer" onClick={handleAddParam}>
                        +Add params
                    </span>
                )}
            </>
        )
    },
)
