/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
    ComponentSizeType,
    CustomInput,
    InfoColourBar,
    REGISTRY_TYPE_MAP,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ArrowIcon } from '../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { Routes, URLS } from '../../config'
import { _multiSelectStyles } from './CIConfig.utils'
import { CIContainerRegistryConfigProps } from './types'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'

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
    isCreateAppView,
}: CIContainerRegistryConfigProps) {
    const [selectedRegistry, setSelectedRegistry] = useState(currentRegistry)

    const getCustomRegistryOption = (registry) => ({
        ...registry,
        label: registry.id,
        value: registry.id,
        startIcon: <div className={`dc__registry-icon dc__no-shrink ${registry.registryType}`} />,
    })

    const getContainerRegistryOptions = () => dockerRegistries.map(getCustomRegistryOption)

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
                        <span className="mr-4">This configuration is overridden for build pipeline of</span>
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
                        Container registry & docker file location for build pipelines can be overridden.
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

    const renderContainerRegistryMenuList = (): JSX.Element => (
        <NavLink
            to={URLS.GLOBAL_CONFIG_DOCKER}
            className="flex left dc__gap-8 dc__border-top bg__primary px-8 py-10 cb-5 dc__block fw-6 fs-13 lh-20 anchor cursor dc__no-decor dc__hover-n50"
            data-testid="add-container-registry-button"
        >
            <Add className="icon-dim-20 dc__no-shrink fcb-5" />
            <span>Add Container Registry</span>
        </NavLink>
    )

    return (
        <div className={isCreateAppView ? '' : 'white-card white-card__docker-config dc__position-rel mb-12'}>
            {!isCreateAppView && (
                <h3 className="fs-14 fw-6 lh-20 m-0 pb-16" data-testid="store-container-image-heading">
                    Store container image at
                </h3>
            )}
            <div className="mb-4 flexbox dc__gap-16 form-row__docker">
                <div className={`form__field dc__no-shrink w-250 ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    {configOverrideView && !allowOverride ? (
                        <>
                            <label htmlFor="" className="form__label dc__required-field">
                                Container Registry
                            </label>
                            <div className="flex left dc__gap-8">
                                <span className={`dc__registry-icon dc__no-shrink ${currentRegistry?.registryType}`} />
                                <span className="fs-14 fw-4 lh-20 cn-9">{currentRegistry?.id}</span>
                            </div>
                        </>
                    ) : (
                        <SelectPicker
                            classNamePrefix="build-config__select-container-registry"
                            inputId="build-config__select-container-registry"
                            name="build-config__select-container-registry"
                            label="Container Registry"
                            options={getContainerRegistryOptions()}
                            value={selectedRegistry ? getCustomRegistryOption(selectedRegistry) : null}
                            required
                            renderMenuListFooter={configOverrideView ? undefined : renderContainerRegistryMenuList}
                            onChange={handleRegistryChange}
                            size={ComponentSizeType.large}
                        />
                    )}
                    {registry.error && <label className="form__error">{registry.error}</label>}
                </div>
                <div className={`form__field flex-grow-1 ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label htmlFor="" className="form__label">
                        Container Repository&nbsp;
                        {selectedRegistry && REGISTRY_TYPE_MAP[selectedRegistry.registryType]?.desiredFormat}
                    </label>
                    {configOverrideView && !allowOverride ? (
                        <span className="fs-14 fw-4 lh-20 cn-9">{ciConfig?.dockerRepository}</span>
                    ) : (
                        <CustomInput
                            tabIndex={2}
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
                            disabled={configOverrideView && !allowOverride}
                            data-testid="container-repository-textbox"
                            error={repository_name.error}
                            rootClassName="h-36"
                        />
                    )}
                    {!ciConfig && selectedRegistry?.registryType === 'ecr' && (
                        <label className="form__error form__error--info">
                            New repository will be created if not provided
                        </label>
                    )}
                </div>
            </div>
            {!isCreateAppView && !configOverrideView && (
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
