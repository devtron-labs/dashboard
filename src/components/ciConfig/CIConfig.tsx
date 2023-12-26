import React, { useState, useEffect } from 'react'
import { sortObjectArrayAlphabetically } from '../common'
import { showError, Progressing, REGISTRY_TYPE_MAP, CIBuildType } from '@devtron-labs/devtron-fe-common-lib'
import { getDockerRegistryMinAuth } from './service'
import { getSourceConfig, getCIConfig, getConfigOverrideWorkflowDetails } from '../../services/service'
import { useParams } from 'react-router-dom'
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'
import { CIConfigProps } from './types'
import { ConfigOverrideWorkflowDetails } from '../../services/service.types'
import { CI_BUILDTYPE_ALIAS } from './CIConfig.utils'
import './CIConfig.scss'
import CIConfigForm from './CIConfigForm'

// FIXME: Here the error state is not gracefully handled, we are only showing toast and hiding corresponsing component.
export default function CIConfig({
    respondOnSuccess,
    configOverrideView,
    allowOverride,
    parentState,
    setParentState,
    updateDockerConfigOverride,
    isCDPipeline,
    isCiPipeline,
    navItems,
    loadingStateFromParent,
    setLoadingStateFromParent,
}: CIConfigProps) {
    const [dockerRegistries, setDockerRegistries] = useState(parentState?.dockerRegistries)
    const [sourceConfig, setSourceConfig] = useState(parentState?.sourceConfig)
    const [ciConfig, setCIConfig] = useState(parentState?.ciConfig)
    const [configOverrideWorkflows, setConfigOverrideWorkflows] = useState<ConfigOverrideWorkflowDetails[]>([])
    const [parentReloading, setParentReloading] = useState(false)
    const [loading, setLoading] = useState(
        configOverrideView && parentState?.loadingState === ComponentStates.loaded ? false : true,
    )
    const { appId } = useParams<{ appId: string }>()

    useEffect(() => {
        if (!configOverrideView || parentState?.loadingState !== ComponentStates.loaded) {
            initialise()
        }
    }, [])

    async function initialise() {
        try {
            setLoading(true)
            const [
                { result: dockerRegistries },
                { result: sourceConfig },
                { result: ciConfig },
                { result: configOverrideWorkflows },
            ] = await Promise.all([
                getDockerRegistryMinAuth(appId),
                getSourceConfig(appId),
                getCIConfig(+appId),
                getConfigOverrideWorkflowDetails(appId),
            ])
            Array.isArray(dockerRegistries) && sortObjectArrayAlphabetically(dockerRegistries, 'id')
            setDockerRegistries(dockerRegistries || [])
            sourceConfig &&
                Array.isArray(sourceConfig.material) &&
                sortObjectArrayAlphabetically(sourceConfig.material, 'name')
            setSourceConfig(sourceConfig)
            setCIConfig(ciConfig)
            setConfigOverrideWorkflows(configOverrideWorkflows?.workflows || [])

            if (setParentState) {
                setParentState({
                    loadingState: ComponentStates.loaded,
                    selectedCIPipeline: parentState.selectedCIPipeline,
                    dockerRegistries: dockerRegistries,
                    sourceConfig: sourceConfig,
                    ciConfig: ciConfig,
                    defaultDockerConfigs: Object.assign(
                        {},
                        {
                            dockerRegistry: ciConfig.dockerRegistry,
                            dockerRepository: ciConfig.dockerRepository,
                            ciBuildConfig: ciConfig.ciBuildConfig,
                        },
                    ),
                })
            }
        } catch (err) {
            showError(err)
            if (setParentState) {
                setParentState({
                    ...parentState,
                    loadingState: ComponentStates.failed,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    function updateLoadingState(isLoading: boolean, skipPageReload: boolean) {
        if (!skipPageReload) {
            setLoading(isLoading)
        } else {
            setParentReloading(isLoading)
        }
    }

    async function reload(skipPageReload?: boolean) {
        try {
            updateLoadingState(true, skipPageReload)
            const { result } = await getCIConfig(+appId)
            setCIConfig(result)

            if (!skipPageReload) {
                respondOnSuccess()
            }
        } catch (err) {
            showError(err)
        } finally {
            updateLoadingState(false, skipPageReload)
        }
    }

    if (loading)
        return (
            <Progressing
                size={configOverrideView ? 24 : 48}
                styles={{
                    marginTop: configOverrideView ? '24px' : '0',
                }}
            />
        )
    if (!sourceConfig || !Array.isArray(sourceConfig.material || !Array.isArray(dockerRegistries))) return null

    // TODO: Would re-visit again after refactoring child render components
    const renderReadOnlyDockerDetails = (currentCIBuildType: CIBuildType) => {
        switch (currentCIBuildType) {
            case CIBuildType.SELF_DOCKERFILE_BUILD_TYPE:
                break

            case CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE:
                break

            case CIBuildType.BUILDPACK_BUILD_TYPE:
                break

            default:
                return null
        }
    }

    // TODO: Would re-visit again after refactoring child render components and separate out the readonly view
    if (configOverrideView && !allowOverride) {
        const globalRegistry = ciConfig?.dockerRegistry
            ? dockerRegistries?.find((reg) => reg.id === ciConfig.dockerRegistry)
            : dockerRegistries?.find((reg) => reg.isDefault)
        const globalCIBuildType = ciConfig?.ciBuildConfig?.ciBuildType ?? CIBuildType.SELF_DOCKERFILE_BUILD_TYPE

        return (
            <div className="form__app-compose config-override-view">
                <div className="white-card white-card__docker-config dc__position-rel mb-12">
                    <h3 className="fs-14 fw-6 lh-20 m-0 pb-16" data-testid="store-container-image-heading">
                        Store container image at
                    </h3>

                    <div className="mb-4 form-row__docker">
                        <div className="form__field mb-0-imp">
                            <label className="form__label">Container Registry</label>

                            <div className="flex left">
                                <span className={`dc__registry-icon mr-8 ${globalRegistry?.registryType}`} />
                                <span className="fs-14 fw-4 lh-20 cn-9">{globalRegistry?.id}</span>
                            </div>
                        </div>

                        <div className="form__field mb-0-imp">
                            <label htmlFor="" className="form__label">
                                Container Repository&nbsp;
                                {globalRegistry && REGISTRY_TYPE_MAP[globalRegistry.registryType]?.desiredFormat}
                            </label>

                            <span className="fs-14 fw-4 lh-20 cn-9">{ciConfig?.dockerRepository}</span>
                        </div>
                    </div>
                </div>

                <div className="white-card white-card__docker-config dc__position-rel">
                    <h3 className="fs-14 fw-6 lh-20 m-0 pb-12">
                        {`Build the container image ${CI_BUILDTYPE_ALIAS[globalCIBuildType]}`}
                    </h3>

                    {renderReadOnlyDockerDetails(globalCIBuildType)}
                </div>
            </div>
        )
    }

    return (
        <CIConfigForm
            parentReloading={parentReloading}
            dockerRegistries={dockerRegistries}
            sourceConfig={sourceConfig}
            ciConfig={ciConfig}
            reload={reload}
            appId={appId}
            selectedCIPipeline={parentState?.selectedCIPipeline}
            configOverrideWorkflows={configOverrideWorkflows}
            configOverrideView={configOverrideView}
            allowOverride={allowOverride}
            updateDockerConfigOverride={updateDockerConfigOverride}
            isCDPipeline={isCDPipeline}
            isCiPipeline={isCiPipeline}
            navItems={navItems}
            parentState={parentState}
            setParentState={setParentState}
            loadingStateFromParent={loadingStateFromParent}
            setLoadingStateFromParent={setLoadingStateFromParent}
        />
    )
}
