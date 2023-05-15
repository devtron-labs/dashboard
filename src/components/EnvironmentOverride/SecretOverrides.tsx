import React, { useEffect, useReducer, useRef, useState } from 'react'
import { deleteSecret, overRideSecret, unlockEnvSecret } from './service'
import { getEnvironmentSecrets, getAppChartRefForAppAndEnv } from '../../services/service'
import { useParams } from 'react-router'
import { ListComponent, Override } from './ConfigMapOverrides'
import {
    mapByKey,
    Pencil,
    useAsync,
    Select,
    RadioGroup,
    Info,
    CustomInput,
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
} from '../common'
import { showError, Progressing, ConfirmationDialog, Checkbox, CHECKBOX_VALUE, not } from '@devtron-labs/devtron-fe-common-lib'
import { SecretForm } from '../secrets/Secret'
import { KeyValueInput, useKeyValueYaml } from '../configMaps/ConfigMap'
import { toast } from 'react-toastify'
import warningIcon from '../../assets/icons/ic-warning.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { PATTERNS, ROLLOUT_DEPLOYMENT, DOCUMENTATION, MODES } from '../../config'
import { KeyValueFileInput } from '../util/KeyValueFileInput'
import { dataHeaders, getTypeGroups, sampleJSONs, hasHashiOrAWS, hasESO, CODE_EDITOR_RADIO_STATE, DATA_HEADER_MAP, CODE_EDITOR_RADIO_STATE_VALUE, VIEW_MODE, secretValidationInfoToast, handleSecretDataYamlChange } from '../secrets/secret.utils'
import { ComponentStates, SecretOverridesProps } from './EnvironmentOverrides.type'
import './environmentOverride.scss'

const SecretContext = React.createContext(null)
function useSecretContext() {
    const context = React.useContext(SecretContext)
    if (!context) {
        throw new Error(`Cannot be rendered outside component`)
    }
    return context
}

export default function SecretOverrides({ parentState, setParentState }: SecretOverridesProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [loading, result, error, reload] = useAsync(() => getEnvironmentSecrets(+appId, +envId), [+appId, +envId])
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()

    useEffect(() => {
        async function callGetAppChartRef() {
            const { result } = await getAppChartRefForAppAndEnv(appId, envId)
            setAppChartRef(result)
        }
        callGetAppChartRef()
    }, [appId])

    useEffect(() => {
        if (!loading && result) {
            setParentState(ComponentStates.loaded)
        }
    }, [loading])

    if (loading && !result) return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />
    if (error) {
        setParentState(ComponentStates.failed)
        showError(error)
        if (!result) return null
    }
    if (parentState === ComponentStates.loading || !result) return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />

    let {
        result: { configData, id },
    } = result
    configData = [{ name: '' }].concat(configData)
    let secrets = mapByKey(configData, 'name')

    return (
        <section className="secret-overrides">
            <SecretContext.Provider value={{ secrets, id, reload }}>
                {secrets &&
                    Array.from(secrets)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([name, { data, defaultData, global, esoSecretData, secretData, ...rest }]) => {
                            return (
                                <ListComponent
                                    key={name || Math.random().toString(36).substr(2, 5)}
                                    appChartRef={appChartRef}
                                    name={name}
                                    type="secret"
                                    label={global ? (data || esoSecretData.secretStore || secretData ? 'modified' : '') : 'env'}
                                />
                            )
                        })}
            </SecretContext.Provider>
        </section>
    )
}

export function OverrideSecretForm({ name, appChartRef, toggleCollapse }) {
    const { secrets, id, reload } = useSecretContext()
    const {
        data = null,
        defaultData = null,
        secretData = null,
        defaultSecretData = null,
        type = 'environment',
        external = false,
        mountPath = '',
        defaultMountPath = '',
        global: isGlobal = false,
        externalType = '',
        defaultPermissionNumber = '',
        filePermission = '',
        esoSecretData = null,
        defaultESOSecretData = null,
        subPath = false,
    } = secrets.has(name) ? secrets.get(name) : { type: 'environment', mountPath: '', externalType: '' }
    const { appId, envId } = useParams<{ appId; envId }>()

    function reducer(state, action) {
        switch (action.type) {
            case 'removeCopy':
                return { ...state, duplicate: null }
            case 'add-param':
                return {
                    ...state,
                    duplicate: (state.duplicate || []).concat([{ k: '', v: '', keyError: '', valueError: '' }]),
                }
            case 'mountPath':
                return { ...state, mountPath: action.value }
            case 'filePermission':
                return { ...state, filePermission: action.value }
            case 'subPath':
                return { ...state, subPath: action.value }
            case 'key-value-change':
                let duplicate = state.duplicate
                duplicate[action.value.index] = { k: action.value.k, v: action.value.v, keyError: '', valueError: '' }
                return {
                    ...state,
                    duplicate,
                }
            case 'key-value-delete':
                let dup2 = [...state.duplicate]
                dup2.splice(action.value.index, 1)
                return { ...state, duplicate: [...dup2] }
            case 'loadingOverride':
                return { ...state, loadingOverride: true }
            case 'loadingSubmit':
                return { ...state, loadingSubmit: true }
            case 'success':
            case 'error':
                return { ...state, loading: false, loadingOverride: false, loadingSubmit: false }
            case 'unlock':
                return {
                    ...state,
                    locked: false,
                    duplicate:
                        name && isGlobal && !isESO
                            ? Object.keys(action.value).map((k) => ({
                                  k,
                                  v: action.value[k],
                                  keyError: '',
                                  valueError: '',
                              }))
                            : action.value,
                }
            case 'toggleDialog':
                return { ...state, dialog: !state.dialog }
            case 'createErrors':
                return {
                    ...state,
                    duplicate: state.duplicate.reduce((agg, dup) => {
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
            case 'yaml-to-values':
                return { ...state, duplicate: action.value }
            default:
                return state
        }
    }

    let tempSecretData = (secretData || []).length === 0 && defaultSecretData ? defaultSecretData : secretData || []
    tempSecretData = tempSecretData.map((s) => {
        return { fileName: s.key, name: s.name, isBinary: s.isBinary, property: s.property }
    })

    let jsonForSecretDataYaml: any[] =
       secretData ? secretData : []
    if (jsonForSecretDataYaml.length === 0 && defaultSecretData) {
        jsonForSecretDataYaml = defaultSecretData
    }
    jsonForSecretDataYaml = jsonForSecretDataYaml.map((j) => {
        let temp = {}
        temp['isBinary'] = j.isBinary
        if (j.key) {
            temp['key'] = j.key
        }
        if (j.property) {
            temp['property'] = j.property
        }
        if (j.name) {
            temp['name'] = j.name
        }
        return temp
    })

    const initialDuplicate = () => {
        if (data) {
            return name && isGlobal
                ? Object.keys(data).map((k) => ({ k, v: data[k], keyError: '', valueError: '' }))
                : data
        } else if (name && isGlobal) {
            return secretData || (esoSecretData?.esoData && esoSecretData)
        } else {
            return null
        }
    }

    let tempEsoSecretData = (esoSecretData?.esoData || []).length === 0 && defaultESOSecretData ? defaultESOSecretData : esoSecretData

    const [roleARN, setRoleARN] = useState(secrets.has(name) ? secrets.get(name)?.roleARN : '')
    const [secretDataValue, setSecretData] = useState(tempSecretData)
    const [secretDataYaml, setSecretDataYaml] = useState(YAML.stringify(jsonForSecretDataYaml))
    const [codeEditorRadio, setCodeEditorRadio] = useState(CODE_EDITOR_RADIO_STATE.DATA)
    const isHashiOrAWS = hasHashiOrAWS(externalType)
    const isESO = hasESO(externalType)
    const memoisedReducer = React.useCallback(reducer, [appId, envId])
    const initialState = {
        mountPath: mountPath ? mountPath : defaultMountPath,
        loading: false,
        locked: !mountPath,
        dialog: false,
        subPath: subPath,
        filePermission: { value: filePermission, error: '' },
        duplicate: initialDuplicate(),
        permissionNumber: defaultPermissionNumber,
    }
    const [state, dispatch] = useReducer(memoisedReducer, initialState)
    const tempArr = useRef([])
    const { yaml, handleYamlChange, error } = useKeyValueYaml(
        state.duplicate || [],
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )
    const isEsoSecretData: boolean = (tempEsoSecretData?.secretStore || tempEsoSecretData?.secretStoreRef) && tempEsoSecretData.esoData
    const [yamlMode, toggleYamlMode] = useState(true)
    const [esoDataSecret, setEsoData] = useState(tempEsoSecretData?.esoData)
    const [secretStore, setSecretStore] = useState(tempEsoSecretData?.secretStore)
    const [secretStoreRef, setScretStoreRef] = useState(tempEsoSecretData?.secretStoreRef)
    const [refreshInterval, setRefreshInterval] = useState<string>(tempEsoSecretData?.refreshInterval)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!filePermission)
    const [esoSecretYaml, setEsoYaml] = useState(isEsoSecretData ? YAML.stringify(tempEsoSecretData) : '')
    const sample = YAML.stringify(sampleJSONs[externalType] || sampleJSONs[DATA_HEADER_MAP.DEFAULT])
    const isChartVersion309OrBelow =
        appChartRef &&
        appChartRef.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
        isChartRef3090OrBelow(appChartRef.id)

    useEffect(() => {
        if(isESO){
            toggleYamlMode(true)
        }
    },[isESO,yamlMode])

    function setKeyValueArray(arr) {
        tempArr.current = arr
    }

    function handleRoleARNChange(event) {
        setRoleARN(event.target.value)
    }

    function changeEditorMode(e) {
        if (yamlMode) {
            if (!state.locked) {
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
            if (data || secretData || esoSecretData?.esoData) {
                //delete
                dispatch({ type: 'toggleDialog' })
            } else {
                //temporary copy, removecopy
                dispatch({ type: 'removeCopy' })
            }
        } else {
            //duplicate
            unlockSecrets()
        }
    }

    async function unlockSecrets() {
        try {
            const {
                result: { configData },
            } = await unlockEnvSecret(id, +appId, +envId, name)
            let data = configData[0].data
            let temp = {}
            for (let i in data) {
                temp[i] = configData[0].externalType === '' ? atob(data[i]) : data[i]
            }
            dispatch({ type: 'unlock', value: temp })
            if (configData[0].secretData) {
                setSecretDataYaml(YAML.stringify(configData[0].secretData))
                let json = configData[0].secretData.map((s) => {
                    return {
                        fileName: s.key,
                        name: s.name,
                        property: s.property,
                        isBinary: s.isBinary,
                    }
                })
                setSecretData(json)
            }
            if(configData[0].esoSecretData?.esoData) {
                setEsoData(configData[0].esoSecretData.esoData)
                setSecretStore(configData[0].esoSecretData.secretStore)
                setScretStoreRef(configData[0].esoSecretData.secretStoreRef)
                setRefreshInterval(configData[0].esoSecretData.refreshInterval)
                setEsoYaml(YAML.stringify(configData[0].esoSecretData))
            }
        } catch (err) {
            showError(err)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const isInvalid = !isESO ? state.duplicate.some((dup) => !new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(dup.k)) : false
        if (isInvalid) {
            dispatch({ type: 'createErrors' })
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
        try {
            let dataArray = yamlMode ? tempArr.current : state.duplicate
            if (externalType === '' && dataArray.length == 0) {
                toast.error('Secret configuration without any data is not allowed.')
                return
            }
            if (isHashiOrAWS || isESO) {
                let isValid = true
                if (isESO) {
                    isValid = esoDataSecret?.reduce((isValid, s) => {
                        isValid = isValid && !!s?.secretKey && !!s.key
                        return isValid
                    }, (!secretStore != !secretStoreRef) && !!esoDataSecret?.length)
                } else {
                    isValid = secretDataValue.reduce((isValid, s) => {
                        isValid = isValid && !!s.fileName && !!s.name
                        return isValid
                    }, !!secretDataValue.length)
                }
                if (!isValid) {
                    secretValidationInfoToast(isESO,secretStore,secretStoreRef)
                    return
                }
            }
            let payload = {
                name: name,
                type: type,
                roleARN: isHashiOrAWS || isESO ? roleARN : '',
                external: !!externalType,
                externalType,
            }
            if (isHashiOrAWS) {
                payload['secretData'] = secretDataValue.map((s) => {
                    return {
                        key: s.fileName,
                        name: s.name,
                        isBinary: s.isBinary,
                        property: s.property,
                    }
                })
                payload['secretData'] = payload['secretData'].filter((s) => s.key || s.name || s.property)
            } else if (externalType === '') {
                payload[CODE_EDITOR_RADIO_STATE.DATA] = dataArray.reduce((agg, { k, v }) => {
                    agg[k] = externalType === '' ? btoa(v) : v
                    return agg
                }, {})
            } else if (isESO) {
                payload['esoSecretData'] = {
                    secretStore: secretStore,
                    esoData: esoDataSecret,
                    secretStoreRef: secretStoreRef,
                    refreshInterval: refreshInterval,
                }
            }
            if (type === 'volume') {
                payload['mountPath'] = state.mountPath
                if (externalType !== 'KubernetesSecret' && !isChartVersion309OrBelow) {
                    payload['subPath'] = state.subPath
                }
                if (isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] =
                        state.filePermission.value.length == 3
                            ? `0${state.filePermission.value}`
                            : `${state.filePermission.value}`
                }
            }
            dispatch({ type: 'loadingSubmit' })
            await overRideSecret(id, +appId, +envId, [payload])
            await reload()
            toast.success(
                <div className="toast">
                    <div className="toast__title">Overridden</div>
                    <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                </div>,
            )
            toggleCollapse(not)
            dispatch({ type: 'success' })
        } catch (err) {
            showError(err)
            dispatch({ type: 'error' })
        } finally {
        }
    }

    async function handleDelete(e) {
        try {
            await deleteSecret(id, +appId, +envId, name)
            await reload()
            toast.success('Successfully deleted.')
            toggleCollapse(not)
            dispatch('success')
        } catch (err) {
            showError(err)
            dispatch({ type: 'error' })
        } finally {
            dispatch({ type: 'toggleDialog' })
        }
    }

    function handleSecretDataChange(index: number, key: string, value: string | boolean): void {
        let json = secretDataValue
        setSecretData((state) => {
            state[index] = { ...state[index], [key]: value }
            json = state
            return [...state]
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
        let secretYaml = YAML.stringify(json)
        setSecretDataYaml(secretYaml)
    }

    function handleSecretDataDelete(index: number): void {
        let json = secretDataValue
        setSecretData((state) => {
            state.splice(index, 1)
            json = state
            return [...state]
        })
        json = json.map((j) => {
            return {
                key: j.fileName,
                name: j.name,
                property: j.property,
                isBinary: j.isBinary,
            }
        })
        let secretYaml = YAML.stringify(json)
        setSecretDataYaml(secretYaml)
    }

    const handleSecretYamlChange = (yaml) => {
        handleSecretDataYamlChange(
            yaml,
            codeEditorRadio,
            isESO,
            setEsoYaml,
            setSecretDataYaml,
            setSecretData,
            setEsoData,
            setSecretStore,
            setScretStoreRef,
            setRefreshInterval,
        )
    }

    const memoisedHandleChange = (index, k, v) => dispatch({ type: 'key-value-change', value: { index, k, v } })
    return (
        <>
            {name && isGlobal ? (
                <form onSubmit={handleSubmit} className="override-secrets-form">
                    <Override
                        external={externalType === 'KubernetesSecret' && type === 'environment'}
                        overridden={!!state.duplicate}
                        onClick={handleOverride}
                        type="Secret"
                    />
                    <div className="form__row">
                        <label className="form__label">Data type</label>
                        <div className="form-row__select-external-type">
                            <Select disabled onChange={(e) => {}}>
                                <Select.Button>
                                    {externalType
                                        ? getTypeGroups(externalType).label
                                        : getTypeGroups()[0].options[0].label}
                                </Select.Button>
                            </Select>
                        </div>
                    </div>
                    {externalType === 'KubernetesSecret' ? (
                        <div className="dc__info-container mb-24">
                            <Info />
                            <div className="flex column left">
                                <div className="dc__info-title">Using External Secrets</div>
                                <div className="dc__info-subtitle">
                                    Secrets will not be created by system. However, they will be used inside the pod.
                                    Please make sure that secret with the same name is present in the environment.
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className="form__row">
                        <label className="form__label">Usage type</label>
                        <input
                            type="text"
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
                                    value={state.mountPath}
                                    disabled={!state.duplicate}
                                    onChange={(e) => dispatch({ type: 'mountPath', value: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    {externalType !== 'KubernetesSecret' && type === 'volume' && (
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
                    {isHashiOrAWS || isESO ? (
                        <div className="form__row form__row--flex">
                            <div className="w-50">
                                <CustomInput
                                    value={roleARN}
                                    autoComplete="off"
                                    label={'Role ARN'}
                                    disabled={state.locked}
                                    placeholder={'Enter Role ARN'}
                                    onChange={(event) => {
                                        handleRoleARNChange(event)
                                    }}
                                />
                            </div>
                        </div>
                    ) : null}
                    {externalType !== 'KubernetesSecret' && (
                        <div className="flex left mb-16">
                            <b className="mr-5 dc__bold dc__required-field">Data</b>
                            {!isESO && (
                                <RadioGroup
                                    className="gui-yaml-switch"
                                    name="yaml-mode"
                                    initialTab={yamlMode ? VIEW_MODE.YAML : VIEW_MODE.GUI}
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
                            {state.locked && (
                                <div style={{ marginLeft: 'auto' }} className="edit flex" onClick={unlockSecrets}>
                                    <Pencil />
                                </div>
                            )}
                        </div>
                    )}

                    {externalType === '' && (
                        <>
                            {yamlMode ? (
                                <div className="yaml-container">
                                    <CodeEditor
                                        value={
                                            state.duplicate
                                                ? state.locked
                                                    ? YAML.stringify(
                                                          state.duplicate.reduce(
                                                              (agg, { k, v }) => ({
                                                                  ...agg,
                                                                  [k]: Array(8).fill('*').join(''),
                                                              }),
                                                              {},
                                                          ),
                                                          { indent: 2 },
                                                      )
                                                    : yaml
                                                : YAML.stringify(
                                                      Object.keys(defaultData).reduce(
                                                          (agg, k) => ({ ...agg, [k]: Array(8).fill('*').join('') }),
                                                          {},
                                                      ),
                                                      { indent: 2 },
                                                  )
                                        }
                                        mode={MODES.YAML}
                                        inline
                                        height={350}
                                        onChange={handleYamlChange}
                                        readOnly={state.locked}
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
                                        keyLabel={externalType === '' && type == 'Data Volume' ? 'File Name' : 'Key'}
                                        valueLabel={
                                            externalType === '' && type == 'Data Volume' ? 'File Content' : 'Value'
                                        }
                                        key={`editable-${idx}`}
                                        {...{ ...config, v: state.locked ? Array(8).fill('*').join('') : config.v }}
                                        index={idx}
                                        onChange={state.locked ? null : memoisedHandleChange}
                                    />
                                ))
                            ) : (
                                Object.keys(defaultData).map((config, idx) => (
                                    <KeyValueInput
                                        keyLabel={externalType === '' && type == 'Data Volume' ? 'File Name' : 'Key'}
                                        valueLabel={
                                            externalType === '' && type == 'Data Volume' ? 'File Content' : 'Value'
                                        }
                                        onDelete={null}
                                        key={`locked-${idx}`}
                                        k={config}
                                        v={Array(8).fill('*').join('')}
                                        index={idx}
                                        onChange={null}
                                    />
                                ))
                            )}
                        </>
                    )}
                    {(isHashiOrAWS || isESO) && yamlMode ? (
                        <div className="yaml-container">
                            <CodeEditor
                                value={
                                    codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE
                                        ? sample
                                        : isESO
                                        ? esoSecretYaml
                                        : secretDataYaml
                                }
                                mode={MODES.YAML}
                                inline
                                height={350}
                                onChange={handleSecretYamlChange}
                                readOnly={state.locked || codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE}
                                shebang={
                                    codeEditorRadio === CODE_EDITOR_RADIO_STATE.DATA
                                        ? '#Check sample for usage.'
                                        : dataHeaders[externalType] || dataHeaders[DATA_HEADER_MAP.DEFAULT]
                                }
                            >
                                <CodeEditor.Header>
                                    <RadioGroup
                                        className="gui-yaml-switch"
                                        name="data-mode"
                                        initialTab={codeEditorRadio}
                                        disabled={false}
                                        onChange={(event) => {
                                            setCodeEditorRadio(event.target.value)
                                        }}
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
                    ) : (
                        <React.Fragment>
                            {isHashiOrAWS &&
                                secretDataValue.map((data, index) => (
                                    <div>
                                        <KeyValueFileInput
                                            key={index}
                                            disabled={state.locked}
                                            fileName={data.fileName}
                                            index={index}
                                            name={data.name}
                                            property={data.property}
                                            isBinary={data.isBinary}
                                            handleChange={handleSecretDataChange}
                                            handleDelete={handleSecretDataDelete}
                                        />
                                    </div>
                                ))}
                        </React.Fragment>
                    )}
                    {!state.locked && !yamlMode && (
                        <span
                            className="dc__bold anchor pointer"
                            onClick={(event) => {
                                if (isHashiOrAWS)
                                    setSecretData((secretDataValue) => [
                                        ...secretDataValue,
                                        { fileName: '', property: '', name: '', isBinary: true },
                                    ])
                                else dispatch({ type: 'add-param' })
                            }}
                        >
                            +Add params
                        </span>
                    )}
                    {!(externalType === 'KubernetesSecret' && type === 'environment') && (
                        <div className="form__buttons">
                            <button className="cta" type="submit" disabled={state.locked}>
                                {state.submitLoading ? <Progressing /> : 'Save'}
                            </button>
                        </div>
                    )}
                </form>
            ) : (
                <SecretForm
                    id={id}
                    appChartRef={appChartRef}
                    appId={Number(appId)}
                    name={name}
                    external={external}
                    roleARN={roleARN}
                    secretData={secretDataValue.map((s) => {
                        return { key: s.fileName, name: s.name, property: s.property, isBinary: s.isBinary }
                    })}
                    esoSecretData={esoSecretData}
                    externalType={externalType}
                    data={state.duplicate}
                    type={type}
                    mountPath={mountPath}
                    isUpdate={!!name}
                    collapse={(e) => toggleCollapse((isCollapsed) => !isCollapsed)}
                    index={null}
                    update={(index, data) => {
                        if (!data) reload()
                        else {
                            let tempData = {}
                            for (let i in data.configData[0].data)
                                tempData[i] =
                                    data.configData[0].externalType === ''
                                        ? atob(data.configData[0].data[i])
                                        : data.configData[0].data[i]
                            dispatch({ type: 'unlock', value: tempData })
                        }
                    }}
                    initialise={() => {}}
                    filePermission={filePermission}
                    subPath={subPath}
                />
            )}
            {state.dialog && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warningIcon} />
                    <ConfirmationDialog.Body
                        title="This action will cause permanent removal."
                        subtitle="This action will cause all overrides to erase and app level configuration will be applied"
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
}