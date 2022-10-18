import React from 'react'

import ReactSelect, { components } from 'react-select'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import CIAdvancedConfig from './CIAdvancedConfig'
import { _multiSelectStyles } from './CIConfig.utils'
import Tippy from '@tippyjs/react'

export default function CIDockerFileConfig({
    configOverrideView,
    ciConfig,
    sourceConfig,
    allowOverride,
    _selectedMaterial,
    selectedMaterial,
    setSelectedMaterial,
    repository,
    dockerfile,
    updateDockerConfigOverride,
    args,
    setArgs,
    handleOnChangeConfig,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    targetPlatformMap,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
}) {
    const handleFileLocationChange = (selectedMaterial): void => {
        setSelectedMaterial(selectedMaterial)
        repository.value = selectedMaterial.name

        if (updateDockerConfigOverride) {
            updateDockerConfigOverride('dockerConfigOverride.ciBuildConfig.gitMaterialId', selectedMaterial.id)
        }
    }

    const repositoryOption = (props): JSX.Element => {
        props.selectProps.styles.option = getCustomOptionSelectionStyle()
        return (
            <components.Option {...props}>
                {props.data.url.includes('gitlab') && <GitLab className="mr-8 dc__vertical-align-middle icon-dim-20" />}
                {props.data.url.includes('github') && <GitHub className="mr-8 dc__vertical-align-middle icon-dim-20" />}
                {props.data.url.includes('bitbucket') && (
                    <BitBucket className="mr-8 dc__vertical-align-middle icon-dim-20" />
                )}
                {props.data.url.includes('gitlab') ||
                props.data.url.includes('github') ||
                props.data.url.includes('bitbucket') ? null : (
                    <Git className="mr-8 dc__vertical-align-middle icon-dim-20" />
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
                {value.includes('github') && <GitHub className="icon-dim-20 ml-10" />}
                {value.includes('gitlab') && <GitLab className="icon-dim-20 ml-10" />}
                {value.includes('bitbucket') && <BitBucket className="icon-dim-20 ml-10" />}
                {showGit && <Git className="icon-dim-20 ml-10" />}
                {props.children}
            </components.Control>
        )
    }

    return (
        <div className="white-card white-card__docker-config dc__position-rel">
            <div className={`fs-14 fw-6 lh-20 ${configOverrideView ? 'pb-20' : 'pb-16'}`}>
                How do you want to build the container image?
            </div>
            <div className="mb-4 form-row__docker">
                <div className="form__field">
                    <label className="form__label">Select repository containing Dockerfile</label>
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        isMulti={false}
                        isClearable={false}
                        options={sourceConfig.material}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.checkoutPath}`}
                        value={configOverrideView && !allowOverride ? _selectedMaterial : selectedMaterial}
                        styles={_multiSelectStyles}
                        components={{
                            IndicatorSeparator: null,
                            Option: repositoryOption,
                            Control: repositoryControls,
                        }}
                        onChange={(selected) => {
                            handleFileLocationChange(selected)
                        }}
                        isDisabled={configOverrideView && !allowOverride}
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
                            content={selectedMaterial?.checkoutPath}
                        >
                            <span className="checkout-path-container bcn-1 en-2 bw-1 dc__no-right-border dc__ellipsis-right">
                                {selectedMaterial?.checkoutPath}
                            </span>
                        </Tippy>

                        <input
                            tabIndex={4}
                            type="text"
                            className="form__input file-name"
                            placeholder="Dockerfile"
                            name="dockerfile"
                            value={
                                configOverrideView && !allowOverride
                                    ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath || 'Dockerfile'
                                    : dockerfile.value
                            }
                            onChange={handleOnChangeConfig}
                            autoComplete={'off'}
                            disabled={configOverrideView && !allowOverride}
                        />
                    </div>
                    {dockerfile.error && <label className="form__error">{dockerfile.error}</label>}
                </div>
            </div>
            {!configOverrideView && (
                <>
                    <hr className="mt-0 mb-20" />
                    <CIAdvancedConfig
                        args={args}
                        setArgs={setArgs}
                        selectedTargetPlatforms={selectedTargetPlatforms}
                        setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                        targetPlatformMap={targetPlatformMap}
                        showCustomPlatformWarning={showCustomPlatformWarning}
                        setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                    />
                </>
            )}
        </div>
    )
}
