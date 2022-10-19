import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { DOCUMENTATION, PATTERNS } from '../../config'
import { getWorkflowList } from '../../services/service'
import { OptionType } from '../app/types'
import { CIBuildConfigType, CIBuildType } from '../ciPipeline/types'
import { ConfirmationDialog, Progressing, showError, useForm } from '../common'
import { saveCIConfig, updateCIConfig } from './service'
import { CIConfigFormProps, ProcessedWorkflowsType } from './types'
import { processWorkflow } from '../app/details/triggerView/workflow.service'
import { WorkflowCreate } from '../app/details/triggerView/config'
import warningIconSrc from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as BookOpenIcon } from '../../assets/icons/ic-book-open.svg'
import CIConfigDiffView from './CIConfigDiffView'
import CIContainerRegistryConfig from './CIContainerRegistryConfig'
import CIDockerFileConfig from './CIDockerFileConfig'
import { getTargetPlatformMap } from './CIConfig.utils'

export default function CIConfigForm({
    dockerRegistries,
    sourceConfig,
    ciConfig,
    reload,
    appId,
    selectedCIPipeline,
    configOverrideWorkflows,
    configOverrideView,
    allowOverride,
    updateDockerConfigOverride,
    isCDPipeline,
}: CIConfigFormProps) {
    const _selectedMaterial =
        allowOverride && selectedCIPipeline?.isDockerConfigOverridden
            ? sourceConfig.material.find(
                  (material) => material.id === selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.gitMaterialId,
              )
            : ciConfig?.ciBuildConfig?.gitMaterialId
            ? sourceConfig.material.find((material) => material.id === ciConfig?.ciBuildConfig?.gitMaterialId)
            : sourceConfig.material[0]
    const [selectedMaterial, setSelectedMaterial] = useState(_selectedMaterial)
    const _selectedRegistry =
        allowOverride && selectedCIPipeline?.isDockerConfigOverridden
            ? dockerRegistries.find((reg) => reg.id === selectedCIPipeline.dockerConfigOverride?.dockerRegistry)
            : ciConfig && ciConfig.dockerRegistry
            ? dockerRegistries.find((reg) => reg.id === ciConfig.dockerRegistry)
            : dockerRegistries.find((reg) => reg.isDefault)
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            repository: { value: _selectedMaterial?.name || '', error: '' },
            dockerfile: {
                value: selectedCIPipeline?.isDockerConfigOverridden
                    ? selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath
                    : ciConfig?.ciBuildConfig?.dockerBuildConfig
                    ? ciConfig.ciBuildConfig.dockerBuildConfig?.dockerfileRelativePath
                    : 'Dockerfile',
                error: '',
            },
            registry: { value: _selectedRegistry?.id, error: '' },
            repository_name: {
                value: selectedCIPipeline?.isDockerConfigOverridden
                    ? selectedCIPipeline.dockerConfigOverride?.dockerRepository
                    : ciConfig
                    ? ciConfig.dockerRepository
                    : '',
                error: '',
            },
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
    const targetPlatformMap = getTargetPlatformMap()
    let _selectedPlatforms = []
    let _customTargetPlatorm = false
    if (ciConfig?.ciBuildConfig?.dockerBuildConfig?.targetPlatform) {
        _selectedPlatforms = ciConfig.ciBuildConfig.dockerBuildConfig.targetPlatform.split(',').map((platformValue) => {
            _customTargetPlatorm = _customTargetPlatorm || !targetPlatformMap.get(platformValue)
            return { label: platformValue, value: platformValue }
        })
    }
    const [selectedTargetPlatforms, setSelectedTargetPlatforms] = useState<OptionType[]>(_selectedPlatforms)
    const [showCustomPlatformWarning, setShowCustomPlatformWarning] = useState<boolean>(_customTargetPlatorm)
    const [showCustomPlatformConfirmation, setShowCustomPlatformConfirmation] = useState<boolean>(false)
    const [showConfigOverrideDiff, setShowConfigOverrideDiff] = useState<boolean>(false)
    const [processedWorkflows, setProcessedWorkflows] = useState<ProcessedWorkflowsType>({
        processing: false,
        workflows: [],
    })
    const configOverridenPipelines = ciConfig?.ciPipelines?.filter((_ci) => _ci.isDockerConfigOverridden)
    const [currentCIBuildConfig, setCurrentCIBuildConfig] = useState<CIBuildConfigType>({
        buildPackConfig: ciConfig?.ciBuildConfig?.buildPackConfig,
        ciBuildType: ciConfig?.ciBuildConfig?.ciBuildType || CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
        dockerBuildConfig: ciConfig?.ciBuildConfig?.dockerBuildConfig || {
            dockerfileRelativePath: state.dockerfile.value.replace(/^\//, ''),
            dockerfileContent: '',
        },
        gitMaterialId: selectedMaterial?.id,
    })

    useEffect(() => {
        let args = []
        if (ciConfig?.ciBuildConfig?.dockerBuildConfig?.args) {
            args = Object.keys(ciConfig.ciBuildConfig.dockerBuildConfig.args).map((arg) => ({
                k: arg,
                v: ciConfig.ciBuildConfig.dockerBuildConfig.args[arg],
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

        const requestBody = {
            id: ciConfig?.id ?? null,
            appId: +appId ?? null,
            dockerRegistry: registry.value || '',
            dockerRepository: repository_name.value || '',
            beforeDockerBuild: [],
            ciBuildConfig: {
                ...currentCIBuildConfig,
                dockerBuildConfig: {
                    dockerfileRelativePath: dockerfile.value.replace(/^\//, ''),
                    dockerfileContent: '',
                    dockerfilePath: `${selectedMaterial?.checkoutPath}/${dockerfile.value}`.replace('//', '/'),
                    args: args.reduce((agg, { k, v }) => {
                        if (k && v) agg[k] = v
                        return agg
                    }, {}),
                    dockerfileRepository: repository.value,
                    targetPlatform: targetPlatforms,
                },
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

    const renderConfirmationModal = (): JSX.Element => {
        return (
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warningIconSrc} />
                <ConfirmationDialog.Body title="Please ensure you have set valid target platform for the build" />
                <span className="fs-14 cn-7 dc__block">Custom target platform(s):</span>
                {selectedTargetPlatforms.map((targetPlatform) =>
                    targetPlatformMap.get(targetPlatform.value) ? null : (
                        <span className="fs-13 cn-7 dc__block">{targetPlatform.value}</span>
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
                    <button onClick={onValidation} className="cta ml-12 dc__no-decor">
                        Confirm save
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    const processFetchedWorkflows = async () => {
        if (!processedWorkflows.processing) {
            try {
                setProcessedWorkflows({
                    ...processedWorkflows,
                    processing: true,
                })
                const { result } = await getWorkflowList(appId)
                const { workflows } = processWorkflow(result, ciConfig, null, WorkflowCreate, WorkflowCreate.workflow)

                setProcessedWorkflows({ processing: false, workflows })
            } catch (err) {
                showError(err)
            }
        }
    }

    const handleOnChangeConfig = (e) => {
        handleOnChange(e)

        if (updateDockerConfigOverride) {
            updateDockerConfigOverride(
                `dockerConfigOverride.${
                    e.target.name === 'dockerfile'
                        ? 'ciBuildConfig.dockerBuildConfig.dockerfileRelativePath'
                        : 'dockerRepository'
                }`,
                e.target.value,
            )
        }
    }

    const toggleConfigOverrideDiffModal = () => {
        setShowConfigOverrideDiff(!showConfigOverrideDiff)
        if (!showConfigOverrideDiff) {
            processFetchedWorkflows()
        }
    }

    const { repository, dockerfile, registry, repository_name, key, value } = state
    return (
        <>
            <div className={`form__app-compose ${configOverrideView ? 'config-override-view' : ''}`}>
                {!configOverrideView && (
                    <div className="flex dc__content-space mb-20">
                        <h2 className="form__title m-0-imp">Build Configuration</h2>
                        <a
                            className="flex right dc__link"
                            rel="noreferrer noopener"
                            target="_blank"
                            href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}
                        >
                            <BookOpenIcon className="icon-dim-16 mr-8" />
                            <span>View documentation</span>
                        </a>
                    </div>
                )}
                <CIContainerRegistryConfig
                    appId={appId}
                    configOverrideView={configOverrideView}
                    ciConfig={ciConfig}
                    allowOverride={allowOverride}
                    configOverridenPipelines={configOverridenPipelines}
                    toggleConfigOverrideDiffModal={toggleConfigOverrideDiffModal}
                    updateDockerConfigOverride={updateDockerConfigOverride}
                    dockerRegistries={dockerRegistries}
                    registry={registry}
                    repository_name={repository_name}
                    currentRegistry={_selectedRegistry}
                    handleOnChangeConfig={handleOnChangeConfig}
                    isCDPipeline={isCDPipeline}
                />
                <CIDockerFileConfig
                    ciConfig={ciConfig}
                    sourceConfig={sourceConfig}
                    configOverrideView={configOverrideView}
                    allowOverride={allowOverride}
                    _selectedMaterial={_selectedMaterial}
                    selectedMaterial={selectedMaterial}
                    setSelectedMaterial={setSelectedMaterial}
                    repository={repository}
                    dockerfile={dockerfile}
                    updateDockerConfigOverride={updateDockerConfigOverride}
                    args={args}
                    setArgs={setArgs}
                    handleOnChangeConfig={handleOnChangeConfig}
                    selectedTargetPlatforms={selectedTargetPlatforms}
                    setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                    targetPlatformMap={targetPlatformMap}
                    showCustomPlatformWarning={showCustomPlatformWarning}
                    setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                    currentCIBuildConfig={currentCIBuildConfig}
                    setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                />
                {!configOverrideView && (
                    <div className="form__buttons mt-12">
                        <button tabIndex={5} type="button" className="cta" onClick={handleOnSubmit}>
                            {loading ? <Progressing /> : 'Save Configuration'}
                        </button>
                    </div>
                )}
            </div>
            {showCustomPlatformConfirmation && renderConfirmationModal()}
            {showConfigOverrideDiff && (
                <CIConfigDiffView
                    ciConfig={ciConfig}
                    configOverridenPipelines={configOverridenPipelines}
                    configOverrideWorkflows={configOverrideWorkflows}
                    processedWorkflows={processedWorkflows}
                    toggleConfigOverrideDiffModal={toggleConfigOverrideDiffModal}
                />
            )}
        </>
    )
}
