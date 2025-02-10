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

import React, { useState, useEffect } from 'react'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { getGitProviderIcon, sortObjectArrayAlphabetically } from '../common'
import { getDockerRegistryMinAuth } from './service'
import { getSourceConfig, getCIConfig } from '../../services/service'
import { ComponentStates } from '../../Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { CIConfigProps, MaterialOptionType } from './types'
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
    loadingStateFromParent,
    setLoadingStateFromParent,
    isTemplateView,
}: CIConfigProps) {
    const [dockerRegistries, setDockerRegistries] = useState(parentState?.dockerRegistries)
    const [sourceConfig, setSourceConfig] = useState(parentState?.sourceConfig)
    const [ciConfig, setCIConfig] = useState(parentState?.ciConfig)
    const [parentReloading, setParentReloading] = useState(false)
    const [loading, setLoading] = useState(
        !(configOverrideView && parentState?.loadingState === ComponentStates.loaded),
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
            const [{ result: dockerRegistries }, { result: sourceConfig }, { result: ciConfig }] = await Promise.all([
                getDockerRegistryMinAuth(appId),
                getSourceConfig(appId, null, isTemplateView),
                getCIConfig(+appId, isTemplateView),
            ])
            Array.isArray(dockerRegistries) && sortObjectArrayAlphabetically(dockerRegistries, 'id')
            setDockerRegistries(dockerRegistries || [])
            sourceConfig &&
                Array.isArray(sourceConfig.material) &&
                sortObjectArrayAlphabetically(sourceConfig.material, 'name')
                const _sourceConfig = { ...sourceConfig }
                const sourceConfigMaterial = sourceConfig.material?.map((material: MaterialOptionType) => {
                    return {
                        ...material,
                        label: material?.name || '',
                        value: material?.id || '',
                        startIcon: getGitProviderIcon(material.url) || '',
                    }
                })
                _sourceConfig.material = sourceConfigMaterial
                setSourceConfig(_sourceConfig)
            setCIConfig(ciConfig)

            if (setParentState) {
                setParentState({
                    loadingState: ComponentStates.loaded,
                    selectedCIPipeline: parentState.selectedCIPipeline,
                    dockerRegistries,
                    sourceConfig,
                    ciConfig,
                    defaultDockerConfigs: {
                        dockerRegistry: ciConfig.dockerRegistry,
                        dockerRepository: ciConfig.dockerRepository,
                        ciBuildConfig: ciConfig.ciBuildConfig,
                    },
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

    async function reload(skipPageReload?: boolean, redirection: boolean = false) {
        try {
            updateLoadingState(true, skipPageReload)
            const { result } = await getCIConfig(+appId)
            setCIConfig(result)

            if (!skipPageReload) {
                respondOnSuccess(redirection)
            }
        } catch (err) {
            showError(err)
        } finally {
            updateLoadingState(false, skipPageReload)
        }
    }

    if (loading) {
        return (
            <Progressing
                size={configOverrideView ? 24 : 48}
                styles={{
                    marginTop: configOverrideView ? '24px' : '0',
                }}
            />
        )
    }
    if (!sourceConfig || !Array.isArray(sourceConfig.material || !Array.isArray(dockerRegistries))) {
        return null
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
            configOverrideView={configOverrideView}
            allowOverride={allowOverride}
            updateDockerConfigOverride={updateDockerConfigOverride}
            isCDPipeline={isCDPipeline}
            isCiPipeline={isCiPipeline}
            parentState={parentState}
            setParentState={setParentState}
            loadingStateFromParent={loadingStateFromParent}
            setLoadingStateFromParent={setLoadingStateFromParent}
            isTemplateView={isTemplateView}
        />
    )
}
