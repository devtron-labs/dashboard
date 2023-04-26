import React, { useEffect, useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as QuestionIcon } from '../v2/assets/icons/ic-question.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import CIConfig from '../ciConfig/CIConfig'
import { deepEqual, noop } from '../common'
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'
import { AdvancedConfigOptionsProps, CIConfigParentState } from '../ciConfig/types'
import { CIBuildConfigType, CIBuildType, DockerConfigOverrideKeys } from '../ciPipeline/types'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { getTargetPlatformMap } from '../ciConfig/CIConfig.utils'
import TargetPlatformSelector from '../ciConfig/TargetPlatformSelector'
import { OptionType } from '../app/types'

export default function AdvancedConfigOptions({
    ciPipeline,
    formData,
    setFormData,
    setDockerConfigOverridden,
    setLoadingData,
}: AdvancedConfigOptionsProps) {
    const [collapsedSection, setCollapsedSection] = useState<boolean>(false)
    const [allowOverride, setAllowOverride] = useState<boolean>(ciPipeline?.isDockerConfigOverridden ?? false)
    const [parentState, setParentState] = useState<CIConfigParentState>({
        loadingState: ComponentStates.loading,
        selectedCIPipeline: ciPipeline ? Object.assign({}, ciPipeline) : null,
        dockerRegistries: null,
        sourceConfig: null,
        ciConfig: null,
        defaultDockerConfigs: null,
        currentCIBuildType: null,
    })

    const [targetPlatforms, setTargetPlatforms] = useState<string>('')
    const targetPlatformMap = getTargetPlatformMap()
    const [selectedTargetPlatforms, setSelectedTargetPlatforms] = useState<OptionType[]>([])
    const [showCustomPlatformWarning, setShowCustomPlatformWarning] = useState<boolean>(false)

    useEffect(() => {
        if (parentState.ciConfig) {
            populateCurrentPlatformsData()
        }
    }, [parentState.ciConfig, allowOverride])

    const populateCurrentPlatformsData = () => {
        const _targetPlatforms =
            allowOverride && parentState.selectedCIPipeline?.isDockerConfigOverridden
                ? parentState.selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform
                : parentState.ciConfig.ciBuildConfig?.dockerBuildConfig?.targetPlatform
        setTargetPlatforms(_targetPlatforms)

        let _customTargetPlatform = false
        let _selectedPlatforms = []
        if (_targetPlatforms?.length > 0) {
            _selectedPlatforms = _targetPlatforms.split(',').map((platformValue) => {
                if (!_customTargetPlatform) {
                    _customTargetPlatform = !targetPlatformMap.get(platformValue)
                }
                return { label: platformValue, value: platformValue }
            })
        }
        setSelectedTargetPlatforms(_selectedPlatforms)
        setShowCustomPlatformWarning(_customTargetPlatform)
    }

    const addDockerArg = (): void => {
        const _form = { ...formData }

        if (_form.args.length > 0) {
            _form.args.unshift({ key: '', value: '' })
        } else {
            _form.args.push({ key: '', value: '' })
        }

        setFormData(_form)
    }

    const handleDockerArgChange = (event, index: number, key: 'key' | 'value'): void => {
        const _form = { ...formData }
        _form.args[index][key] = event.target.value
        setFormData(_form)
    }

    const removeDockerArgs = (index: number): void => {
        const _form = { ...formData }
        const newArgs = []
        for (let i = 0; i < _form.args.length; i++) {
            if (index != i) newArgs.push(_form.args[i])
        }
        _form.args = newArgs
        setFormData(_form)
    }

    const updateDockerConfigOverride = (
        key: string,
        value: CIBuildConfigType | OptionType[] | boolean | string,
    ): void => {
        // Shallow copy all data from formData to _form
        const _form = Object.assign({}, formData)

        // Init the dockerConfigOverride with global values if dockerConfigOverride data is not present
        if (!formData.dockerConfigOverride || !Object.keys(formData.dockerConfigOverride).length) {
            if (parentState.selectedCIPipeline?.isDockerConfigOverridden) {
                _form.dockerConfigOverride = Object.assign({}, parentState.selectedCIPipeline.dockerConfigOverride)
            } else if (parentState?.ciConfig) {
                _form.dockerConfigOverride = Object.assign(
                    {},
                    {
                        dockerRegistry: parentState.ciConfig.dockerRegistry,
                        dockerRepository: parentState.ciConfig.dockerRepository,
                        ciBuildConfig: parentState.ciConfig.ciBuildConfig,
                    },
                )
            }
        }

        // Update the specific config value present at different level from dockerConfigOverride
        if (key === DockerConfigOverrideKeys.isDockerConfigOverridden) {
            const _value = value as boolean
            _form.isDockerConfigOverridden = _value
            setAllowOverride(_value)
        } else if (
            key === DockerConfigOverrideKeys.dockerRegistry ||
            key === DockerConfigOverrideKeys.dockerRepository
        ) {
            _form.dockerConfigOverride[key] = value as string
        } else if (key === DockerConfigOverrideKeys.targetPlatform) {
            _form.dockerConfigOverride.ciBuildConfig = {
                ..._form.dockerConfigOverride.ciBuildConfig,
                dockerBuildConfig: {
                    ..._form.dockerConfigOverride.ciBuildConfig.dockerBuildConfig,
                    targetPlatform: (value as OptionType[]).map((_selectedTarget) => _selectedTarget.label).join(','),
                },
            }
        } else {
            _form.dockerConfigOverride.ciBuildConfig = value as CIBuildConfigType
        }

        // No need to pass the id in the request
        if (_form.dockerConfigOverride.ciBuildConfig?.hasOwnProperty(DockerConfigOverrideKeys.id)) {
            delete _form.dockerConfigOverride.ciBuildConfig.id
        }

        // set updated form data
        setFormData(_form)

        // Check for diff in global & current CI config and set isDockerConfigOverridden flag accordingly
        setDockerConfigOverridden(!deepEqual(_form.dockerConfigOverride, parentState.defaultDockerConfigs))
    }

    const renderDockerArgs = () => {
        return (
            <div>
                <h3 className="flex left fs-13 fw-6 cn-9 lh-20 m-0">
                    Docker build arguments
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300"
                        placement="top"
                        Icon={HelpIcon}
                        iconClass="fcv-5"
                        heading="Docker Build Arguments"
                        infoText="Key/value pair will be appended as docker build arguments (--build-args)."
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                    </TippyCustomized>
                </h3>
                <p className="fs-13 fw-4 cn-7 lh-20 m-0">Override docker build configurations for this pipeline.</p>
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32 mt-8" onClick={addDockerArg} data-testid="create-build-pipeline-docker-args-add-parameter-button">
                    <Add className="add-icon mt-6" />
                    Add parameter
                </div>
                {formData.args.length > 0 &&
                    formData.args.map((arg, index) => {
                        return (
                            <div className="flexbox justify-space" key={`build-${index}`}>
                                <div className="mt-8 w-100">
                                    <input
                                        data-testid={`docker-arg-key-${index}`}
                                        className="w-100 dc__top-radius-4 pl-10 pr-10 pt-6 pb-6 en-2 bw-1"
                                        autoComplete="off"
                                        placeholder="Key"
                                        type="text"
                                        value={arg.key}
                                        onChange={(event) => {
                                            handleDockerArgChange(event, index, 'key')
                                        }}
                                    />
                                    <textarea
                                        data-testid={`docker-arg-value-${index}`}
                                        className="build__value w-100 dc__bottom-radius-4 dc__no-top-border pl-10 pr-10 pt-6 pb-6 en-2 bw-1"
                                        value={arg.value}
                                        onChange={(event) => {
                                            handleDockerArgChange(event, index, 'value')
                                        }}
                                        placeholder="Value"
                                    />
                                </div>
                                <Close
                                    className="icon-dim-24 pointer mt-6 ml-6"
                                    onClick={() => {
                                        removeDockerArgs(index)
                                    }}
                                />
                            </div>
                        )
                    })}
            </div>
        )
    }

    const toggleAdvancedOptions = (): void => {
        setCollapsedSection(!collapsedSection)
    }

    const toggleAllowOverride = (): void => {
        if (updateDockerConfigOverride) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.isDockerConfigOverridden, !allowOverride)
        }
    }

    return (
        <div className="ci-advanced-options__container mb-20">
            <hr />
            <div className="ci-advanced-options__toggle flex left pointer" onClick={toggleAdvancedOptions}>
                <div>
                    <h2 className="fs-14 fw-6 cn-9 lh-20 m-0">Override Options</h2>
                    <p className="fs-13 fw-4 cn-7 lh-20 m-0">
                        Override container registry, container image for this pipeline.
                    </p>
                </div>
                <button
                    className={`allow-config-override flex h-28 ml-auto cta ${allowOverride ? 'delete' : 'ghosted'}`}
                    data-testid={`create-build-pipeline-${allowOverride ? 'delete' : 'allow'}-override-button`}
                    onClick={toggleAllowOverride}
                >
                    {`${allowOverride ? 'Delete' : 'Allow'} Override`}
                </button>
            </div>
            <div className="ci-advanced-options__wrapper">
                <CIConfig
                    respondOnSuccess={noop}
                    configOverrideView={true}
                    allowOverride={allowOverride}
                    parentState={parentState}
                    setParentState={setParentState}
                    updateDockerConfigOverride={updateDockerConfigOverride}
                    setLoadingData={setLoadingData}
                />

                {parentState?.loadingState === ComponentStates.loaded &&
                    parentState.currentCIBuildType !== CIBuildType.BUILDPACK_BUILD_TYPE && (
                        <>
                            <div className="white-card white-card__docker-config dc__position-rel mb-15">
                                <TargetPlatformSelector
                                    allowOverride={allowOverride}
                                    selectedTargetPlatforms={selectedTargetPlatforms}
                                    setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                                    showCustomPlatformWarning={showCustomPlatformWarning}
                                    setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                                    targetPlatformMap={targetPlatformMap}
                                    targetPlatform={targetPlatforms}
                                    configOverrideView={true}
                                    updateDockerConfigOverride={updateDockerConfigOverride}
                                />
                            </div>
                            {renderDockerArgs()}
                        </>
                    )}
            </div>
        </div>
    )
}
