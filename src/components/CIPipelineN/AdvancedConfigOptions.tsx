import React, {useEffect, useState} from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as QuestionIcon } from '../v2/assets/icons/ic-question.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import CIConfig from '../ciConfig/CIConfig'
import { deepEqual, noop } from '../common'
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'
import { AdvancedConfigOptionsProps, CIConfigParentState } from '../ciConfig/types'
import { CIBuildConfigType, CIBuildType, DockerConfigOverrideKeys, DockerConfigOverrideType } from '../ciPipeline/types'
import TippyCustomized, { TippyTheme } from '../common/TippyCustomized'
import {getTargetPlatformMap} from '../ciConfig/CIConfig.utils'
import TargetPlatformSelector from '../ciConfig/TargetPlatformSelector'
import {OptionType} from "../app/types";


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
        selectedCIPipeline: ciPipeline ? JSON.parse(JSON.stringify(ciPipeline)) : null,
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

    const updateSelectedPlatformsCustomTargetPlatform = () => {
        let _customTargetPlatform = false
        let targetPlatform = ''
        if (parentState?.selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform) {
            targetPlatform =
                parentState.selectedCIPipeline.dockerConfigOverride.ciBuildConfig.dockerBuildConfig.targetPlatform
        } else if (parentState?.ciConfig?.ciBuildConfig?.dockerBuildConfig?.targetPlatform) {
                targetPlatform = formData?.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform
        }

        let _selectedPlatforms = []
        if(targetPlatform.length > 0){
            _selectedPlatforms = targetPlatform.split(',').map((platformValue) => {
                _customTargetPlatform = _customTargetPlatform || !targetPlatformMap.get(platformValue)
                return { label: platformValue, value: platformValue }
            })
        }
        setTargetPlatforms(targetPlatform)
        setSelectedTargetPlatforms(_selectedPlatforms)
        setShowCustomPlatformWarning(_customTargetPlatform)
    }

    const handleChangeInTargetPlatforms = () => {
        const _form = { ...formData }
        setDockerConfigOverridden(allowOverride)
        if (parentState?.defaultDockerConfigs) {
            _form.dockerConfigOverride = parentState?.defaultDockerConfigs
        }
        let platformsArray = []
        selectedTargetPlatforms?.forEach(function (o) {
            platformsArray.push(o.label)
        })
        if (_form.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig) {
            _form.dockerConfigOverride.ciBuildConfig.dockerBuildConfig.targetPlatform = platformsArray.join()
        }
        setFormData(_form)
    }

    useEffect(() => {
        updateSelectedPlatformsCustomTargetPlatform()
    }, [parentState])

    useEffect(() => {
        handleChangeInTargetPlatforms()
    }, [selectedTargetPlatforms])

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

    const updateDockerConfigOverride = (key: string, value: CIBuildConfigType | boolean | string): void => {
        // Shallow copy all data from formData to _form
        const _form = {
            ...formData,
        }

        // Init the dockerConfigOverride with global values if dockerConfigOverride data is not present
        if (
            !ciPipeline?.isDockerConfigOverridden &&
            (!formData.dockerConfigOverride || !Object.keys(formData.dockerConfigOverride).length) &&
            parentState?.ciConfig
        ) {
            _form.dockerConfigOverride = {
                dockerRegistry: parentState.ciConfig.dockerRegistry,
                dockerRepository: parentState.ciConfig.dockerRepository,
                ciBuildConfig: JSON.parse(JSON.stringify(parentState.ciConfig.ciBuildConfig)),
            }
        }

        // Update the specific config value present at different level from dockerConfigOverride
        if (key === DockerConfigOverrideKeys.isDockerConfigOverridden) {
            const _value = value as boolean
            _form.isDockerConfigOverridden = _value
            setAllowOverride(_value)

            // Empty dockerConfigOverride when deleting override
            if (!_value) {
                _form.dockerConfigOverride = {} as DockerConfigOverrideType
            }
        } else if (
            key === DockerConfigOverrideKeys.dockerRegistry ||
            key === DockerConfigOverrideKeys.dockerRepository
        ) {
            _form.dockerConfigOverride[key] = value as string
        } else {
            _form.dockerConfigOverride[DockerConfigOverrideKeys.ciBuildConfig] = value as CIBuildConfigType
        }

        // // No need to pass the id in the request
        // if (_form.dockerConfigOverride.ciBuildConfig?.hasOwnProperty(DockerConfigOverrideKeys.id)) {
        //     delete _form.dockerConfigOverride.ciBuildConfig.id
        // }

        let platformsArray = []
        selectedTargetPlatforms?.forEach(function (o) {
            platformsArray.push(o.label)
        })
        if (_form.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig) {
            _form.dockerConfigOverride.ciBuildConfig.dockerBuildConfig.targetPlatform = platformsArray.join()
        }

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
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32 mt-8" onClick={addDockerArg}>
                    <Add className="add-icon mt-6" />
                    Add parameter
                </div>
                {formData.args.length > 0 &&
                    formData.args.map((arg, index) => {
                        return (
                            <div className="flexbox justify-space" key={`build-${index}`}>
                                <div className="mt-8 w-100">
                                    <input
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

                <div className="white-card white-card__docker-config dc__position-rel mb-15">
                    <TargetPlatformSelector
                        allowOverride={allowOverride}
                        selectedTargetPlatforms={selectedTargetPlatforms}
                        setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                        showCustomPlatformWarning={showCustomPlatformWarning}
                        setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                        targetPlatformMap={targetPlatformMap}
                        targetPlatform={targetPlatforms}
                        configOverrideView={false}
                    />
                </div>

                {parentState?.loadingState === ComponentStates.loaded &&
                    parentState.currentCIBuildType !== CIBuildType.BUILDPACK_BUILD_TYPE &&
                    renderDockerArgs()}
            </div>
        </div>
    )
}
