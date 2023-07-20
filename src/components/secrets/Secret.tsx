import React, { useState, useEffect, useRef } from 'react'
import {
    RadioGroup,
    Info,
    ToastBody,
    CustomInput,
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
} from '../common'
import {
    showError,
    Progressing,
    DeleteDialog,
    Checkbox,
    CHECKBOX_VALUE,
    InfoColourBar,
    not,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { useParams } from 'react-router'
import { updateSecret, deleteSecret, getSecretKeys } from '../secrets/service'
import { getAppChartRef } from '../../services/service'
import {
    overRideSecret,
    deleteSecret as deleteEnvironmentSecret,
    unlockEnvSecret,
} from '../EnvironmentOverride/service'
import { toast } from 'react-toastify'
import { KeyValueInput, useKeyValueYaml, validateKeyValuePair } from '../configMaps/ConfigMap'
import { getSecretList } from '../../services/service'
import CodeEditor from '../CodeEditor/CodeEditor'
import { DOCUMENTATION, MODES, PATTERNS, ROLLOUT_DEPLOYMENT, URLS } from '../../config'
import YAML from 'yaml'
import keyIcon from '../../assets/icons/ic-key.svg'
import addIcon from '../../assets/icons/ic-add.svg'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { KeyValueFileInput } from '../util/KeyValueFileInput'
import '../configMaps/ConfigMap.scss'
import { decode } from '../../util/Util'
import {
    dataHeaders,
    getTypeGroups,
    GroupHeading,
    groupStyle,
    sampleJSONs,
    SecretOptions,
    hasHashiOrAWS,
    hasESO,
    CODE_EDITOR_RADIO_STATE,
    DATA_HEADER_MAP,
    CODE_EDITOR_RADIO_STATE_VALUE,
    VIEW_MODE,
    secretValidationInfoToast,
    handleSecretDataYamlChange,
} from './secret.utils'
import { EsoData, SecretFormProps } from '../deploymentConfig/types'
import { NavLink } from 'react-router-dom'
import { INVALID_YAML_MSG } from '../../config/constantMessaging'

const Secret = ({ respondOnSuccess, isJobView } : {respondOnSuccess: ()=> void, isJobView?: boolean }) => {
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [list, setList] = useState(null)
    const [secretLoading, setSecretLoading] = useState(true)

    useEffect(() => {
        initialise()
    }, [])
    const { appId } = useParams<{ appId }>()

    async function initialise() {
        try {
            const appChartRefRes = await getAppChartRef(appId)
            const { result } = await getSecretList(appId)
            if (Array.isArray(result.configData)) {
                result.configData = result.configData.map((config) => {
                    if (config.data) {
                        config.data = decode(config.data) //doesnt do anything because data.value will be empty
                    }
                    return config
                })
            }
            setAppChartRef(appChartRefRes.result)
            setList(result)
        } catch (err) {
            showError(err)
        } finally {
            setSecretLoading(false)
        }
    }

    function update(index, result) {
        try {
            setList((list) => {
                let configData = list.configData
                if (result === null) {
                    //delete
                    configData.splice(index, 1)
                    list.configData = [...configData]
                    return { ...list }
                } else if (typeof index !== 'number' && Array.isArray(result.configData)) {
                    //insert after create success
                    configData.unshift({
                        ...result.configData[0],
                        data:
                            result.configData[0].externalType === ''
                                ? decode(result.configData[0].data)
                                : result.configData[0].data,
                    })
                    list.configData = [...configData]
                    return { ...list }
                } else {
                    //unlock
                    configData[index] =
                        result && Array.isArray(result.configData) && result.configData.length > 0
                            ? result.configData[0]
                            : null
                    list.configData[index] = {
                        ...list.configData[index],
                        data:
                            result.configData[0].externalType === ''
                                ? decode(result.configData[0].data)
                                : result.configData[0].data,
                    }
                    return { ...list }
                }
            })
        } catch (err) {}
    }

    if (secretLoading) return <Progressing pageLoader />
    return (
        <div className="form__app-compose">
            <h1 className="form__title form__title--artifacts">Secrets</h1>
            <p className="form__subtitle form__subtitle--artifacts">
                A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys.
                <a className="dc__link" rel="noreferer noopener" href={DOCUMENTATION.APP_CREATE_SECRET} target="blank">
                    {' '}
                    Learn more about Secrets
                </a>
            </p>
            <CollapsedSecretForm
                appId={appId}
                id={list?.id || 0}
                title="Add Secret"
                appChartRef={appChartRef}
                update={update}
                initialise={initialise}
                isJobView={isJobView}
            />
            {list &&
                Array.isArray(list.configData) &&
                list.configData
                    .filter((cs) => cs)
                    .map((cs, idx) => (
                        <CollapsedSecretForm
                            key={cs.name}
                            {...cs}
                            appChartRef={appChartRef}
                            appId={appId}
                            id={list.id}
                            update={update}
                            index={idx}
                            initialise={initialise}
                            isJobView={isJobView}
                        />
                    ))}
        </div>
    )
}

export function CollapsedSecretForm({
    title = '',
    roleARN = '',
    appChartRef,
    secretData = [],
    mountPath = '',
    name = '',
    type = 'environment',
    external = false,
    data = null,
    id = null,
    appId,
    update = null,
    index = null,
    initialise = null,
    externalType = '',
    filePermission = '',
    subPath = false,
    esoSecretData = null,
    isJobView = false, 
    ...rest
}) {
    const [collapsed, toggleCollapse] = useState(true)
    return (
        <section className="mb-12 br-8 bcn-0 bw-1 en-2 pl-20 pr-20 pt-19 pb-19">
            {collapsed ? (
                <ListComponent
                    title={name || title}
                    onClick={(e) => toggleCollapse(!collapsed)}
                    icon={title ? addIcon : keyIcon}
                    collapsible={!title}
                    className={title ? 'fw-5 cb-5 fs-14' : 'fw-5 cn-9 fs-14'}
                />
            ) : (
                <SecretForm
                    name={name}
                    appChartRef={appChartRef}
                    secretData={secretData}
                    mountPath={mountPath}
                    roleARN={roleARN}
                    type={type}
                    external={external}
                    data={data}
                    id={id}
                    appId={appId}
                    isUpdate={!title}
                    collapse={(e) => toggleCollapse(!collapsed)}
                    update={update}
                    index={index}
                    keyValueEditable={false}
                    initialise={initialise}
                    externalType={externalType}
                    subPath={subPath}
                    filePermission={filePermission}
                    esoSecretData={esoSecretData}
                    isJobView={isJobView}
                />
            )}
        </section>
    )
}

export function Tab({ title, active, onClick }) {
    return (
        <nav className={`form__tab white-card flex left ${active ? 'active' : ''}`} onClick={(e) => onClick(title)}>
            <div className="tab__selector"></div>
            <div data-testid={`secret-${title.toLowerCase().split(' ').join('-')}-radio-button`} className="tab__title">{title}</div>
        </nav>
    )
}

export function ListComponent({ icon = '', title, subtitle = '', onClick, className = '', collapsible = false }) {
    return (
        <article
            className={`dc__configuration-list pointer ${className}`}
            onClick={typeof onClick === 'function' ? onClick : function () {}}
        >
            <img src={icon} className="configuration-list__logo icon-dim-24 fcb-5" />
            <div data-testid={`add-secret-button`} className="configuration-list__info">
                <div className="">{title}</div>
                {subtitle && <div className="configuration-list__subtitle">{subtitle}</div>}
            </div>
            {collapsible && <img className="configuration-list__arrow pointer" src={arrowTriangle} />}
        </article>
    )
}

export const SecretForm: React.FC<SecretFormProps> = function (props) {
    const [selectedTab, selectTab] = useState(props.type === 'environment' ? 'Environment Variable' : 'Data Volume')
    const [externalValues, setExternalValues] = useState([])
    const [configName, setName] = useState({ value: props.name, error: '' })
    const [volumeMountPath, setVolumeMountPath] = useState({ value: props.mountPath, error: '' })
    const [roleARN, setRoleARN] = useState({ value: props.roleARN, error: '' })
    const [loading, setLoading] = useState(false)
    const [secretMode, toggleSecretMode] = useState(props.isUpdate)
    const [externalType, setExternalType] = useState(props.externalType)
    const { appId, envId } = useParams<{ appId; envId }>()
    const [yamlMode, toggleYamlMode] = useState(true)
    const { yaml, handleYamlChange, error } = useKeyValueYaml(
        externalValues,
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )
    const { yaml: lockedYaml } = useKeyValueYaml(
        externalValues.map(({ k, v }) => ({ k, v: Array(8).fill('*').join('') })),
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )
    const tempArray = useRef([])
    const [isSubPathChecked, setIsSubPathChecked] = useState(!!props.subPath)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!props.filePermission)
    const [filePermissionValue, setFilePermissionValue] = useState({ value: props.filePermission, error: '' })
    const isChartVersion309OrBelow =
        props.appChartRef &&
        props.appChartRef.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(props.appChartRef.version, [3, 9]) &&
        isChartRef3090OrBelow(props.appChartRef.id)
    const [externalSubpathValues, setExternalSubpathValues] = useState<{ value: string; error: string }>({
        value: props.data ? Object.keys(props.data).join(',') : '',
        error: '',
    })
    const isHashiOrAWS = hasHashiOrAWS(externalType)

    const isESO = hasESO(externalType)
    let tempSecretData: any[] = props?.secretData || []
    tempSecretData = tempSecretData.map((s) => {
        return {
            fileName: s.key,
            name: s.name,
            isBinary: s.isBinary,
            property: s.property,
        }
    })
    let jsonForSecretDataYaml: any[] = props?.secretData || []
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
    const isEsoSecretData =
        (props.esoSecretData?.secretStore || props.esoSecretData?.secretStoreRef) &&
        props.esoSecretData?.esoData.length > 0
    const [esoSecretData, setEsoData] = useState<EsoData[]>(props?.esoSecretData?.esoData)
    const [secretStore, setSecretStore] = useState(props.esoSecretData?.secretStore)
    const [secretData, setSecretData] = useState(tempSecretData)
    const [secretStoreRef, setScretStoreRef] = useState(props.esoSecretData?.secretStoreRef)
    const [refreshInterval, setRefreshInterval] = useState<string>(props.esoSecretData?.refreshInterval)
    const [secretDataYaml, setSecretDataYaml] = useState(YAML.stringify(jsonForSecretDataYaml))
    const [esoSecretYaml, setEsoYaml] = useState(isEsoSecretData ? YAML.stringify(props?.esoSecretData) : '')
    const [codeEditorRadio, setCodeEditorRadio] = useState(CODE_EDITOR_RADIO_STATE.DATA)
    const isExternalValues = externalType !== 'KubernetesSecret'
    const tabs = [{ title: 'Environment Variable' }, { title: 'Data Volume' }].map((data) => ({
        ...data,
        active: data.title === selectedTab,
    }))
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const sample = YAML.stringify(sampleJSONs[externalType] || sampleJSONs[DATA_HEADER_MAP.DEFAULT])

    function setKeyValueArray(arr) {
        tempArray.current = arr
    }
    useEffect(() => {
        if (props.data) {
            setExternalValues(
                Object.keys(props.data).map((k) => ({
                    k,
                    v: typeof props.data[k] === 'object' ? YAML.stringify(props.data[k], { indent: 2 }) : props.data[k],
                    keyError: '',
                    valueError: '',
                })),
            )
        } else {
            setExternalValues([{ k: '', v: '', keyError: '', valueError: '' }])
        }
    }, [props.data])

    useEffect(() => {
        if (!props.isUpdate) return
        handleSecretFetch()
    }, [])

    useEffect(() => {
        if (isESO) {
            toggleYamlMode(true)
        }
    }, [isESO, yamlMode])

    function handleRoleARNChange(event) {
        setRoleARN({ value: event.target.value, error: '' })
    }

    function handleChange(index, k, v) {
        setExternalValues((state) => {
            state[index] = { k, v, keyError: '', valueError: '' }
            return [...state]
        })
    }

    async function handleSecretFetch() {
        try {
            if (envId) {
                const { result } = await unlockEnvSecret(props.id, props.appId, +envId, props.name)
                props.update(props.index, result)
                toggleSecretMode(false)
            } else {
                const { result } = await getSecretKeys(props.id, props.appId, props.name)
                props.update(props.index, result)
                toggleSecretMode(false)
            }
        } catch (err) {
            toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
        }
    }

    async function handleDelete() {
        try {
            if (!envId) {
                await deleteSecret(props.id, props.appId, props.name)
                toast.success('Successfully deleted')
                props.update(props.index, null)
            } else {
                await deleteEnvironmentSecret(props.id, props.appId, +envId, props.name)
                toast.success('Successfully deleted')
                props.update(props.index, null)
            }
        } catch (err) {
            showError(err)
        }
    }

    async function handleSubmit(e) {
        const secretNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME)

        if (secretMode) {
            toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
            return
        }
        if (!configName.value) {
            setName({ value: '', error: 'This is a required field' })
            return
        }
        if (configName.value.length > 253) {
            setName({ value: configName.value, error: 'More than 253 characters are not allowed' })
            return
        }
        if (!secretNameRegex.test(configName.value)) {
            setName({
                value: configName.value,
                error: `Name must start and end with an alphanumeric character. It can contain only lowercase alphanumeric characters, '-' or '.'`,
            })
            return
        }

        if (selectedTab === 'Data Volume' && !volumeMountPath.value) {
            setVolumeMountPath({ value: volumeMountPath.value, error: 'This is a required field' })
            return
        }
        if (selectedTab === 'Data Volume' && isFilePermissionChecked && !isChartVersion309OrBelow) {
            if (!filePermissionValue.value) {
                setFilePermissionValue({ value: filePermissionValue.value, error: 'This is a required field' })
                return
            } else if (filePermissionValue.value.length > 4) {
                setFilePermissionValue({
                    value: filePermissionValue.value,
                    error: 'More than 4 characters are not allowed',
                })
                return
            } else if (filePermissionValue.value.length === 4) {
                if (!filePermissionValue.value.startsWith('0')) {
                    setFilePermissionValue({
                        value: filePermissionValue.value,
                        error: '4 characters are allowed in octal format only, first character should be 0',
                    })
                    return
                }
            } else if (filePermissionValue.value.length < 3) {
                setFilePermissionValue({ value: filePermissionValue.value, error: 'Atleast 3 character are required' })
                return
            }
        }
        if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(filePermissionValue.value)) {
            setFilePermissionValue({
                value: filePermissionValue.value,
                error: 'This is octal number, use numbers between 0 to 7',
            })
            return
        }
        if (selectedTab === 'Data Volume' && isSubPathChecked && !isExternalValues) {
            if (!externalSubpathValues.value) {
                setExternalSubpathValues({ value: externalSubpathValues.value, error: 'This is a required field' })
                return
            }
            if (!new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_MULTPLS_KEYS).test(externalSubpathValues.value)) {
                setExternalSubpathValues({
                    value: externalSubpathValues.value,
                    error: `Use (a-z), (0-9), (-), (_), (.); Use (,) to separate multiple keys`,
                })
                return
            }
        }
        let dataArray = yamlMode ? tempArray.current : externalValues
        const { isValid, arr } = validateKeyValuePair(dataArray)
        if (!isValid) {
            toast.error(INVALID_YAML_MSG);
            setKeyValueArray(arr)
            return
        }
        if (externalType === '' && !arr.length) {
            toast.error('Please add secret data before saving.')
            return
        }

        if (isHashiOrAWS || isESO) {
            let isValid = true
            if (isESO) {
                isValid = esoSecretData?.reduce((isValid, s) => {
                    isValid = isValid && !!s?.secretKey && !!s.key
                    return isValid
                }, !secretStore != !secretStoreRef && !!esoSecretData?.length)
            } else {
                isValid = secretData.reduce((isValid, s) => {
                    isValid = isValid && !!s.fileName && !!s.name
                    return isValid
                }, !!secretData.length)
            }

            if (!isValid) {
                secretValidationInfoToast(isESO, secretStore, secretStoreRef)
                return
            }
        }
        setLoading(true)
        try {
            let data = arr.reduce((agg, curr) => {
                let value = curr.v
                agg[curr.k] = externalType === '' ? btoa(value) : value //encode only when Kubernetes Secret
                return agg
            }, {})
            //Add Mandatory fields
            let payload = {
                name: configName.value,
                type: selectedTab === 'Environment Variable' ? 'environment' : 'volume',
                external: !!externalType,
                roleARN: isHashiOrAWS || isESO ? roleARN.value : '',
                externalType,
            }
            //Adding conditional fields
            if (isHashiOrAWS) {
                payload['secretData'] = secretData.map((s) => {
                    return {
                        key: s.fileName,
                        name: s.name,
                        isBinary: s.isBinary,
                        property: s.property,
                    }
                })
                payload['secretData'] = payload['secretData'].filter((s) => s.key || s.name || s.property)
            } else if (externalType === '') {
                payload[CODE_EDITOR_RADIO_STATE.DATA] = data
            } else if (isESO) {
                payload['esoSecretData'] = {
                    secretStore: secretStore,
                    esoData: esoSecretData,
                    secretStoreRef: secretStoreRef,
                    refreshInterval: refreshInterval,
                }
            }

            if (selectedTab === 'Data Volume') {
                payload['mountPath'] = volumeMountPath.value
                if (!isChartVersion309OrBelow) {
                    payload['subPath'] = isSubPathChecked
                }
                if (isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] =
                        filePermissionValue.value.length == 3
                            ? `0${filePermissionValue.value}`
                            : `${filePermissionValue.value}`
                }
                if (!isExternalValues && isSubPathChecked) {
                    const externalSubpathKey = externalSubpathValues.value.replace(/\s+/g, '').split(',')
                    const secretKeys = {}
                    externalSubpathKey.forEach((key) => (secretKeys[key] = ''))
                    payload[CODE_EDITOR_RADIO_STATE.DATA] = secretKeys
                }
            }

            if (!envId) {
                const { result } = await updateSecret(props.id, +props.appId, payload)
                toast.success(
                    <ToastBody
                        title={`${props.name ? 'Updated' : 'Saved'}`}
                        subtitle="Changes will be reflected after next deployment."
                    />,
                )
                if (typeof props.update === 'function') {
                    props.update(props.index, result)
                }
                props.collapse()
            } else {
                await overRideSecret(props.id, +props.appId, +envId, [payload])
                toast.success(
                    <ToastBody title="Overridden" subtitle="Changes will be reflected after next deployment." />,
                )
                props.collapse()
                props.update(true)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    function handleSecretDataChange(index: number, key: string, value: string | boolean): void {
        let json = secretData
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

    const closeDeleteCIModal = (): void => {
        setShowDeleteModal(false)
    }

    const showDeleteCIModal = (): void => {
        setShowDeleteModal(true)
    }

    const renderDeleteCIModal = () => {
        return (
            <DeleteDialog
                title={`Delete Secret '${props.name}' ?`}
                description={`'${props.name}' will not be used in future deployments. Are you sure?`}
                closeDelete={closeDeleteCIModal}
                delete={handleDelete}
            />
        )
    }

    function handleSecretDataDelete(index: number): void {
        let json = secretData
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

    function handleDeleteParam(e, idx: number): void {
        let temp = [...externalValues]
        temp.splice(idx, 1)
        setExternalValues(temp)
    }

    function changeEditorMode(e) {
        if (yamlMode) {
            setExternalValues(tempArray.current)
            toggleYamlMode(not)
            tempArray.current = []
            return
        }
        toggleYamlMode(not)
    }

    const onChange = (e) => {
        setExternalType(e.value)
    }

    const ExternalSecretHelpNote = () => {
        return (
            <div className="fs-13 fw-4 lh-18">
                <NavLink
                    to={`${URLS.CHARTS_DISCOVER}?appStoreName=external-secret`}
                    className="dc__link"
                    target="_blank"
                >
                    External Secrets Operator
                </NavLink>
                &nbsp;should be installed in the target cluster.&nbsp;
                <a className="dc__link" href={DOCUMENTATION.EXTERNAL_SECRET} rel="noreferrer noopener" target="_blank">
                    Learn more
                </a>
            </div>
        )
    }

    return (
        <div className="white-card__config-map">
            <div className="white-card__header">
                {!envId && <div>{props.isUpdate ? `Edit Secret` : `Add Secret`}</div>}
                <div className="uncollapse__delete flex">
                    {props.isUpdate && !secretMode && (
                        <Trash className="icon-n4 cursor icon-delete" onClick={showDeleteCIModal} />
                    )}
                    {typeof props.collapse === 'function' && !envId && (
                        <img
                            onClick={props.collapse}
                            src={arrowTriangle}
                            className="rotate pointer"
                            style={{ ['--rotateBy' as any]: '-180deg' }}
                        />
                    )}
                </div>
            </div>
            <div className="form__row">
                <label className="form__label">Data type</label>
                <div className="form-row__select-external-type flex">
                    <ReactSelect
                        
                        placeholder="Select Secret Type"
                        options={getTypeGroups(props?.isJobView)}
                        defaultValue={
                            externalType && externalType !== ''
                                ? getTypeGroups(props?.isJobView, externalType)
                                : getTypeGroups()[0].options[0]
                        }
                        onChange={onChange}
                        styles={groupStyle()}
                        components={{
                            IndicatorSeparator: null,
                            Option: SecretOptions,
                            GroupHeading,
                        }}
                        classNamePrefix="secret-data-type"
                    />
                </div>
                {isESO && (
                    <InfoColourBar
                        classname="info_bar cn-9 mt-16 lh-20"
                        message={<ExternalSecretHelpNote />}
                        Icon={InfoIcon}
                        iconSize={20}
                    />
                )}
            </div>
            {externalType === 'KubernetesSecret' ? (
                <InfoColourBar
                    classname="info_bar cn-9 mt-16 mb-16 lh-20"
                    message={
                        <div className="flex column left">
                            <div className="dc__info-title">Mount Existing Kubernetes Secret</div>
                            <div className="dc__info-subtitle">
                                Secret will not be created by system. However, they will be used inside the pod. Please
                                make sure that secret with the same name is present in the environment.
                            </div>
                        </div>
                    }
                    Icon={InfoIcon}
                    iconSize={20}
                />
            ) : null}
            <div className="form-row">
                <label className="form__label">Name*</label>
                <input
                    data-testid="secrets-name-textbox"
                    value={configName.value}
                    autoComplete="off"
                    onChange={props.isUpdate ? null : (e) => setName({ value: e.target.value, error: '' })}
                    type="text"
                    className={`form__input`}
                    placeholder={`random-secret`}
                    disabled={props.isUpdate}
                />
                {configName.error && <label className="form__error">{configName.error}</label>}
            </div>
            <label className="forn__label--lower form__label">{`How do you want to use this Secret?`}</label>
            <div className={`form-row form-row__tab ${secretMode ? 'disabled' : ''}`}>
                {tabs.map((data, idx) => (
                    <Tab {...data} key={idx} onClick={secretMode ? (e) => {} : (title) => selectTab(title)} />
                ))}
            </div>
            {selectedTab === 'Data Volume' ? (
                <div className="form__row">
                    <CustomInput
                        dataTestid="secrets-volume-path-textbox"
                        value={volumeMountPath.value}
                        autoComplete="off"
                        tabIndex={5}
                        label={'Volume mount path*'}
                        placeholder={'Enter mount path'}
                        helperText={'keys are mounted as files to volume'}
                        error={volumeMountPath.error}
                        onChange={(e) => setVolumeMountPath({ value: e.target.value, error: '' })}
                    />
                </div>
            ) : null}
            {selectedTab === 'Data Volume' && (
                <div className="mb-16">
                    <Checkbox
                        isChecked={isSubPathChecked}

                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        rootClassName=""
                        disabled={isChartVersion309OrBelow}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={(e) => setIsSubPathChecked(!isSubPathChecked)}
                    >
                        <span data-testid="configmap-sub-path-checkbox" className="mr-5">
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
                            {isSubPathChecked && (
                                <span className="mb-0 cn-5 fs-11">
                                    {externalType === 'KubernetesSecret'
                                        ? 'Please provide keys of secret to be mounted'
                                        : 'Keys will be used as filename for subpath'}
                                </span>
                            )}
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
            {selectedTab === 'Data Volume' && !isExternalValues && isSubPathChecked && (
                <div className="mb-16">
                    <CustomInput
                        value={externalSubpathValues.value}
                        autoComplete="off"
                        tabIndex={5}
                        label={''}
                        placeholder={'Enter keys (Eg. username,configs.json)'}
                        error={externalSubpathValues.error}
                        onChange={(e) => setExternalSubpathValues({ value: e.target.value, error: '' })}
                    />
                </div>
            )}
            {selectedTab === 'Data Volume' && (
                <div className="mb-16">
                    <Checkbox
                        isChecked={isFilePermissionChecked}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        rootClassName=""
                        value={CHECKBOX_VALUE.CHECKED}
                        disabled={isChartVersion309OrBelow}
                        onChange={(e) => setIsFilePermissionChecked(!isFilePermissionChecked)}
                    >
                        <span data-testid="configmap-file-permission-checkbox" className="mr-5">
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
            {selectedTab === 'Data Volume' && isFilePermissionChecked && (
                <div className="mb-16">
                    <CustomInput
                        value={filePermissionValue.value}
                        autoComplete="off"
                        tabIndex={5}
                        label={''}
                        dataTestid = "configmap-file-permission-textbox"
                        disabled={isChartVersion309OrBelow}
                        placeholder={'eg. 0400 or 400'}
                        error={filePermissionValue.error}
                        onChange={(e) => setFilePermissionValue({ value: e.target.value, error: '' })}
                    />
                </div>
            )}
            {isHashiOrAWS || isESO ? (
                <div className="form__row">
                    <CustomInput
                        dataTestid="enter-role-ARN"
                        value={roleARN.value}
                        autoComplete="off"
                        tabIndex={4}
                        label={'Role ARN'}
                        placeholder={'Enter Role ARN'}
                        error={roleARN.error}
                        onChange={(event) => handleRoleARNChange(event)}
                    />
                </div>
            ) : null}
            {isExternalValues && (
                <div className="flex left mb-16">
                    <b className="mr-5 dc__bold">Data*</b>
                    {!isESO && (
                        <RadioGroup
                            className="gui-yaml-switch"
                            name="yaml-mode"
                            initialTab={yamlMode ? VIEW_MODE.YAML : VIEW_MODE.GUI}
                            disabled={false}
                            onChange={changeEditorMode}
                        >
                            <RadioGroup.Radio dataTestId="secrets-data-gui-togglebutton" value={VIEW_MODE.GUI}>{VIEW_MODE.GUI.toUpperCase()}</RadioGroup.Radio>
                            <RadioGroup.Radio dataTestId="secrets-data-yaml-togglebutton" value={VIEW_MODE.YAML}>{VIEW_MODE.YAML.toUpperCase()}</RadioGroup.Radio>
                        </RadioGroup>
                    )}
                </div>
            )}
            {externalType === '' && (
                <>
                    {yamlMode ? (
                        <div className="yaml-container">
                            <CodeEditor
                                value={secretMode ? lockedYaml : yaml}
                                mode={MODES.YAML}
                                inline
                                height={350}
                                onChange={handleYamlChange}
                                readOnly={secretMode}
                                shebang={
                                    externalType === '' && selectedTab == 'Data Volume'
                                        ? '#Check sample for multi-line data.'
                                        : '#key:value'
                                }
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
                        externalValues.map((data, idx) => (
                            <KeyValueInput
                                keyLabel={externalType === '' && selectedTab == 'Data Volume' ? 'File Name' : 'Key'}
                                valueLabel={
                                    externalType === '' && selectedTab == 'Data Volume' ? 'File Content' : 'Value'
                                }
                                k={data.k}
                                v={secretMode ? Array(8).fill('*').join('') : data.v}
                                keyError={data.keyError}
                                valueError={data.valueError}
                                key={idx}
                                index={idx}
                                onChange={secretMode ? null : handleChange}
                                onDelete={secretMode ? null : handleDeleteParam}
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
                        mode="yaml"
                        inline
                        height={350}
                        onChange={handleSecretYamlChange}
                        readOnly={secretMode && codeEditorRadio === CODE_EDITOR_RADIO_STATE.SAMPLE}
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
                        secretData.map((data, index) => (
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
            )}
            {!secretMode && isExternalValues && !yamlMode && (
                <div
                    className="add-parameter dc__bold pointer flex left anchor"
                    onClick={(event) => {
                        if (isHashiOrAWS) {
                            setSecretData((secretData) => [
                                ...secretData,
                                { fileName: '', property: '', isBinary: true, name: '' },
                            ])
                        } else
                            setExternalValues((externalValues) => [
                                ...externalValues,
                                { k: '', v: '', keyError: '', valueError: '' },
                            ])
                    }}
                >
                    <img data-testid="gui-add-parameters-env-link" src={addIcon} alt="add" />
                    Add parameter
                </div>
            )}
            <div className="form__buttons">
                <button data-testid="secrets-save-button" type="button" className="cta" onClick={handleSubmit}>
                    {loading ? <Progressing /> : `${props.name ? 'Update' : 'Save'} Secret`}
                </button>
            </div>
            {showDeleteModal && renderDeleteCIModal()}
        </div>
    )
}

export default Secret
