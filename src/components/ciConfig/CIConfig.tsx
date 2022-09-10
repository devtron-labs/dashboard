import React, { useState, useEffect } from 'react'
import {
    Progressing,
    useForm,
    showError,
    multiSelectStyles,
    sortObjectArrayAlphabetically,
    ConfirmationDialog,
} from '../common'
import { DOCUMENTATION, PATTERNS, REGISTRY_TYPE_MAP, URLS } from '../../config'
import { saveCIConfig, updateCIConfig, getDockerRegistryMinAuth } from './service'
import { getSourceConfig, getCIConfig } from '../../services/service'
import { useParams } from 'react-router'
import { KeyValueInput } from '../configMaps/ConfigMap'
import { toast } from 'react-toastify'
import { NavLink } from 'react-router-dom'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import warningIconSrc from '../../assets/icons/ic-warning-y6.svg'
import './CIConfig.scss'
import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { OptionType } from '../app/types'

export default function CIConfig({ respondOnSuccess, ...rest }) {
    const [dockerRegistries, setDockerRegistries] = useState(null)
    const [sourceConfig, setSourceConfig] = useState(null)
    const [ciConfig, setCIConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const { appId } = useParams<{ appId: string }>()
    useEffect(() => {
        initialise()
    }, [])

    async function initialise() {
        try {
            setLoading(true)
            const [{ result: dockerRegistries }, { result: sourceConfig }, { result: ciConfig }] = await Promise.all([
                getDockerRegistryMinAuth(appId),
                getSourceConfig(appId),
                getCIConfig(+appId),
            ])
            Array.isArray(dockerRegistries) && sortObjectArrayAlphabetically(dockerRegistries, 'id')
            setDockerRegistries(dockerRegistries || [])
            sourceConfig &&
                Array.isArray(sourceConfig.material) &&
                sortObjectArrayAlphabetically(sourceConfig.material, 'name')
            setSourceConfig(sourceConfig)
            setCIConfig(ciConfig)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    async function reload() {
        try {
            setLoading(true)
            const { result } = await getCIConfig(+appId)
            setCIConfig(result)
            respondOnSuccess()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Progressing pageLoader />
    if (!sourceConfig || !Array.isArray(sourceConfig.material || !Array.isArray(dockerRegistries))) return null
    return (
        <Form
            dockerRegistries={dockerRegistries}
            sourceConfig={sourceConfig}
            ciConfig={ciConfig}
            reload={reload}
            appId={appId}
        />
    )
}

function Form({ dockerRegistries, sourceConfig, ciConfig, reload, appId }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const _selectedMaterial =
        ciConfig && ciConfig.dockerBuildConfig && ciConfig.dockerBuildConfig.gitMaterialId
            ? sourceConfig.material.find((material) => material.id === ciConfig.dockerBuildConfig.gitMaterialId)
            : sourceConfig.material[0]
    const [selectedMaterial, setSelectedMaterial] = useState(_selectedMaterial)
    const _selectedRegistry =
        ciConfig && ciConfig.dockerRegistry
            ? dockerRegistries.find((reg) => reg.id === ciConfig.dockerRegistry)
            : dockerRegistries.find((reg) => reg.isDefault)
    const [selectedRegistry, setSelectedRegistry] = useState(_selectedRegistry)

    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            repository: { value: _selectedMaterial.name, error: '' },
            dockerfile: {
                value: ciConfig ? ciConfig.dockerBuildConfig.dockerfileRelativePath : 'Dockerfile',
                error: '',
            },
            registry: { value: _selectedRegistry?.id, error: '' },
            repository_name: { value: ciConfig ? ciConfig.dockerRepository : '', error: '' },
        },
        {
            repository: {
                required: true,
                validator: {
                    error: 'Repository is required',
                    regex: /^.*$/,
                },
            },
            dockerfile: {
                required: true,
                validator: {
                    error: 'Dockerfile is required',
                    regex: PATTERNS.STRING,
                },
            },
            registry: {
                required: true,
                validatior: {
                    error: 'registry is required',
                    regex: PATTERNS.STRING,
                },
            },
            repository_name: {
                required: false,
            },
        },
        onValidation,
    )
    const [args, setArgs] = useState([])
    const [loading, setLoading] = useState(false)
    const targetPlatformList: OptionType[] = [
        { label: 'linux/arm64', value: 'linux/arm64' },
        { label: 'linux/amd64', value: 'linux/amd64' },
        { label: 'linux/arm/v7', value: 'linux/arm/v7' },
    ]
    const targetPlatformMap = new Map<string, boolean>()
    targetPlatformList.forEach((targetPlatform) => {
        targetPlatformMap.set(targetPlatform.value, true)
    })
    let _selectedPlatforms = []
    let _customTargetPlatorm = false
    if (ciConfig?.dockerBuildConfig?.targetPlatform) {
        _selectedPlatforms = ciConfig.dockerBuildConfig.targetPlatform.split(',').map((platformValue) => {
            _customTargetPlatorm = _customTargetPlatorm || !targetPlatformMap.get(platformValue)
            return { label: platformValue, value: platformValue }
        })
    }
    const [selectedTargetPlatforms, setSelectedTargetPlatforms] = useState<OptionType[]>(_selectedPlatforms)
    const [showCustomPlatformWarning, setShowCustomPlatformWarning] = useState<boolean>(_customTargetPlatorm)
    const [showCustomPlatformConfirmation, setShowCustomPlatformConfirmation] = useState<boolean>(false)
    useEffect(() => {
        let args = []
        if (ciConfig && ciConfig.dockerBuildConfig.args) {
            args = Object.keys(ciConfig.dockerBuildConfig.args).map((arg) => ({
                k: arg,
                v: ciConfig.dockerBuildConfig.args[arg],
                keyError: '',
                valueError: '',
            }))
        }
        if (args.length === 0) {
            args.push({ k: '', v: '', keyError: '', valueError: '' })
        }
        setArgs(args)
    }, [])

    async function onValidation(state) {
        let args2 = args.map(({ k, v, keyError, valueError }, idx) => {
            if (v && !k) {
                keyError = 'This field is required'
            } else if (k && !v) {
                valueError = 'This field is required'
            }
            let arg = { k, v, keyError, valueError }
            return arg
        })
        const areArgsWrong = args2.some((arg) => arg.keyError || arg.valueError)
        if (areArgsWrong) {
            setArgs([...args2])
            return
        }
        let targetPlatforms = ''
        const targetPlatformsSet = new Set()
        for (let index = 0; index < selectedTargetPlatforms.length; index++) {
            const element = selectedTargetPlatforms[index]
            if (!targetPlatformsSet.has(element.value)) {
                targetPlatformsSet.add(element.value)
                targetPlatforms += element.value + (index + 1 === selectedTargetPlatforms.length ? '' : ',')
            }
        }
        if (showCustomPlatformWarning) {
            setShowCustomPlatformConfirmation(!showCustomPlatformConfirmation)
            if (!showCustomPlatformConfirmation) {
                return
            }
        }
        let requestBody = {
            id: ciConfig ? ciConfig.id : null,
            appId: +appId || null,
            dockerRegistry: registry.value || '',
            dockerRepository: repository_name.value || '',
            beforeDockerBuild: [],
            dockerBuildConfig: {
                dockerfilePath: `${selectedMaterial.checkoutPath}/${dockerfile.value}`.replace('//', '/'),
                args: args.reduce((agg, { k, v }) => {
                    if (k && v) agg[k] = v
                    return agg
                }, {}),
                dockerfileRepository: repository.value,
                dockerfileRelativePath: dockerfile.value.replace(/^\//, ''),
                gitMaterialId: selectedMaterial.id,
                targetPlatform: targetPlatforms,
            },
            afterDockerBuild: [],
            appName: '',
            ...(ciConfig && ciConfig.version ? { version: ciConfig.version } : {}),
        }
        setLoading(true)
        try {
            const saveOrUpdate = ciConfig && ciConfig.id ? updateCIConfig : saveCIConfig
            const { result } = await saveOrUpdate(requestBody)
            toast.success('Successfully saved.')
            reload()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const handleArgsChange = (index, k, v): void => {
        setArgs((arr) => {
            arr[index] = { k: k, v: v, keyError: '', valueError: '' }
            return Array.from(arr)
        })
    }

    const toggleCollapse = (): void => {
        setIsCollapsed(!isCollapsed)
    }

    const handleFileLocationChange = (selectedMaterial): void => {
        setSelectedMaterial(selectedMaterial)
        repository.value = selectedMaterial.name
    }

    const handleRegistryChange = (selectedRegistry): void => {
        setSelectedRegistry(selectedRegistry)
        registry.value = selectedRegistry.id
    }

    const _multiSelectStyles = {
        ...multiSelectStyles,
        menu: (base, state) => ({
            ...base,
            marginTop: 'auto',
        }),
        menuList: (base) => {
            return {
                ...base,
                position: 'relative',
                paddingBottom: '0px',
                maxHeight: '250px',
            }
        },
    }

    const containerRegistryOption = (props): JSX.Element => {
        props.selectProps.styles.option = getCustomOptionSelectionStyle()
        return (
            <components.Option {...props}>
                <div style={{ display: 'flex' }}>
                    <div className={'registry-icon mr-5 ' + props.data.registryType}></div>
                    {props.label}
                </div>
            </components.Option>
        )
    }

    const containerRegistryMenuList = (props): JSX.Element => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <NavLink
                    to={`${URLS.GLOBAL_CONFIG_DOCKER}`}
                    className="cb-5 select__sticky-bottom block fw-5 anchor w-100 cursor no-decor bottom-0"
                    style={{ backgroundColor: '#FFF' }}
                >
                    <Add className="icon-dim-20 mr-5 fcb-5 mr-12 vertical-align-bottom" />
                    Add Container Registry
                </NavLink>
            </components.MenuList>
        )
    }

    const containerRegistryControls = (props): JSX.Element => {
        let value = ''
        if (props.hasValue) {
            value = props.getValue()[0].registryType
        }
        return (
            <components.Control {...props}>
                <div className={'registry-icon ml-5 ' + value}></div>
                {props.children}
            </components.Control>
        )
    }

    const repositoryOption = (props): JSX.Element => {
        props.selectProps.styles.option = getCustomOptionSelectionStyle()
        return (
            <components.Option {...props}>
                {props.data.url.includes('gitlab') && <GitLab className="mr-8 vertical-align-middle icon-dim-20" />}
                {props.data.url.includes('github') && <GitHub className="mr-8 vertical-align-middle icon-dim-20" />}
                {props.data.url.includes('bitbucket') && (
                    <BitBucket className="mr-8 vertical-align-middle icon-dim-20" />
                )}
                {props.data.url.includes('gitlab') ||
                props.data.url.includes('github') ||
                props.data.url.includes('bitbucket') ? null : (
                    <Git className="mr-8 vertical-align-middle icon-dim-20" />
                )}

                {props.label}
            </components.Option>
        )
    }

    const repositoryControls = (props): JSX.Element => {
        let value = ''
        if (props.hasValue) {
            value = props.getValue()[0].url
        }
        let showGit = value && !value.includes('github') && !value.includes('gitlab') && !value.includes('bitbucket')
        return (
            <components.Control {...props}>
                {value.includes('github') && <GitHub className="icon-dim-20 ml-8" />}
                {value.includes('gitlab') && <GitLab className="icon-dim-20 ml-8" />}
                {value.includes('bitbucket') && <BitBucket className="icon-dim-20 ml-8" />}
                {showGit && <Git className="icon-dim-20 ml-8" />}
                {props.children}
            </components.Control>
        )
    }

    const platformMenuList = (props): JSX.Element => {
        return (
            <components.MenuList {...props}>
                <div className="cn-5 pl-12 pt-4 pb-4" style={{ fontStyle: 'italic' }}>
                    Type to enter a target platform. Press Enter to accept.
                </div>
                {props.children}
            </components.MenuList>
        )
    }

    const noMatchingPlatformOptions = (): string => {
        return 'No matching options'
    }

    const platformOption = (props): JSX.Element => {
        const { selectOption, data } = props
        return (
            <div
                onClick={(e) => selectOption(data)}
                className="flex left pl-12"
                style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
            >
                {!data.__isNew__ && (
                    <input
                        checked={props.isSelected}
                        type="checkbox"
                        style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
                    />
                )}
                <div className="flex left column w-100">
                    <components.Option className="w-100 option-label-padding" {...props} />
                </div>
            </div>
        )
    }
    const handlePlatformChange = (selectedValue): void => {
        setSelectedTargetPlatforms(selectedValue)
    }

    const tempMultiSelectStyles = {
        ...multiSelectStyles,
        multiValue: (base, state) => {
            return {
                ...base,
                border: `1px solid var(--N200)`,
                borderRadius: `4px`,
                background: 'white',
                height: '28px',
                marginRight: '8px',
                padding: '2px',
                fontSize: '12px',
            }
        },
        dropdownIndicator: (base, state) => ({
            ...base,
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
    }

    const handleCreatableBlur = (event): void => {
        if (event.target.value) {
            setSelectedTargetPlatforms([
                ...selectedTargetPlatforms,
                {
                    label: event.target.value,
                    value: event.target.value,
                },
            ])
            if (!showCustomPlatformWarning) {
                setShowCustomPlatformWarning(!targetPlatformMap.get(event.target.value))
            }
        } else {
            setShowCustomPlatformWarning(
                selectedTargetPlatforms.some((targetPlatform) => !targetPlatformMap.get(targetPlatform.value)),
            )
        }
    }

    const handleKeyDown = (event): void => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    const renderConfirmationModal = (): JSX.Element | null => {
        if (!showCustomPlatformConfirmation) return null
        return (
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warningIconSrc} />
                <ConfirmationDialog.Body title="Please ensure you have set valid target platform for the build" />
                <span className="fs-14 cn-7 block">Custom target platform(s):</span>
                {selectedTargetPlatforms.map((targetPlatform) =>
                    targetPlatformMap.get(targetPlatform.value) ? null : (
                        <span className="fs-13 cn-7 block">{targetPlatform.value}</span>
                    ),
                )}
                <p className="fs-13 cn-7 lh-1-54 mt-20">
                    The build will fail if the target platform is invalid or unsupported.
                </p>
                <ConfirmationDialog.ButtonGroup>
                    <button
                        type="button"
                        className="cta cancel"
                        onClick={(e) => {
                            setShowCustomPlatformConfirmation(false)
                        }}
                    >
                        Go back
                    </button>
                    <button onClick={onValidation} className="cta ml-12 no-decor">
                        Confirm save
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    const { repository, dockerfile, registry, repository_name, key, value } = state
    return (
        <>
            <div className="form__app-compose">
                <h1 className="form__title">Docker build configuration</h1>
                <p className="form__subtitle">
                    Required to execute CI pipelines for this application.
                    <span>
                        <a
                            rel="noreferrer noopener"
                            target="_blank"
                            className="learn-more__href"
                            href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}
                        >
                            {' '}
                            Learn more
                        </a>{' '}
                    </span>
                </p>
                <div className="white-card white-card__docker-config">
                    <div className="fs-14 fw-6 pb-16">
                        Selected repository will be used to store container images for this application
                    </div>
                    <div className="mb-4 form-row__docker">
                        <div className="form__field">
                            <label htmlFor="" className="form__label">
                                Container registry*
                            </label>
                            <ReactSelect
                                className="m-0"
                                tabIndex={1}
                                isMulti={false}
                                isClearable={false}
                                options={dockerRegistries}
                                getOptionLabel={(option) => `${option.id}`}
                                getOptionValue={(option) => `${option.id}`}
                                value={selectedRegistry}
                                styles={_multiSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                    Option: containerRegistryOption,
                                    MenuList: containerRegistryMenuList,
                                    Control: containerRegistryControls,
                                }}
                                onChange={(selected) => {
                                    handleRegistryChange(selected)
                                }}
                            />
                            {registry.error && <label className="form__error">{registry.error}</label>}
                        </div>
                        <div className="form__field">
                            <label htmlFor="" className="form__label">
                                Container Repository{' '}
                                {selectedRegistry && REGISTRY_TYPE_MAP[selectedRegistry.registryType]?.desiredFormat}
                            </label>
                            <input
                                tabIndex={2}
                                type="text"
                                className="form__input"
                                placeholder={
                                    (selectedRegistry &&
                                        REGISTRY_TYPE_MAP[selectedRegistry.registryType]?.placeholderText) ||
                                    'Enter repository name'
                                }
                                name="repository_name"
                                value={repository_name.value}
                                onChange={handleOnChange}
                                autoFocus
                                autoComplete={'off'}
                            />
                            {repository_name.error && <label className="form__error">{repository_name.error}</label>}
                            {!ciConfig && selectedRegistry?.registryType === 'ecr' && (
                                <label className="form__error form__error--info">
                                    New repository will be created if not provided
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="fs-14 fw-6 pb-16">Docker file location</div>
                    <div className="mb-4 form-row__docker">
                        <div className="form__field">
                            <label className="form__label">Select repository containing docker file</label>
                            <ReactSelect
                                className="m-0"
                                tabIndex={3}
                                isMulti={false}
                                isClearable={false}
                                options={sourceConfig.material}
                                getOptionLabel={(option) => `${option.name}`}
                                getOptionValue={(option) => `${option.checkoutPath}`}
                                value={selectedMaterial}
                                styles={_multiSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                    Option: repositoryOption,
                                    Control: repositoryControls,
                                }}
                                onChange={(selected) => {
                                    handleFileLocationChange(selected)
                                }}
                            />
                            {repository.error && <label className="form__error">{repository.error}</label>}
                        </div>
                        <div className="form__field">
                            <label htmlFor="" className="form__label">
                                Docker file path (relative)*
                            </label>
                            <div className="docker-flie-container">
                                <Tippy
                                className="default-tt"
                                arrow={false}
                                placement="top"
                                content={selectedMaterial.checkoutPath}
                            >
                                <span className="checkout-path-container">{selectedMaterial.checkoutPath}</span>
                            </Tippy>

                                <input
                                    tabIndex={4}
                                    type="text"
                                    className="form__input file-name"
                                    placeholder="Dockerfile"
                                    name="dockerfile"
                                    value={dockerfile.value}
                                    onChange={handleOnChange}
                                    autoComplete={'off'}
                                />
                            </div>
                            {dockerfile.error && <label className="form__error">{dockerfile.error}</label>}
                        </div>
                    </div>
                    <hr className="mt-0 mb-20" />
                    <div onClick={toggleCollapse} className="flex content-space cursor mb-20">
                        <div>
                            <div className="fs-14 fw-6 ">Advanced (optional)</div>
                            <div className="form-row__add-parameters">
                                <span className="fs-13 fw-4 cn-7">
                                    Set target platform for build, Docker build arguments
                                </span>
                            </div>
                        </div>
                        <span>
                            <Dropdown
                                className="icon-dim-32 rotate "
                                style={{ ['--rotateBy' as any]: isCollapsed ? '180deg' : '0deg' }}
                            />
                        </span>
                    </div>
                    {isCollapsed && (
                        <>
                            <div className="mb-20">
                                <div className="fs-13 fw-6">Set target platform for the build</div>
                                <div className="fs-13 fw-4 cn-7 mb-12">
                                    If target platform is not set, Devtron will build image for architecture and
                                    operating system of the k8s node on which CI is running
                                </div>
                                <CreatableSelect
                                    value={selectedTargetPlatforms}
                                    isMulti={true}
                                    components={{
                                        ClearIndicator: null,
                                        IndicatorSeparator: null,
                                        Option: platformOption,
                                        MenuList: platformMenuList,
                                    }}
                                    styles={tempMultiSelectStyles}
                                    closeMenuOnSelect={false}
                                    name="targetPlatform"
                                    placeholder="Type to select or create"
                                    options={targetPlatformList}
                                    className="basic-multi-select mb-4"
                                    classNamePrefix="target-platform__select"
                                    onChange={handlePlatformChange}
                                    hideSelectedOptions={false}
                                    noOptionsMessage={noMatchingPlatformOptions}
                                    onBlur={handleCreatableBlur}
                                    isValidNewOption={() => false}
                                    onKeyDown={handleKeyDown}
                                    captureMenuScroll={false}
                                />
                                {showCustomPlatformWarning && (
                                    <span className="flexbox cy-7">
                                        <WarningIcon className="warning-icon-y7 icon-dim-16 mr-5 mt-2" />
                                        You have entered a custom target platform, please ensure it is valid.
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="fs-13 fw-6 mb-8">Docker build arguments</div>
                                {args &&
                                    args.map((arg, idx) => (
                                        <KeyValueInput
                                            keyLabel={'Key'}
                                            valueLabel={'Value'}
                                            {...arg}
                                            key={idx}
                                            index={idx}
                                            onChange={handleArgsChange}
                                            onDelete={(e) => {
                                                let argsTemp = [...args]
                                                argsTemp.splice(idx, 1)
                                                setArgs(argsTemp)
                                            }}
                                            valueType="text"
                                        />
                                    ))}
                                <div
                                    className="add-parameter pointer fs-14 cb-5 mb-20"
                                    onClick={(e) =>
                                        setArgs((args) => [{ k: '', v: '', keyError: '', valueError: '' }, ...args])
                                    }
                                >
                                    <span className="fa fa-plus mr-8"></span>Add parameter
                                </div>
                            </div>
                        </>
                    )}
                    <div className="form__buttons mt-12">
                        <button tabIndex={5} type="button" className={`cta`} onClick={handleOnSubmit}>
                            {loading ? <Progressing /> : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
            {renderConfirmationModal()}
        </>
    )
}
