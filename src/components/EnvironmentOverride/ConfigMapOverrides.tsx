import React, { useEffect, useState, useReducer, useRef, memo } from 'react'
import { overRideConfigMap, deleteConfigMap } from './service'
import { getAppChartRefForAppAndEnv, getEnvironmentConfigs } from '../../services/service'
import { useParams } from 'react-router'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file.svg'
import { ReactComponent as KeyIcon } from '../../assets/icons/ic-key.svg'
import { ReactComponent as ArrowTriangle } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import {
    showError,
    Progressing,
    Info,
    ConfirmationDialog,
    Select,
    RadioGroup,
    not,
    CustomInput,
    Checkbox,
    CHECKBOX_VALUE,
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
} from '../common'
import { OverrideSecretForm } from './SecretOverrides'
import { ConfigMapForm, KeyValueInput, useKeyValueYaml } from '../configMaps/ConfigMap'
import { toast } from 'react-toastify'
import warningIcon from '../../assets/img/warning-medium.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { DOCUMENTATION, PATTERNS, ROLLOUT_DEPLOYMENT } from '../../config'
import './environmentOverride.scss'
import { ComponentStates, ConfigMapOverridesProps, ListComponentType } from './EnvironmentOverrides.type'

const ConfigMapContext = React.createContext(null)

function useConfigMapContext() {
    const context = React.useContext(ConfigMapContext)
    if (!context) {
        throw new Error(`outer usage not allowed`)
    }
    return context
}

export default function ConfigMapOverrides({ parentState, setParentState }: ConfigMapOverridesProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    // const [loading, result, error, reload] = useAsync(() => getEnvironmentConfigs(+appId, +envId), [+appId, +envId]);
    const [configMapList, setConfigMapList] = useState<{ id: number; configData: any[]; appId: number }>()
    const [configMapLoading, setConfigMapLoading] = useState(true)
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()

    useEffect(() => {
        if (!configMapLoading && configMapList) {
            setParentState(ComponentStates.loaded)
        }
    }, [configMapLoading])

    useEffect(() => {
        async function initialise() {
            setConfigMapLoading(true)
            try {
                const appChartRefRes = await getAppChartRefForAppAndEnv(appId, envId)
                const configmapRes = await getEnvironmentConfigs(appId, envId)
                setConfigMapList({
                    appId: configmapRes.result.appId,
                    id: configmapRes.result.id,
                    configData: configmapRes.result.configData || [],
                })
                if (!appChartRefRes.result) {
                    toast.error('Error happened while fetching the results. Please try again')
                    return
                }
                setAppChartRef(appChartRefRes.result)
            } catch (error) {
                setParentState(ComponentStates.failed)
                showError(error)
            } finally {
                setConfigMapLoading(false)
            }
        }
        initialise()
    }, [appId, envId])

    async function reload() {
        try {
            const configmapRes = await getEnvironmentConfigs(appId, envId)
            setConfigMapList({
                appId: configmapRes.result.appId,
                id: configmapRes.result.id,
                configData: configmapRes.result.configData || [],
            })
        } catch (error) {}
    }
    if (parentState === ComponentStates.loading || !configMapList)
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />

    if (configMapLoading && !configMapList) {
        return null
    }

    let configData = [{ id: null, name: null, defaultData: undefined, data: undefined }].concat(
        configMapList?.configData,
    )

    return (
        <section className="config-map-overrides">
            <ConfigMapContext.Provider value={{ configMapList, id: configMapList.id, reload }}>
                {configData.map(({ name, defaultData, data }) => (
                    <ListComponent
                        key={name || Math.random().toString(36).substr(2, 5)}
                        name={name}
                        appChartRef={appChartRef}
                        type="config-map"
                        label={defaultData ? (data ? 'modified' : null) : 'env'}
                    />
                ))}
            </ConfigMapContext.Provider>
        </section>
    )
}

export function ListComponent({ name = '', type, label = '', appChartRef }: ListComponentType) {
    const [isCollapsed, toggleCollapse] = useState(true)

    const handleOverrideListClick = () => {
        toggleCollapse(!isCollapsed)
    }

    return (
        <div className={`white-card white-card--list ${name ? '' : 'en-3 bw-1 dashed'}`}>
            <div className="environment-override-list pointer left flex" onClick={handleOverrideListClick}>
                {name ? (
                    type === 'config-map' ? (
                        <FileIcon className="icon-dim-24" />
                    ) : (
                        <KeyIcon className="icon-dim-24" />
                    )
                ) : (
                    <AddIcon className="icon-dim-24 fcb-5" />
                )}
                <div className={`flex left ${!name ? 'fw-5 fs-14 cb-5' : 'fw-5 fs-14 cn-9'}`}>
                    {name || `Add ${type === 'secret' ? 'Secret' : 'ConfigMap'}`}
                </div>
                {label && <div className="flex tag">{label}</div>}
                {name && (
                    <ArrowTriangle
                        className="icon-dim-24 rotate ml-auto"
                        style={{ ['--rotateBy' as any]: `${Number(!isCollapsed) * 180}deg` }}
                    />
                )}
            </div>
            {!isCollapsed && type !== 'config-map' && (
                <OverrideSecretForm name={name} appChartRef={appChartRef} toggleCollapse={toggleCollapse} />
            )}
            {!isCollapsed && type !== 'secret' && (
                <OverrideConfigMapForm
                    name={name}
                    appChartRef={appChartRef}
                    toggleCollapse={toggleCollapse}
                />
            )}
        </div>
    )
}

interface ConfigMapProps {
    name?: string
    appChartRef: { id: number; version: string; name: string }
    toggleCollapse: any
}

const OverrideConfigMapForm: React.FC<ConfigMapProps> = memo(function OverrideConfigMapForm({
    name,
    appChartRef,
    toggleCollapse,
}) {
    const { configMapList, id, reload } = useConfigMapContext()
    const configmap = configMapList.configData.find((cm) => cm.name === name)
    const {
        data = null,
        defaultData = {},
        type = 'environment',
        mountPath = '',
        external = false,
        externalType = '',
        defaultMountPath = '',
        subPath = false,
        filePermission = '',
        global: isGlobal = false,
    } = configmap ? configmap : { type: 'environment', mountPath: '', external: false }
    function reducer(state, action) {
        switch (action.type) {
            case 'createDuplicate':
                return {
                    ...state,
                    duplicate: Object.keys(defaultData).map((k) => ({
                        k,
                        v: defaultData[k],
                        keyError: '',
                        valueError: '',
                    })),
                    mountPath: state.mountPath || defaultMountPath,
                }
            case 'removeDuplicate':
                return { ...state, duplicate: null, mountPath: '' }
            case 'add-param':
                return { ...state, duplicate: state.duplicate.concat([{ k: '', v: '', keyError: '', valueError: '' }]) }
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
                    ...state,
                    duplicate: state.duplicate.reduce((agg, dup) => {
                        if (!!dup.k && typeof dup.v === 'string') return agg
                        return [
                            ...agg,
                            {
                                ...dup,
                                keyError:
                                    typeof dup.v === 'string' &&
                                    !new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(dup.k)
                                        ? "Key must consist of alphanumeric characters, '.', '-' and '_'"
                                        : '',
                                valueError: dup.v !== 'string' && dup.k ? 'Both key value pairs are required' : '',
                            },
                        ]
                    }, []),
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
        filePermission: { value: filePermission, error: '' },
        duplicate: data ? Object.keys(data).map((k) => ({ k, v: data[k], keyError: '', valueError: '' })) : null,
    }
    const [state, dispatch] = useReducer(memoizedReducer, initialState)
    const { appId, envId } = useParams<{ appId; envId }>()
    const tempArr = useRef([])
    function setKeyValueArray(arr) {
        tempArr.current = arr
    }
    const { yaml, handleYamlChange, error } = useKeyValueYaml(
        state.duplicate,
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )
    const [yamlMode, toggleYamlMode] = useState(true)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!filePermission)
    const isChartVersion309OrBelow =
        appChartRef &&
        appChartRef.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
        isChartRef3090OrBelow(appChartRef.id)

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
        e.preventDefault()
        if (state.duplicate) {
            if (data) {
                dispatch({ type: 'toggleDialog' })
            } else {
                //temporary copy, removecopy
                dispatch({ type: 'removeDuplicate' })
            }
        } else {
            //duplicate
            dispatch({ type: 'createDuplicate' })
        }
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

    async function handleSubmit(e) {
        e.preventDefault()
        let dataArray = yamlMode ? tempArr.current : state.duplicate
        const isInvalid = dataArray.some((dup) => !dup.k || !new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(dup.k))
        if (isInvalid) {
            if (!yamlMode) {
                dispatch({ type: 'createErrors' })
            }
            return
        }
        if (type === 'volume' && isFilePermissionChecked && !isChartVersion309OrBelow) {
            if (!state.filePermission.value) {
                dispatch({
                    type: 'filePermission',
                    value: { value: state.filePermission.value, error: 'This is a required field' },
                })
                return
            } else if (state.filePermission.value.length > 4) {
                dispatch({
                    type: 'filePermission',
                    value: { value: state.filePermission.value, error: 'More than 4 characters are not allowed' },
                })
                return
            } else if (state.filePermission.value.length === 4) {
                if (!state.filePermission.value.startsWith('0')) {
                    dispatch({
                        type: 'filePermission',
                        value: {
                            value: state.filePermission.value,
                            error: '4 characters are allowed in octal format only, first character should be 0',
                        },
                    })
                    return
                }
            } else if (state.filePermission.value.length < 3) {
                dispatch({
                    type: 'filePermission',
                    value: { value: state.filePermission.value, error: 'Atleast 3 character are required' },
                })
                return
            }
            if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(state.filePermission.value)) {
                dispatch({
                    type: 'filePermission',
                    value: {
                        value: state.filePermission.value,
                        error: 'This is octal number, use numbers between 0 to 7',
                    },
                })
                return
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
                data: dataArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v || '' }), {}),
            }

            if (type === 'volume') {
                payload['mountPath'] = state.mountPath
                if (!external && !isChartVersion309OrBelow) {
                    payload['subPath'] = state.subPath
                }
                if (isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] =
                        state.filePermission.value.length == 3
                            ? `0${state.filePermission.value}`
                            : `${state.filePermission.value}`
                }
            }

            dispatch({ type: 'submitLoading' })
            await overRideConfigMap(id, +appId, +envId, [payload])
            await reload()
            toast.success(
                <div className="toast">
                    <div className="toast__title">Overridden</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>,
            )
            toggleCollapse((collapse) => !collapse)
            dispatch({ type: 'success' })
        } catch (err) {
            showError(err)
            dispatch({ type: 'error' })
        } finally {
        }
    }

    async function handleDelete(e) {
        try {
            const { result } = await deleteConfigMap(id, +appId, +envId, name)
            toggleCollapse(not)
            await reload()
            toast.success('Restored to global.')
            dispatch({ type: 'success' })
        } catch (err) {
            showError(err)
            dispatch({ type: 'error' })
        } finally {
            dispatch({ type: 'toggleDialog' })
        }
    }
    return (
        <>
            {name && isGlobal ? (
                <form onSubmit={handleSubmit} className="override-config-map-form">
                    <Override
                        external={external && type === 'environment'}
                        overridden={!!state.duplicate}
                        onClick={handleOverride}
                        loading={state.overrideLoading}
                    />
                    <div className="form__row">
                        <label className="form__label">Data type</label>
                        <div className="form-row__select-external-type">
                            <Select disabled onChange={(e) => {}}>
                                <Select.Button>
                                    {external ? 'Kubernetes External ConfigMap' : 'Kubernetes ConfigMap'}
                                </Select.Button>
                            </Select>
                        </div>
                    </div>
                    {!name && external ? (
                        <div className="dc__info-container mb-24">
                            <Info />
                            <div className="flex column left">
                                <div className="dc__info-title">Using External Configmaps</div>
                                <div className="dc__info-subtitle">
                                    Configmap will not be created by system. However, they will be used inside the pod.
                                    Please make sure that configmap with the same name is present in the environment.
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className="form__row">
                        <label className="form__label">Usage type</label>
                        <input
                            type="text"
                            autoComplete="off"
                            className="form__input half"
                            value={type === 'volume' ? 'Data volume' : 'Environment variable'}
                            disabled
                        />
                    </div>
                    {type === 'volume' && (
                        <div className="form__row">
                            <label className="form__label">Volume mount path</label>
                            <div className="flex left">
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className="form__input half"
                                    value={state.duplicate ? state.mountPath : defaultMountPath}
                                    disabled={!state.duplicate}
                                    onChange={(e) => dispatch({ type: 'mountPath', value: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    {!external && type === 'volume' && (
                        <Checkbox
                            isChecked={state.subPath}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            disabled={!state.duplicate || isChartVersion309OrBelow}
                            rootClassName=""
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={(e) => {
                                dispatch({ type: 'subPath', value: !state.subPath })
                            }}
                        >
                            <span className="mr-5">
                                Set SubPath (same as
                                <a
                                    href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath"
                                    className="ml-5 mr-5 anchor"
                                    target="_blank"
                                    rel="noopener noreferer"
                                >
                                    subPath
                                </a>
                                for volume mount)<br></br>
                                {state.subPath ? (
                                    <span className="mb-0 cn-5 fs-11">Keys will be used as filename for subpath</span>
                                ) : null}
                                {isChartVersion309OrBelow ? (
                                    <span className="fs-12 fw-5">
                                        <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                                        <span className="cn-7 ml-5">Learn more about </span>
                                        <a
                                            href={DOCUMENTATION.APP_ROLLOUT_DEPLOYMENT_TEMPLATE}
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            Deployment Template &gt; Chart Version
                                        </a>
                                    </span>
                                ) : null}
                            </span>
                        </Checkbox>
                    )}
                    {type === 'volume' && (
                        <div className="mb-16">
                            <Checkbox
                                isChecked={isFilePermissionChecked}
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                                disabled={!state.duplicate || isChartVersion309OrBelow}
                                rootClassName=""
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={(e) => {
                                    setIsFilePermissionChecked(!isFilePermissionChecked)
                                }}
                            >
                                <span className="mr-5">
                                    {' '}
                                    Set File Permission (same as
                                    <a
                                        href="https://kubernetes.io/docs/concepts/configuration/secret/#secret-files-permissions"
                                        className="ml-5 mr-5 anchor"
                                        target="_blank"
                                        rel="noopener noreferer"
                                    >
                                        defaultMode
                                    </a>
                                    for secrets in kubernetes)<br></br>
                                    {isChartVersion309OrBelow ? (
                                        <span className="fs-12 fw-5">
                                            <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                                            <span className="cn-7 ml-5">Learn more about </span>
                                            <a
                                                href={DOCUMENTATION.APP_ROLLOUT_DEPLOYMENT_TEMPLATE}
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                Deployment Template &gt; Chart Version
                                            </a>
                                        </span>
                                    ) : null}
                                </span>
                            </Checkbox>
                        </div>
                    )}
                    {type === 'volume' && isFilePermissionChecked ? (
                        <div className="mb-16">
                            <CustomInput
                                value={state.filePermission.value}
                                autoComplete="off"
                                label={''}
                                disabled={!state.duplicate || isChartVersion309OrBelow}
                                placeholder={'eg. 0400 or 400'}
                                error={state.filePermission.error}
                                onChange={(e) => {
                                    dispatch({ type: 'filePermission', value: { value: e.target.value, error: '' } })
                                }}
                            />
                        </div>
                    ) : null}
                    {!external && (
                        <div className="flex left mb-16">
                            <b className="mr-5 dc__bold">Data*</b>
                            <RadioGroup
                                className="gui-yaml-switch"
                                name="yaml-mode"
                                initialTab={yamlMode ? 'yaml' : 'gui'}
                                disabled={false}
                                onChange={changeEditorMode}
                            >
                                <RadioGroup.Radio value="gui">GUI</RadioGroup.Radio>
                                <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
                            </RadioGroup>
                        </div>
                    )}
                    {!external && (
                        <>
                            {yamlMode ? (
                                <div className="yaml-container">
                                    <CodeEditor
                                        value={state.duplicate ? yaml : YAML.stringify(defaultData, { indent: 2 })}
                                        mode="yaml"
                                        inline
                                        height={350}
                                        onChange={handleYamlChange}
                                        readOnly={!state.duplicate}
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
                            ) : state.duplicate ? (
                                state.duplicate.map((config, idx) => (
                                    <KeyValueInput
                                        keyLabel={type === 'volume' ? 'File Name' : 'Key'}
                                        valueLabel={type === 'volume' ? 'File Content' : 'Value'}
                                        {...config}
                                        index={idx}
                                        key={idx}
                                        onChange={(index, k, v) =>
                                            dispatch({ type: 'key-value-change', value: { index, k, v } })
                                        }
                                        onDelete={memoisedRemove}
                                    />
                                ))
                            ) : (
                                Object.keys(defaultData).map((config, idx) => (
                                    <KeyValueInput
                                        keyLabel={type === 'volume' ? 'File Name' : 'Key'}
                                        valueLabel={type === 'volume' ? 'File Content' : 'Value'}
                                        k={config}
                                        v={stringify(defaultData[config])}
                                        index={idx}
                                        onChange={null}
                                        onDelete={null}
                                    />
                                ))
                            )}
                        </>
                    )}
                    {state.duplicate && !yamlMode && (
                        <span className="dc__bold anchor pointer" onClick={(e) => dispatch({ type: 'add-param' })}>
                            +Add params
                        </span>
                    )}
                    {!(external && type === 'environment') && (
                        <div className="form__buttons">
                            <button disabled={!state.duplicate} className="cta" type="submit">
                                {state.submitLoading ? <Progressing /> : 'Save'}
                            </button>
                        </div>
                    )}
                </form>
            ) : (
                <ConfigMapForm
                    appChartRef={appChartRef}
                    id={id}
                    appId={appId}
                    name={name}
                    external={external}
                    data={data}
                    type={type}
                    mountPath={mountPath}
                    isUpdate={!!name}
                    collapse={(e) => toggleCollapse((isCollapsed) => !isCollapsed)}
                    index={null}
                    update={(isSuccess) => reload()}
                    subPath={subPath}
                    filePermission={filePermission}
                />
            )}
            {state.dialog && (
                <ConfirmationDialog className="confirmation-dialog__body--w-400">
                    <ConfirmationDialog.Icon src={warningIcon} />
                    <ConfirmationDialog.Body
                        title="Delete override ?"
                        subtitle="Are you sure you want to delete the modified configuration. This action can’t be undone."
                    />
                    <ConfirmationDialog.ButtonGroup>
                        <button
                            type="button"
                            className="cta cancel"
                            onClick={(e) => dispatch({ type: 'toggleDialog' })}
                        >
                            Cancel
                        </button>
                        <button type="button" className="cta delete" onClick={handleDelete}>
                            Confirm
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </>
    )
})

export function Override({ external, overridden, onClick, loading = false, type = 'ConfigMap' }) {
    return (
        <div className={`override-container mb-24 ${overridden ? 'override-warning' : ''}`}>
            {overridden ? <WarningIcon className="icon-dim-20" /> : <InfoIcon className="icon-dim-20" />}
            <div className="flex column left">
                <div className="override-title">
                    {external
                        ? 'Nothing to override'
                        : overridden
                        ? 'Base configurations are overridden'
                        : 'Inheriting base configurations'}
                </div>
                <div className="override-subtitle">
                    {external
                        ? `This ${type} does not have any overridable values.`
                        : overridden
                        ? 'Deleting will discard the current overrides and base configuration will be applicable to this environment.'
                        : `Overriding will fork the ${type} for this environment. Updating the base values will no longer affect this configuration.`}
                </div>
            </div>
            {!external && (
                <button className={`cta override-button ${overridden ? 'delete scr-5' : 'ghosted'}`} onClick={onClick}>
                    {loading ? (
                        <Progressing />
                    ) : overridden ? (
                        <>
                            <DeleteIcon className="icon-dim-16 mr-8" />
                            <span>Delete override</span>
                        </>
                    ) : (
                        'Allow override'
                    )}
                </button>
            )}
        </div>
    )
}

export function prettifyData(value) {
    switch (typeof value) {
        case 'object':
            return YAML.stringify(value, { indent: 2 })
        case 'string':
            try {
                return YAML.stringify(JSON.parse(value), { indent: 2 })
            } catch (err) {
                return value.toString()
            }
    }
}