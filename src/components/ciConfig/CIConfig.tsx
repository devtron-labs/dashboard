import React, { useState, useEffect } from 'react'
import Select from '../common/Select/Select'
import { Progressing, useForm, showError, multiSelectStyles } from '../common'
import { DOCUMENTATION, PATTERNS, REGISTRY_TYPE_MAP, URLS } from '../../config'
import { saveCIConfig, updateCIConfig, getDockerRegistryMinAuth } from './service';
import { getSourceConfig, getCIConfig } from '../../services/service';
import { useParams } from 'react-router'
import { KeyValueInput } from '../configMaps/ConfigMap'
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import './CIConfig.scss';
import ReactSelect, { components } from 'react-select';
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';

export default function CIConfig({ respondOnSuccess, ...rest }) {
    const [dockerRegistries, setDockerRegistries] = useState(null)
    const [sourceConfig, setSourceConfig] = useState(null)
    const [ciConfig, setCIConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const { appId } = useParams<{ appId: string; }>()
    useEffect(() => {
        initialise()
    }, [])

    async function initialise() {
        try {
            setLoading(true)
            const [{ result: dockerRegistries }, { result: sourceConfig }, { result: ciConfig }] = await Promise.all([getDockerRegistryMinAuth(appId), getSourceConfig(appId), getCIConfig(+appId)])
            setDockerRegistries(dockerRegistries);
            setSourceConfig(sourceConfig);
            setCIConfig(ciConfig)
            setLoading(false)
        }
        catch (err) {
            showError(err)
            setLoading(false)
        }
    }

    async function reload() {
        try {
            setLoading(true)
            const { result } = await getCIConfig(+appId)
            setCIConfig(result)
            setLoading(false)
            respondOnSuccess()
        }
        catch (err) {
            showError(err)
        }
    }

    if (loading) return <Progressing pageLoader />
    if (!sourceConfig || !Array.isArray(sourceConfig.material || !Array.isArray(dockerRegistries))) return null
    return <Form dockerRegistries={dockerRegistries} sourceConfig={sourceConfig} ciConfig={ciConfig} reload={reload} appId={appId} />

}

function Form({ dockerRegistries, sourceConfig, ciConfig, reload, appId }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const _selectedMaterial = ciConfig && ciConfig.dockerBuildConfig.gitMaterialId ? sourceConfig.material.find(material => material.id === ciConfig.dockerBuildConfig.gitMaterialId) : Array.isArray(sourceConfig.material) && (sourceConfig.material[0]);
    const [selectedMaterial, setSelectedMaterial] = useState(_selectedMaterial)
    const _selectedRegistry = Array.isArray(dockerRegistries) && dockerRegistries.find(reg => reg.isDefault);
    const [selectedRegistry, setSelectedRegistry] = useState(_selectedRegistry)

    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            repository: { value: _selectedMaterial.name, error: "" },
            dockerfile: { value: ciConfig ? ciConfig.dockerBuildConfig.dockerfileRelativePath : "Dockerfile", error: "" },
            registry: { value: ciConfig ? ciConfig.dockerRegistry : (Array.isArray(dockerRegistries) ? dockerRegistries.find(reg => reg.isDefault).id || "" : ""), error: "" },
            repository_name: { value: ciConfig ? ciConfig.dockerRepository : "", error: "" },
        },
        {
            repository: {
                required: true,
                validator: {
                    error: 'Repository is required',
                    regex: /^.*$/
                }
            },
            dockerfile: {
                required: true,
                validator: {
                    error: 'Dockerfile is required',
                    regex: PATTERNS.STRING
                }
            },
            registry: {
                required: true,
                validatior: {
                    error: 'registry is required',
                    regex: PATTERNS.STRING
                }
            },
            repository_name: {
                required: false,
            }

        }, onValidation);
    const [args, setArgs] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let args = []
        if (ciConfig && ciConfig.dockerBuildConfig.args) {
            args = Object.keys(ciConfig.dockerBuildConfig.args).map(arg => ({ k: arg, v: ciConfig.dockerBuildConfig.args[arg], keyError: '', valueError: '' }))
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
            }
            else if (k && !v) {
                valueError = 'This field is required'
            }
            let arg = { k, v, keyError, valueError }
            return arg
        })
        const areArgsWrong = args2.some(arg => (arg.keyError || arg.valueError))
        if (areArgsWrong) {
            setArgs([...args2])
            return
        }
        let requestBody = {
            id: ciConfig ? ciConfig.id : null,
            appId: +(appId) || null,
            dockerRegistry: registry.value || "",
            dockerRepository: repository_name.value || "",
            beforeDockerBuild: [],
            dockerBuildConfig: {
                dockerfilePath: `${selectedMaterial.checkoutPath}/${dockerfile.value}`.replace("//", "/"),
                args: args.reduce((agg, { k, v }) => {
                    if (k && v) agg[k] = v;
                    return agg
                }, {}),
                dockerfileRepository: repository.value,
                dockerfileRelativePath: dockerfile.value.replace(/^\//, ""),
                gitMaterialId: selectedMaterial.id
            },
            afterDockerBuild: [],
            appName: '',
            ...(ciConfig && ciConfig.version ? { version: ciConfig.version } : {})
        }
        setLoading(true)
        try {
            const saveOrUpdate = ciConfig && ciConfig.id ? updateCIConfig : saveCIConfig
            const { result } = await saveOrUpdate(requestBody)
            toast.success('Successfully saved.');
            reload();
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
        }
    }
    function handleArgsChange(index, k, v) {
        setArgs(arr => {
            arr[index] = { k: k, v: v, keyError: '', valueError: '' }
            return Array.from(arr);
        })
    }

    function toggleCollapse() {
        setIsCollapsed(!isCollapsed)
    }

    function handleFileLocationChange(selectedMaterial) {
        setSelectedMaterial(selectedMaterial);
        repository.value = selectedMaterial.name;
    }

    function handleRegistryChange(selectedRegistry) {
      setSelectedRegistry(selectedRegistry);
        registry.value = selectedRegistry.id;
    }

    const { repository, dockerfile, registry, repository_name, key, value } = state
    return (
        <div className="form__app-compose">
            <h1 className="form__title">Docker build configuration</h1>
            <p className="form__subtitle">Required to execute CI pipelines for this application.
            <span><a rel="noreferrer noopener" target="_blank" className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}> Learn more</a> </span></p>
            <div className="white-card white-card__docker-config">
                <div className="fs-14 fw-6 pb-16">Selected repository will be used to store container images for this application</div>
                <div className="mb-4 form-row__docker">
                    <div className="form__field">
                        <label htmlFor="" className="form__label">Container registry*</label>
                        <ReactSelect className="m-0"
                        tabIndex='1'
                        isMulti={false}
                        isClearable={false}
                        options={dockerRegistries}
                        getOptionLabel={option => `${option.id}`}
                        getOptionValue={option => `${option.id}`}
                        value={selectedRegistry}
                        styles={{
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
                            }
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option: (props) => {
                                return <components.Option {...props}>
                                    <div style={{display: 'flex'}}>
                                    {props.isSelected ? <Check className="icon-dim-16 vertical-align-middle scb-5 mr-8 mt-4" /> : <span className="inline-block icon-dim-16 mr-8"></span>}
                                    <div className={'registry-icon mr-5 ' + props.data.registryType}></div>
                                    {props.label}
                                    </div>
                                </components.Option>
                            },
                            MenuList: (props) => {
                              return <components.MenuList {...props}>
                                  {props.children}
                                  <NavLink to={`${URLS.GLOBAL_CONFIG_DOCKER}`} className="cb-5 select__sticky-bottom block fw-5 anchor w-100 cursor no-decor" style={{backgroundColor: '#FFF'}}>
                                <Add className="icon-dim-20 mr-5 fcb-5 mr-12 vertical-align-bottom" />
                                Add Container Registry
                            </NavLink>
                              </components.MenuList>
                          },
                            Control: (props) => {
                                let value = "";
                                if (props.hasValue) {
                                    value = props.getValue()[0].registryType;
                                }
                                return <components.Control {...props}>
                                    <div className={'registry-icon ml-5 ' + value}></div>
                                    {props.children}
                                </components.Control>

                            },
                        }}

                        onChange={(selected) => { handleRegistryChange(selected) }}
                    />
                        {registry.error && <label className="form__error">{registry.error}</label>}
                    </div>
                    <div className="form__field">
                        <label htmlFor="" className="form__label">Container Repository {REGISTRY_TYPE_MAP[selectedRegistry.registryType].desiredFormat}</label>
                        <input
                            tabIndex={4}
                            type="text"
                            className="form__input"
                            placeholder={REGISTRY_TYPE_MAP[selectedRegistry.registryType].placeholderText}
                            name="repository_name"
                            value={repository_name.value}
                            onChange={handleOnChange}
                            autoFocus
                            autoComplete={"off"}
                        />
                        {repository_name.error && <label className="form__error">{repository_name.error}</label>}
                        {!ciConfig && <label className="form__error form__error--info">New repository will be created if not provided</label>}
                    </div>
                </div>
                <div className="fs-14 fw-6 pb-16">Docker file location</div>
                <div className="mb-4 form-row__docker">
                    <div className="form__field">
                        <label className="form__label">Select repository containing docker file</label>
                        <ReactSelect className="m-0"
                        tabIndex='1'
                        isMulti={false}
                        isClearable={false}
                        options={sourceConfig.material}
                        getOptionLabel={option => `${option.name}`}
                        getOptionValue={option => `${option.checkoutPath}`}
                        value={selectedMaterial}
                        styles={{
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
                            }
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option: (props) => {
                                return <components.Option {...props}>
                                    {props.isSelected ? <Check className="icon-dim-16 vertical-align-middle scb-5 mr-8" /> : <span className="inline-block icon-dim-16 mr-8"></span>}

                                    {props.data.url.includes("gitlab") ? <GitLab className="mr-8 vertical-align-middle icon-dim-20" /> : null}
                                    {props.data.url.includes("github") ? <GitHub className="mr-8 vertical-align-middle icon-dim-20" /> : null}
                                    {props.data.url.includes("bitbucket") ? <BitBucket className="mr-8 vertical-align-middle icon-dim-20" /> : null}
                                    {props.data.url.includes("gitlab") || props.data.url.includes("github") || props.data.url.includes("bitbucket") ? null : <Git className="mr-8 vertical-align-middle icon-dim-20" />}

                                    {props.label}
                                </components.Option>
                            },
                            Control: (props) => {
                                let value = "";

                                if (props.hasValue) {
                                    value = props.getValue()[0].url;
                                }
                                let showGit = value && !value.includes("github") && !value.includes("gitlab") && !value.includes("bitbucket")
                                return <components.Control {...props}>

                                    {value.includes("github") ? <GitHub className="icon-dim-20 ml-8" /> : null}
                                    {value.includes("gitlab") ? <GitLab className="icon-dim-20 ml-8" /> : null}
                                    {value.includes("bitbucket") ? <BitBucket className="icon-dim-20 ml-8" /> : null}
                                    {showGit ? <Git className="icon-dim-20 ml-8" /> : null}
                                    {props.children}
                                </components.Control>

                            },
                        }}

                        onChange={(selected) => { handleFileLocationChange(selected) }}
                    />
                        {repository.error && <label className="form__error">{repository.error}</label>}
                    </div>
                    <div className="form__field">
                        <label htmlFor="" className="form__label">Docker file path (relative)*</label>
                        <div className="docker-flie-container">
                        <span className="checkout-path-container">{selectedMaterial.checkoutPath}</span>
                        <input
                            tabIndex={2}
                            type="text"
                            className="form__input file-name"
                            placeholder="Dockerfile"
                            name="dockerfile"
                            value={dockerfile.value}
                            onChange={handleOnChange}
                            autoFocus
                            autoComplete={"off"}
                        />
                        </div>
                        {dockerfile.error && <label className="form__error">{dockerfile.error}</label>}
                    </div>
                </div>
                <hr className="mt-0 mb-20" />
                <div onClick={toggleCollapse} className="flex left cursor">
                    <div>
                        <div className="fs-14 fw-6 ">Advanced (optional)</div>
                        <div className="form-row form-row__add-parameters">
                            <label htmlFor="" className="fs-13 fw-4 cn-7">Docker build arguments</label>
                        </div>
                    </div>
                    <span className="docker__dropdown ">
                        <Dropdown className="icon-dim-32 rotate " style={{ ['--rotateBy' as any]: isCollapsed ? '180deg' : '0deg' }} />
                    </span>
                </div>
                {isCollapsed ? <>
                    {args && args.map((arg, idx) => <KeyValueInput keyLabel={"Key"} valueLabel={"Value"}  {...arg} key={idx} index={idx} onChange={handleArgsChange} onDelete={e => { let argsTemp = [...args]; argsTemp.splice(idx, 1); setArgs(argsTemp) }} valueType="text" />)}
                    <div className="add-parameter pointer fs-14 cb-5 mb-20" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>

                        <span className="fa fa-plus mr-8"></span>Add parameter
                    </div> </> : ''}
                <div className="form__buttons mt-12">
                    <button tabIndex={5} type="button" className={`cta`} onClick={handleOnSubmit}>{loading ? <Progressing /> : 'Save Configuration'}</button>
                </div>
            </div>
        </div>
    )
}