import React, { useState } from 'react'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as PluginIcon } from '../../assets/icons/ic-plugin.svg'
import CIConfig from '../ciConfig/CIConfig'
import { deepEqual, noop } from '../common'
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'
import { AdvancedConfigOptionsProps, CIConfigParentState } from '../ciConfig/types'
import { DockerConfigOverrideType } from '../ciPipeline/types'

export default function AdvancedConfigOptions({
    ciPipeline,
    formData,
    setFormData,
    setDockerConfigOverridden,
}: AdvancedConfigOptionsProps) {
    const [collapsedSection, setCollapsedSection] = useState<boolean>(false)
    const [allowOverride, setAllowOverride] = useState<boolean>(ciPipeline?.isDockerConfigOverridden ?? false)
    const [parentState, setParentState] = useState<CIConfigParentState>({
        loadingState: ComponentStates.loading,
        selectedCIPipeline: ciPipeline,
        dockerRegistries: null,
        sourceConfig: null,
        ciConfig: null,
        defaultDockerConfigs: null,
    })

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

    const updateDockerConfigOverride = (key: string, value: any) => {
        const _form = {
            isDockerConfigOverridden: ciPipeline?.isDockerConfigOverridden,
            ...formData,
        }
        const keyPair = key.split('.')

        // Init the dockerConfigOverride with global values if dockerConfigOverride data is not present
        if (
            !ciPipeline?.isDockerConfigOverridden &&
            (!formData.dockerConfigOverride || !Object.keys(formData.dockerConfigOverride).length) &&
            parentState?.ciConfig
        ) {
            _form.dockerConfigOverride = {
                dockerRegistry: parentState.ciConfig.dockerRegistry,
                dockerRepository: parentState.ciConfig.dockerRepository,
                ciBuildConfig: parentState.ciConfig.ciBuildConfig,
            }
        }

        // Update the specific config value present at different level from dockerConfigOverride
        if (key.includes('dockerBuildConfig')) {
            _form[keyPair[0]][keyPair[1]][keyPair[2]][keyPair[3]] = value
        } else if (key.includes('ciBuildConfig')) {
            _form[keyPair[0]][keyPair[1]][keyPair[2]] = value
        } else if (key.startsWith('dockerConfigOverride')) {
            _form[keyPair[0]][keyPair[1]] = value
        } else if (key === 'isDockerConfigOverridden') {
            _form.isDockerConfigOverridden = value
            setAllowOverride(value)

            // Empty dockerConfigOverride when deleting override
            if (!value) {
                _form.dockerConfigOverride = {} as DockerConfigOverrideType
            }
        }

        // Revisit
        if (_form.dockerConfigOverride.ciBuildConfig?.hasOwnProperty('id')) {
            delete _form.dockerConfigOverride.ciBuildConfig.id
        }

        setFormData(_form)

        // Check for diff in global & current CI config and set isDockerConfigOverridden flag accordingly
        setDockerConfigOverridden(!deepEqual(_form.dockerConfigOverride, parentState.defaultDockerConfigs))
    }

    const renderDockerArgs = () => {
        return (
            <div>
                <h3 className="fs-13 fw-6 cn-9 lh-20 m-0">Docker build arguments</h3>
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

    const toggleAdvancedOptions = () => {
        setCollapsedSection(!collapsedSection)
    }

    const toggleAllowOverride = () => {
        if (updateDockerConfigOverride) {
            updateDockerConfigOverride('isDockerConfigOverridden', !allowOverride)
        }
    }

    return (
        <div className="ci-advanced-options__container mb-20">
            <hr />
            <div className="ci-advanced-options__toggle flex left pointer" onClick={toggleAdvancedOptions}>
                <div>
                    <h2 className="fs-14 fw-6 cn-9 lh-20 m-0">Override Options</h2>
                    <p className="fs-13 fw-4 cn-7 lh-20 m-0">
                        Override container registry, dockerfile for this pipeline.
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
                />
                {parentState?.loadingState === ComponentStates.loaded && renderDockerArgs()}
            </div>
        </div>
    )
}
