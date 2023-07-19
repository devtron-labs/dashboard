import React, { useState, useEffect } from 'react'
import { sortObjectArrayAlphabetically } from '../common'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { getDockerRegistryMinAuth } from './service'
import { getSourceConfig, getCIConfig, getConfigOverrideWorkflowDetails, getEnvironmentData } from '../../services/service'
import { useParams } from 'react-router-dom'
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type'
import { CIConfigProps } from './types'
import { ConfigOverrideWorkflowDetails } from '../../services/service.types'
import { _multiSelectStyles } from './CIConfig.utils'
import './CIConfig.scss'
import CIConfigForm from './CIConfigForm'

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
    const [isAirgapped,setIsAirGapped] = useState(false)

    useEffect(() => {
        
        if (!configOverrideView || parentState?.loadingState !== ComponentStates.loaded) {
            getAirGapEnvironmentValue()
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
    async function getAirGapEnvironmentValue() {
        setLoading(true)
        try {
            const {result} = await getEnvironmentData()
            setIsAirGapped(result.isAirGapEnvironment)
          
        } catch (err) {
            setIsAirGapped(false)
        } finally {
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
            isAirGapped={isAirgapped}
        />
    )
}
