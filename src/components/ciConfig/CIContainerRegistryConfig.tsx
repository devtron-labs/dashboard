import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ReactSelect, { components } from 'react-select'
import { ReactComponent as ArrowIcon } from '../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { REGISTRY_TYPE_MAP, Routes, URLS } from '../../config'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { _multiSelectStyles } from './CIConfig.utils'
import { CIContainerRegistryConfigProps } from './types'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'

export default function CIContainerRegistryConfig({
    appId,
    configOverrideView,
    ciConfig,
    allowOverride,
    configOverridenPipelines,
    toggleConfigOverrideDiffModal,
    updateDockerConfigOverride,
    dockerRegistries,
    registry,
    repository_name,
    currentRegistry,
    handleOnChangeConfig,
    isCDPipeline,
}: CIContainerRegistryConfigProps) {
    const [selectedRegistry, setSelectedRegistry] = useState(currentRegistry)

    const onClickRedirectLink = (e) => {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('takeMeThereClicked', '1')
        }
    }

    const getInfoColourBarProps = () => {
        if (configOverridenPipelines?.length > 0) {
            return {
                message: (
                    <>
                        <span className="fw-6">Overrides:</span>&nbsp;
                        <span className="mr-4">This configuration is overriden for build pipeline of</span>
                    </>
                ),
                linkText: (
                    <span className="flex">
                        {`${configOverridenPipelines.length} Workflow${configOverridenPipelines.length > 1 ? 's' : ''}`}
                        <ArrowIcon className="icon-dim-16 fcb-5 dc__flip-180" />
                    </span>
                ),
                linkClass: 'flex left',
                linkOnClick: toggleConfigOverrideDiffModal,
            }
        }
        return {
            message: (
                <>
                    <span className="fw-6">Overrides:</span>&nbsp;
                    <span className="mr-8">
                        Container registry & docker file location for build pipelines can be overriden.
                    </span>
                    {isCDPipeline && (
                        <Link to={`/${Routes.APP}/${appId}/${Routes.WORKFLOW_EDITOR}`} onClick={onClickRedirectLink}>
                            Take me there
                        </Link>
                    )}
                </>
            ),
        }
    }

    const handleRegistryChange = (selectedRegistry): void => {
        setSelectedRegistry(selectedRegistry)
        registry.value = selectedRegistry.id

        if (updateDockerConfigOverride) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.dockerRegistry, selectedRegistry.id)
        }
    }

    const containerRegistryOption = (props): JSX.Element => {
        props.selectProps.styles.option = getCustomOptionSelectionStyle()
        return (
            <components.Option {...props}>
                <div style={{ display: 'flex' }}>
                    <div className={'dc__registry-icon mr-5 ' + props.data.registryType}></div>
                    {props.label}
                </div>
            </components.Option>
        )
    }

    const containerRegistryMenuList = (props): JSX.Element => {
        return (
            <components.MenuList {...props}>
                {props.children}
                {!configOverrideView && (
                    <NavLink
                        to={`${URLS.GLOBAL_CONFIG_DOCKER}`}
                        className="cb-5 select__sticky-bottom dc__block fw-5 anchor w-100 cursor dc__no-decor bottom-0"
                        style={{ backgroundColor: '#FFF' }}
                        data-testid="add-container-registry-button"
                    >
                        <Add className="icon-dim-20 mr-5 fcb-5 mr-12 dc__vertical-align-bottom " />
                        Add Container Registry
                    </NavLink>
                )}
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
                <div className={'dc__registry-icon ml-10 ' + value}></div>
                {props.children}
            </components.Control>
        )
    }

    return (
        <div className="white-card white-card__docker-config dc__position-rel mb-12">
            <h3 className="fs-14 fw-6 lh-20 m-0 pb-16" data-testid="store-container-image-heading">Store container image at</h3>
            <div className="mb-4 form-row__docker">
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label htmlFor="" className="form__label dc__required-field">
                        Container Registry
                    </label>
                    {configOverrideView && !allowOverride ? (
                        <div className="flex left">
                            <span className={`dc__registry-icon mr-8 ${currentRegistry?.registryType}`} />
                            <span className="fs-14 fw-4 lh-20 cn-9">{currentRegistry?.id}</span>
                        </div>
                    ) : (
                            <ReactSelect
                                className="m-0"
                                classNamePrefix="build-config__select-container-registry"
                                tabIndex={1}
                                isMulti={false}
                                isClearable={false}
                                options={dockerRegistries}
                                getOptionLabel={(option) => `${option.id}`}
                                getOptionValue={(option) => `${option.id}`}
                                value={configOverrideView && !allowOverride ? currentRegistry : selectedRegistry}
                                styles={_multiSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                    Option: containerRegistryOption,
                                    MenuList: containerRegistryMenuList,
                                    Control: containerRegistryControls,
                                }}
                                onChange={handleRegistryChange}
                                isDisabled={configOverrideView && !allowOverride}
                            />
                    )}
                    {registry.error && <label className="form__error">{registry.error}</label>}
                </div>
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label htmlFor="" className="form__label">
                        Container Repository&nbsp;
                        {selectedRegistry && REGISTRY_TYPE_MAP[selectedRegistry.registryType]?.desiredFormat}
                    </label>
                    {configOverrideView && !allowOverride ? (
                        <span className="fs-14 fw-4 lh-20 cn-9">{ciConfig?.dockerRepository}</span>
                    ) : (
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
                                value={
                                    configOverrideView && !allowOverride
                                        ? ciConfig?.dockerRepository || ''
                                        : repository_name.value
                                }
                                onChange={handleOnChangeConfig}
                                autoFocus={!configOverrideView}
                                autoComplete={'off'}
                                disabled={configOverrideView && !allowOverride}
                                data-testid="container-repository-textbox"
                            />
                    )}
                    {repository_name.error && <label className="form__error">{repository_name.error}</label>}
                    {!ciConfig && selectedRegistry?.registryType === 'ecr' && (
                        <label className="form__error form__error--info">
                            New repository will be created if not provided
                        </label>
                    )}
                </div>
            </div>
            {!configOverrideView && (
                <InfoColourBar
                    classname="info_bar"
                    Icon={InfoIcon}
                    iconClass="icon-dim-20"
                    {...getInfoColourBarProps()}
                />
            )}
        </div>
    )
}
