import React, { useEffect, useState, useReducer, useRef, memo } from 'react'
import { overRideConfigMap, deleteConfigMap } from './service'
import { getEnvironmentConfigs } from '../../services/service';
import { useParams } from 'react-router'
import addIcon from '../../assets/icons/ic-add.svg'
import fileIcon from '../../assets/icons/ic-file.svg'
import keyIcon from '../../assets/icons/ic-key.svg'
import arrowTriangle from '../../assets/icons/appstatus/ic-dropdown.svg'
import { mapByKey, showError, Progressing, Info, ConfirmationDialog, useAsync, Select, RadioGroup, not, CustomInput, Checkbox, CHECKBOX_VALUE } from '../common'
import { OverrideSecretForm } from './SecretOverrides'
import { ConfigMapForm, KeyValueInput, useKeyValueYaml } from '../configMaps/ConfigMap'
import { toast } from 'react-toastify'
import warningIcon from '../../assets/img/warning-medium.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { PATTERNS } from '../../config';
import './environmentOverride.scss';

const ConfigMapContext = React.createContext(null)

function useConfigMapContext() {
    const context = React.useContext(ConfigMapContext)
    if (!context) {
        throw new Error(
            `outer usage not allowed`,
        )
    }
    return context
}

export default function ConfigMapOverrides({ parentState, setParentState, ...props }) {
    const { appId, envId } = useParams<{ appId, envId }>()
    const [loading, result, error, reload] = useAsync(() => getEnvironmentConfigs(+appId, +envId), [+appId, +envId])
    useEffect(() => {
        if (!loading && result) {
            setParentState('loaded')
        }
    }, [loading])
    if (loading && !result) {
        return null
    }
    if (error) {
        setParentState('failed')
        showError(error)
        if (!result) return null
    }
    if (parentState === 'loading' || !result) return null
    let { result: { configData, id } } = result
    configData = [{ name: "" }].concat(configData)
    const configMaps = mapByKey(configData, 'name');
    return (
        <section className="config-map-overrides">
            <label className="form__label bold">ConfigMaps</label>
            <ConfigMapContext.Provider value={{ configMaps, id, reload }}>
                {configMaps && Array.from(configMaps).sort((a, b) => a[0].localeCompare(b[0])).map(
                    ([name, { data, defaultData, ...rest }]) =>
                        <ListComponent name={name} key={name || Math.random().toString(36).substr(2, 5)} type="config-map" label={defaultData ? data ? 'modified' : null : 'env'} />
                )}
            </ConfigMapContext.Provider>
        </section>
    )
}

export function ListComponent({ name = "", type, label = "", reload = null }) {
    const [isCollapsed, toggleCollapse] = useState(true)
    return (
        <div className="white-card white-card--list">
            <div className="environment-override-list pointer left flex" onClick={e => toggleCollapse(!isCollapsed)}>
                <img src={name ? (type === 'config-map' ? fileIcon : keyIcon) : addIcon} alt="list-icon icon" />
                <div className={`flex left ${!name ? 'fw-5 fs-14 cb-5' : 'fw-5 fs-14 cn-9'}`}>{name || `Add ${type === 'secret' ? 'Secret' : 'ConfigMap'}`}</div>
                {label && <div className="flex tag">{label}</div>}
                <img className={`pointer rotate`} style={{ ['--rotateBy' as any]: `${Number(!isCollapsed) * 180}deg` }} src={arrowTriangle} alt="arrow" />
            </div>
            {!isCollapsed && type !== 'config-map' && <OverrideSecretForm name={name} toggleCollapse={toggleCollapse} />}
            {!isCollapsed && type !== 'secret' && <OverrideConfigMapForm name={name} toggleCollapse={toggleCollapse} reload={reload} />}
        </div>
    )
}

interface ConfigMapProps {
    name?: string;
    toggleCollapse: any;
    reload: any;
}

const OverrideConfigMapForm: React.FC<ConfigMapProps> = memo(function OverrideConfigMapForm({ name, toggleCollapse }) {
    const { configMaps, id, reload } = useConfigMapContext()
    const { data = null, defaultData = {}, type = "environment", mountPath = "", external = false, externalType = "", defaultMountPath = "", subPath = false, filePermission = "", global: isGlobal = false } = configMaps.has(name) ? configMaps.get(name) : { type: 'environment', mountPath: '', external: false }
    function reducer(state, action) {
        switch (action.type) {
            case 'createDuplicate':
                return { ...state, duplicate: Object.keys(defaultData).map(k => ({ k, v: defaultData[k], keyError: "", valueError: "" })), mountPath: state.mountPath || defaultMountPath }
            case 'removeDuplicate':
                return { ...state, duplicate: null, mountPath: "" }
            case 'add-param':
                return { ...state, duplicate: state.duplicate.concat([{ k: "", v: "", keyError: "", valueError: "" }]) }
            case 'mountPath':
                return { ...state, mountPath: action.value }
            case 'filePermission':
                return { ...state, filePermission: action.value }
            case 'subPath':
                return { ...state, subPath: action.value }
            case 'key-value-change':
                let duplicate = state.duplicate
                duplicate[action.value.index] = { k: action.value.k, v: action.value.v, keyError: '', valueError: '' }
                return { ...state, duplicate: [...duplicate] }
            case 'key-value-delete':
                let dup = [...state.duplicate]
                dup.splice(action.value.index, 1)
                return { ...state, duplicate: [...dup] }
            case 'submitLoading':
                return { ...state, submitLoading: true }
            case 'overrideLoading':
                return { ...state, overrideLoading: true }
            case 'createErrors':
                return {
                    ...state, duplicate: state.duplicate.reduce((agg, dup) => {
                        if (!!dup.k && typeof dup.v === 'string') return agg
                        return [...agg, {
                            ...dup,
                            keyError: typeof dup.v === 'string' && !(new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY)).test(dup.k) ? "Key must be of format /^[-_.a-zA-Z0-9]+$" : "",
                            valueError: dup.v !== 'string' && dup.k ? "Both key value pairs are required" : ""
                        }]
                    }, [])
                }
            case 'success':
            case 'error':
                return { ...state, submitLoading: false, overrideLoading: false }
            case 'toggleDialog':
                return { ...state, dialog: !state.dialog }
            case 'yaml-to-values':
                return { ...state, duplicate: action.value }
            default:
                return state
        }
    }

    const memoizedReducer = React.useCallback(reducer, [])

    function memoisedRemove(e, idx) {
        dispatch({ type: 'key-value-delete', value: { index: idx } })
    }

    const initialState = {
        mountPath: mountPath,
        loading: false,
        dialog: false,
        subPath: subPath,
        filePermission: { value: filePermission, error: "" },
        duplicate: data ? Object.keys(data).map(k => ({ k, v: data[k], keyError: "", valueError: "" })) : null
    }
    const [state, dispatch] = useReducer(memoizedReducer, initialState)
    const { appId, envId } = useParams<{ appId, envId }>()
    const tempArr = useRef([])
    function setKeyValueArray(arr) {
        tempArr.current = arr
    }
    const { yaml, handleYamlChange, error } = useKeyValueYaml(state.duplicate, setKeyValueArray, PATTERNS.CONFIG_MAP_AND_SECRET_KEY, `key must be of format ${PATTERNS.CONFIG_MAP_AND_SECRET_KEY}`)
    const [yamlMode, toggleYamlMode] = useState(true)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!filePermission)

    function changeEditorMode(e) {
        if (yamlMode) {
            if (state.duplicate) {
                dispatch({ type: 'yaml-to-values', value: tempArr.current })
            }
            toggleYamlMode(not)
            tempArr.current = []
            return
        }
        toggleYamlMode(not)
    }

    async function handleOverride(e) {
        e.preventDefault();
        if (state.duplicate) {
            if (data) {
                dispatch({ type: 'toggleDialog' })
            }
            else {
                //temporary copy, removecopy
                dispatch({ type: 'removeDuplicate' })
            }
        }
        else {
            //duplicate
            dispatch({ type: 'createDuplicate' })
        }
    }

    function stringify(value) {
        if (!value) return value
        if (typeof value === 'object') {
            return YAML.stringify(value, { indent: 4 })
        }
        if (typeof value === 'string') {
            return value
        }
        try {
            return value.toString();
        }
        catch (err) {
            return ""
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        let dataArray = yamlMode ? tempArr.current : state.duplicate;
        const isInvalid = dataArray.some(dup => ((!dup.k) || (!(new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY)).test(dup.k))))
        if (isInvalid) {
            if (!yamlMode) {
                dispatch({ type: 'createErrors' })
            }
            return
        }

        if (type === 'volume' && isFilePermissionChecked) {
            if (!state.filePermission.value) {
                dispatch({ type: 'filePermission', value: { value: state.filePermission.value, error: 'This is a requuired field' } })
                return
            }
            else if (state.filePermission.value.length > 4) {
                dispatch({ type: 'filePermission', value: { value: state.filePermission.value, error: 'More than 4 characters are not allowed' } })
                return
            }
            else if (state.filePermission.value.startsWith('0')) {
                if (state.filePermission.value.length !== 4) {
                    dispatch({ type: 'filePermission', value: { value: state.filePermission.value, error: 'This is octal format, please enter 4 characters' } })
                    return;
                }
            }
            else if (!state.filePermission.value.startsWith('0')) {
                if (state.filePermission.value.length !== 3) {
                    dispatch({ type: 'filePermission', value: { value: state.filePermission.value, error: 'This is not octal format, only 3 characters are allowed' } })
                    return;
                }
            }
        }
        if (dataArray.length === 0 && !external) {
            toast.error('Configmaps without any data are not allowed.')
            return
        }
        try {
            let payload = {
                name: name,
                type: type,
                external: external,
                data: dataArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v || "" }), {}),
            }

            if (type === 'volume') {
                payload['mountPath'] = state.mountPath;
                payload['subPath'] = state.subPath;
                if (isFilePermissionChecked) {
                    payload['filePermission'] = state.filePermission.value.length <= 3 ? `0${state.filePermissionValue.value}` : `${state.filePermissionValue.value}`;
                }
            }

            dispatch({ type: 'submitLoading' });
            await overRideConfigMap(id, +appId, +envId, [payload])
            await reload();
            toast.success(
                <div className="toast">
                    <div className="toast__title">Overridden</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>
            )
            toggleCollapse(collapse => !collapse)
            dispatch({ type: 'success' });
        }
        catch (err) {
            showError(err)
            dispatch({ type: 'error' })
        }
        finally {

        }
    }

    async function handleDelete(e) {
        try {
            const { result } = await deleteConfigMap(id, +appId, +envId, name)
            toggleCollapse(not)
            await reload()
            toast.success('Restored to global.')
            dispatch({ type: 'success' })
        }
        catch (err) {
            showError(err);
            dispatch({ type: 'error' })
        }
        finally {
            dispatch({ type: 'toggleDialog' })
        }
    }
    return <>
        {name && isGlobal ?
            <form onSubmit={handleSubmit} className="override-config-map-form">
                <Override
                    external={external && type === 'environment'}
                    overridden={!!state.duplicate}
                    onClick={handleOverride}
                    loading={state.overrideLoading} />
                <div className="form__row">
                    <label className="form__label">Data type</label>
                    <div className="form-row__select-external-type">
                        <Select disabled onChange={e => { }} >
                            <Select.Button>{external ? 'Kubernetes External ConfigMap' : "Kubernetes ConfigMap"}</Select.Button>
                        </Select>
                    </div>
                </div>
                {!name && external ? <div className="info__container mb-24">
                    <Info />
                    <div className="flex column left">
                        <div className="info__title">Using External Configmaps</div>
                        <div className="info__subtitle">Configmap will not be created by system. However, they will be used inside the pod. Please make sure that configmap with the same name is present in the environment.</div>
                    </div>
                </div> : null}
                <div className="form__row">
                    <label className="form__label">Usage type</label>
                    <input type="text" autoComplete="off" className="form__input half" value={type === 'volume' ? 'Data volume' : 'Environment variable'} disabled />
                </div>
                {type === 'volume' && <div className="form__row">
                    <label className="form__label">Volume mount path</label>
                    <div className="flex left">
                        <input type="text" autoComplete="off" className="form__input half"
                            value={state.duplicate ? state.mountPath : defaultMountPath}
                            disabled={!state.duplicate}
                            onChange={e => dispatch({ type: 'mountPath', value: e.target.value })} />
                    </div>
                </div>}
                {type === "volume" && <Checkbox isChecked={state.subPath}
                    onClick={(e) => { e.stopPropagation(); }}
                    disabled={!state.duplicate}
                    rootClassName="form__checkbox-label--ignore-cache"
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={(e) => { dispatch({ type: 'subPath', value: !state.subPath }) }}>
                    <span className="mr-5"> Set subPath (Required for sharing one volume for multiple uses in a single pod)</span>
                </Checkbox>}
                {type === "volume" && <div className="mb-16">
                    <Checkbox isChecked={isFilePermissionChecked}
                        onClick={(e) => { e.stopPropagation(); }}
                        disabled={!state.duplicate}
                        rootClassName="form__checkbox-label--ignore-cache"
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={(e) => { setIsFilePermissionChecked(!isFilePermissionChecked) }}>
                        <span className="mr-5"> Set File Permission (Corresponds to defaultMode specified in kubernetes)</span>
                    </Checkbox>
                </div>}
                {type === "volume" && isFilePermissionChecked ? <div className="mb-16">
                    <CustomInput value={state.filePermission.value}
                        autoComplete="off"
                        label={""}
                        disabled={!state.duplicate}
                        placeholder={"eg. 0400 or 400"}
                        error={state.filePermission.error}
                        onChange={(e) => dispatch({ type: 'filePermission', value: { value: e.target.value, error: "" } })} />
                </div> : null}
                {!external && <div className="flex left mb-16">
                    <b className="mr-5 bold">Data*</b>
                    <RadioGroup className="gui-yaml-switch" name="yaml-mode" initialTab={yamlMode ? 'yaml' : 'gui'} disabled={false} onChange={changeEditorMode}>
                        <RadioGroup.Radio value="gui">GUI</RadioGroup.Radio>
                        <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
                    </RadioGroup>
                </div>}
                {!external && <>
                    {yamlMode
                        ? <div className="yaml-container">
                            <CodeEditor
                                value={state.duplicate ? yaml : YAML.stringify(defaultData, { indent: 4 })}
                                mode="yaml"
                                inline
                                height={350}
                                onChange={handleYamlChange}
                                readOnly={!state.duplicate}
                                shebang="#key: value">
                                <CodeEditor.Header>
                                    <CodeEditor.ValidationError />
                                    <CodeEditor.Clipboard />
                                </CodeEditor.Header>
                                {error &&
                                    <div className="validation-error-block">
                                        <Info color="#f32e2e" style={{ height: '16px', width: '16px' }} />
                                        <div>{error}</div>
                                    </div>
                                }
                            </CodeEditor>
                        </div>
                        : state.duplicate
                            ? state.duplicate.map((config, idx) => <KeyValueInput keyLabel={type === 'volume' ? "File Name" : "Key"} valueLabel={type === 'volume' ? "File Content" : "Value"} {...config} index={idx} key={idx} onChange={(index, k, v) => dispatch({ type: 'key-value-change', value: { index, k, v } })} onDelete={memoisedRemove} />)
                            : Object.keys(defaultData).map((config, idx) => <KeyValueInput keyLabel={type === 'volume' ? "File Name" : "Key"} valueLabel={type === 'volume' ? "File Content" : "Value"} k={config} v={stringify(defaultData[config])} index={idx} onChange={null} onDelete={null} />)}
                </>}
                {state.duplicate && !yamlMode && <span className="bold anchor pointer" onClick={e => dispatch({ type: 'add-param' })}>+Add params</span>}
                {!(external && type === 'environment') && <div className="form__buttons">
                    <button disabled={!state.duplicate} className="cta" type="submit">{state.submitLoading ? <Progressing /> : 'Save'}</button>
                </div>}
            </form> : <ConfigMapForm
                id={id}
                appId={appId}
                name={name}
                external={external}
                data={data}
                type={type}
                mountPath={mountPath}
                isUpdate={!!name}
                collapse={e => toggleCollapse(isCollapsed => !isCollapsed)}
                index={null}
                update={(isSuccess) => reload()}
                subPath={subPath}
                filePermission={filePermission}
            />}
        {state.dialog && <ConfirmationDialog className="confirmation-dialog__body--w-360">
            <ConfirmationDialog.Icon src={warningIcon} />
            <ConfirmationDialog.Body title="Delete override ?" subtitle="Are you sure you want to delete the modified configuration. This action can’t be undone." />
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" onClick={e => dispatch({ type: 'toggleDialog' })}>Cancel</button>
                <button type="button" className="cta delete" onClick={handleDelete}>Confirm</button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>}
    </>
})


export function Override({ external, overridden, onClick, loading = false, type = "ConfigMap" }) {
    return (
        <div className="override-container mb-24">
            <Info />
            <div className="flex column left">
                <div className="override-title">{external ? 'Nothing to override' : overridden ? 'Restore default configuration' : 'Override default configuration'}</div>
                <div className="override-subtitle">{external ? `This ${type} does not have any overridable values.` : overridden ? 'Restoring will discard the current overrides and application default configuration will be applied.' : `Overriding will fork the ${type} for this environment. Updating the default values will no longer affect this configuration.`}</div>
            </div>
            {!external && <button className="cta ghosted override-button" onClick={onClick}>{loading ? <Progressing /> : overridden ? 'Delete override' : 'Allow override'}</button>}
        </div>
    )
}

export function prettifyData(value) {
    switch (typeof value) {
        case 'object':
            return YAML.stringify(value, { indent: 4 })
        case 'string':
            try {
                return YAML.stringify(JSON.parse(value), { indent: 4 })
            }
            catch (err) {
                return value.toString()
            }
    }
}