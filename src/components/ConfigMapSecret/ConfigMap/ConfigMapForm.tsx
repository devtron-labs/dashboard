import React, { useState, useEffect, useRef } from 'react'
import {
    Select,
    RadioGroup,
    Info,
    CustomInput,
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
} from '../../common'
import {
    showError,
    Progressing,
    DeleteDialog,
    Checkbox,
    CHECKBOX_VALUE,
    not,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router'
import { updateConfig, deleteConfig } from './service'
import { overRideConfigMap, deleteConfigMap as deleteEnvironmentConfig } from '../../EnvironmentOverride/service'
import { toast } from 'react-toastify'
import CodeEditor from '../../CodeEditor/CodeEditor'
import YAML from 'yaml'
import { DOCUMENTATION, PATTERNS, ROLLOUT_DEPLOYMENT } from '../../../config'
import arrowTriangle from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Trash } from '../../../assets/icons/ic-delete.svg'
import './ConfigMap.scss'
import { INVALID_YAML_MSG } from '../../../config/constantMessaging'
import { KeyValueInput, Tab, useKeyValueYaml, validateKeyValuePair } from '../ConfigMapSecret.components'
import { EXTERNAL_TYPES } from '../Constants'

export default function ConfigMapForm({
    appChartRef,
    id,
    appId,
    name = '',
    external,
    data = null,
    type = 'environment',
    mountPath = '',
    isUpdate = true,
    collapse = null,
    index: listIndex,
    update: updateForm,
    subPath,
    filePermission,
}) {
    const [selectedTab, selectTab] = useState(type === 'environment' ? 'Environment Variable' : 'Data Volume')
    const [isExternalValues, toggleExternalValues] = useState(external)
    const [externalValues, setExternalValues] = useState([])
    const [configName, setName] = useState({ value: name, error: '' })
    const [volumeMountPath, setVolumeMountPath] = useState({ value: mountPath, error: '' })
    const [loading, setLoading] = useState(false)
    const { envId } = useParams<{ envId }>()
    const [yamlMode, toggleYamlMode] = useState(true)
    const { yaml, handleYamlChange, error } = useKeyValueYaml(
        externalValues,
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )
    const tempArray = useRef([])
    const [isSubPathChecked, setIsSubPathChecked] = useState(!!subPath)
    const [isFilePermissionChecked, setIsFilePermissionChecked] = useState(!!filePermission)
    const [filePermissionValue, setFilePermissionValue] = useState({ value: filePermission, error: '' })
    const isChartVersion309OrBelow =
        appChartRef &&
        appChartRef.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
        isChartRef3090OrBelow(appChartRef.id)
    const [externalSubpathValues, setExternalSubpathValues] = useState({
        value: data ? Object.keys(data).join(',') : '',
        error: '',
    })
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    function setKeyValueArray(arr) {
        tempArray.current = arr
    }

    useEffect(() => {
        if (data) {
            setExternalValues(
                Object.keys(data).map((k) => ({
                    k,
                    v: typeof data[k] === 'object' ? YAML.stringify(data[k], { indent: 2 }) : data[k],
                    keyError: '',
                    valueError: '',
                })),
            )
        } else {
            setExternalValues([{ k: '', v: '', keyError: '', valueError: '' }])
        }
    }, [data])

    function handleChange(index, k, v) {
        setExternalValues((state) => {
            state[index] = { k, v, keyError: '', valueError: '' }
            return [...state]
        })
    }

    async function handleDelete() {
        try {
            if (!envId) {
                await deleteConfig(id, appId, name)
                toast.success('Successfully deleted')
                updateForm(listIndex, null)
            } else {
                await deleteEnvironmentConfig(id, appId, envId, name)
                toast.success('Successfully deleted')
                updateForm(true)
            }
        } catch (err) {
            showError(err)
        }
    }

    function handleFilePermission(e): void {
        let permissionValue = e.target.value
        setFilePermissionValue({ value: permissionValue, error: '' })
    }

    async function handleSubmit(e) {
        const configmapNameRegex = new RegExp(PATTERNS.CONFIGMAP_AND_SECRET_NAME)
        if (!configName.value) {
            setName({ value: '', error: 'This is a required field' })
            return
        }
        if (configName.value.length > 253) {
            setName({ value: configName.value, error: 'More than 253 characters are not allowed' })
            return
        }
        if (!configmapNameRegex.test(configName.value)) {
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
            if (!new RegExp(PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7).test(filePermissionValue.value)) {
                setFilePermissionValue({
                    value: filePermissionValue.value,
                    error: 'This is octal number, use numbers between 0 to 7',
                })
                return
            }
        }
        if (selectedTab === 'Data Volume' && isSubPathChecked && isExternalValues) {
            if (!externalSubpathValues.value) {
                setExternalSubpathValues({ value: externalSubpathValues.value, error: 'This is a required field' })
                return
            }
            if (!new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_MULTPLS_KEYS).test(externalSubpathValues.value)) {
                setExternalSubpathValues({
                    value: externalSubpathValues.value,
                    error: `Use (a-z), (0-9), (-), (_),(.); Use (,) to separate multiple keys `,
                })
                return
            }
        }

        let dataArray = yamlMode ? tempArray.current : externalValues
        const { isValid, arr } = validateKeyValuePair(dataArray)
        if (!isValid) {
            toast.error(INVALID_YAML_MSG)
            setExternalValues(arr)
            return
        }
        if (arr.length === 0 && !isExternalValues) {
            toast.error('Configmaps without any key value pairs are not allowed')
            return
        }
        try {
            let data = arr.reduce((agg, curr) => {
                if (!curr.k) return agg
                agg[curr.k] = curr.v ?? ''
                return agg
            }, {})
            setLoading(true)
            let payload = {
                name: configName.value,
                data,
                type: selectedTab === 'Environment Variable' ? 'environment' : 'volume',
                external: isExternalValues,
            }
            if (selectedTab === 'Data Volume') {
                payload['mountPath'] = volumeMountPath.value
                if (!isChartVersion309OrBelow) {
                    payload['subPath'] = isSubPathChecked
                }
                if (isFilePermissionChecked && !isChartVersion309OrBelow) {
                    payload['filePermission'] =
                        filePermissionValue.value.length === 3
                            ? `0${filePermissionValue.value}`
                            : `${filePermissionValue.value}`
                }
                if (isSubPathChecked && isExternalValues) {
                    const externalSubpathKey = externalSubpathValues.value.replace(/\s+/g, '').split(',')
                    const secretKeys = {}
                    externalSubpathKey.forEach((key) => (secretKeys[key] = ''))
                    payload['data'] = secretKeys
                }
            }
            if (!envId) {
                const { result } = await updateConfig(id, +appId, payload)
                toast.success(
                    <div className="toast">
                        <div className="toast__title">{name ? 'Updated' : 'Saved'}</div>
                        <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                    </div>,
                    { autoClose: null },
                )
                if (typeof updateForm === 'function') {
                    collapse()
                    updateForm(listIndex, result)
                }
            } else {
                await overRideConfigMap(id, +appId, +envId, [payload])
                toast.success(
                    <div className="toast">
                        <div className="toast__title">Overridden</div>
                        <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
                    </div>,
                    { autoClose: null },
                )
                collapse()
                updateForm(true)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    function handleDeleteParam(e, idx) {
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

    const closeDeleteCMModal = (): void => {
        setShowDeleteModal(false)
    }

    const showDeleteCMModal = (): void => {
        setShowDeleteModal(true)
    }

    const renderDeleteCMModal = () => {
        return (
            <DeleteDialog
                title={`Delete ConfigMap '${name}' ?`}
                description={`'${name}' will not be used in future deployments. Are you sure?`}
                closeDelete={closeDeleteCMModal}
                delete={handleDelete}
            />
        )
    }

    const tabs = [
        { title: 'Environment Variable', value: 'Environment Variable' },
        { title: 'Data Volume', value: 'Data Volume' },
    ].map((data) => ({
        ...data,
        active: data.title === selectedTab,
    }))

    return (
        <div className="white-card__config-map mt-16">
            {/* <div className="white-card__header">
                {!envId && <div>{isUpdate ? `Edit ConfigMap` : `Add ConfigMap`}</div>}
                <div className="uncollapse__delete flex">
                    {isUpdate && <Trash className="cursor icon-delete icon-n4" onClick={showDeleteCMModal} />}
                    {typeof collapse === 'function' && !envId && (
                        <img
                            onClick={collapse}
                            src={arrowTriangle}
                            className="rotate pointer"
                            style={{ ['--rotateBy' as any]: '-180deg' }}
                        />
                    )}
                </div>
            </div> */}
            <div className="form__row">
                <label className="form__label">Data type</label>
                <div className="form-row__select-external-type flex">
                    <Select
                        value={isExternalValues ? 'KubernetesConfigMap' : ''}
                        dataTestId="configmaps-data-type-select-dropdown"
                        onChange={(e) => {
                            toggleExternalValues(e.target.value !== '')
                        }}
                    >
                        <Select.Button
                            dataTestIdDropdown="select-configmap-datatype-dropdown"
                            dataTestId="data-type-select-control"
                        >
                            {isExternalValues ? 'Kubernetes External ConfigMap' : 'Kubernetes ConfigMap'}
                        </Select.Button>
                        {Object.entries(EXTERNAL_TYPES).map(([value, name]) => (
                            <Select.Option
                                dataTestIdMenuList={`select-configmap-datatype-dropdown-${name}`}
                                key={value}
                                value={value}
                            >
                                {name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
            {isExternalValues && (
                <div className="dc__info-container mb-24">
                    <Info />
                    <div className="flex column left">
                        <div className="dc__info-title">Using External Configmaps</div>
                        <div className="dc__info-subtitle">
                            Configmap will not be created by system. However, they will be used inside the pod. Please
                            make sure that configmap with the same name is present in the environment.
                        </div>
                    </div>
                </div>
            )}
            <div className="form__row">
                <label className="form__label">Name*</label>
                <input
                    data-testid="configmap-name-textbox"
                    value={configName.value}
                    autoComplete="off"
                    autoFocus
                    onChange={(e) => setName({ value: e.target.value, error: '' })}
                    type="text"
                    className={`form__input`}
                    placeholder={`random-configmap`}
                    disabled={isUpdate}
                />
                {configName.error && <label className="form__error">{configName.error}</label>}
            </div>
            <label className="form__label form__label--lower">{`How do you want to use this ConfigMap?`}</label>
            <div className={`form__row form-row__tab`}>
                {tabs.map((data, idx) => (
                    <Tab {...data} key={idx} onClick={(title) => selectTab(title)} type="configmap" />
                ))}
            </div>

            {selectedTab === 'Data Volume' && (
                <div className="form__row">
                    <CustomInput
                        dataTestid="configmap-volume-path-textbox"
                        value={volumeMountPath.value}
                        autoComplete="off"
                        tabIndex={5}
                        label={'Volume mount path*'}
                        placeholder={'/directory-path'}
                        helperText={'Keys are mounted as files to volume'}
                        error={volumeMountPath.error}
                        onChange={(e) => setVolumeMountPath({ value: e.target.value, error: '' })}
                    />
                </div>
            )}
            {selectedTab === 'Data Volume' && (
                <div className="mb-16">
                    <Checkbox
                        isChecked={isSubPathChecked}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        rootClassName="top"
                        disabled={isChartVersion309OrBelow}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={(e) => setIsSubPathChecked(!isSubPathChecked)}
                    >
                        <span data-testid="configmap-sub-path-checkbox" className="mb-0">
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
                                    {isExternalValues
                                        ? 'Please provide keys of config map to be mounted'
                                        : 'Keys will be used as filename for subpath'}
                                </span>
                            )}
                            {isChartVersion309OrBelow && (
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
                            )}
                        </span>
                    </Checkbox>
                    {isExternalValues && isSubPathChecked && (
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
                        disabled={isChartVersion309OrBelow}
                        value={CHECKBOX_VALUE.CHECKED}
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
            {selectedTab === 'Data Volume' && isFilePermissionChecked ? (
                <div className="mb-16">
                    <CustomInput
                        value={filePermissionValue.value}
                        autoComplete="off"
                        tabIndex={5}
                        label={''}
                        dataTestid="configmap-file-permission-textbox"
                        disabled={isChartVersion309OrBelow}
                        placeholder={'eg. 0400 or 400'}
                        error={filePermissionValue.error}
                        onChange={handleFilePermission}
                    />
                </div>
            ) : (
                ''
            )}
            {!isExternalValues && (
                <div className="flex left mb-16">
                    <b className="mr-5 dc__bold">Data*</b>
                    <RadioGroup
                        className="gui-yaml-switch"
                        name="yaml-mode"
                        initialTab={yamlMode ? 'yaml' : 'gui'}
                        disabled={false}
                        onChange={changeEditorMode}
                    >
                        <RadioGroup.Radio value="gui" dataTestId="GUI">
                            GUI
                        </RadioGroup.Radio>
                        <RadioGroup.Radio value="yaml" dataTestId="YAML">
                            YAML
                        </RadioGroup.Radio>
                    </RadioGroup>
                </div>
            )}
            {!isExternalValues && yamlMode && (
                <div className="dc__info-container info__container--configmap mb-16">
                    <Info />
                    <div className="flex column left">
                        <div className="dc__info-subtitle">GUI Recommended for multi-line data.</div>
                    </div>
                </div>
            )}

            {!isExternalValues && (
                <>
                    {yamlMode ? (
                        <div className="yaml-container">
                            <CodeEditor
                                value={yaml}
                                mode="yaml"
                                inline
                                height={350}
                                onChange={handleYamlChange}
                                shebang={
                                    !isExternalValues && selectedTab == 'Data Volume'
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
                        <>
                            {externalValues.map((data, idx) => (
                                <KeyValueInput
                                    keyLabel={selectedTab == 'Data Volume' ? 'File Name' : 'Key'}
                                    valueLabel={selectedTab == 'Data Volume' ? 'File Content' : 'Value'}
                                    {...data}
                                    key={idx}
                                    index={idx}
                                    onChange={handleChange}
                                    onDelete={handleDeleteParam}
                                />
                            ))}
                            <div
                                data-testid="configmap-gui-add-parameter-link"
                                className="add-parameter dc__bold pointer flex left"
                                onClick={(e) =>
                                    setExternalValues((externalValues) => [
                                        ...externalValues,
                                        { k: '', v: '', keyError: '', valueError: '' },
                                    ])
                                }
                            >
                                <Add />
                                Add parameter
                            </div>
                        </>
                    )}
                </>
            )}
            <div className="form__buttons">
                <button
                    data-testid={`configmap-save-button-${name}`}
                    type="button"
                    className="cta"
                    onClick={handleSubmit}
                >
                    {loading ? <Progressing /> : `${name ? 'Update' : 'Save'} ConfigMap`}
                </button>
            </div>
            {showDeleteModal && renderDeleteCMModal()}
        </div>
    )
}
