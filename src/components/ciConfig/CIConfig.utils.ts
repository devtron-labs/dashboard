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

import { multiSelectStyles, CIBuildType, DockerConfigOverrideType } from '@devtron-labs/devtron-fe-common-lib'
import { PATTERNS } from '../../config'
import { CiPipelineResult } from '../app/details/triggerView/types'
import { OptionType } from '../app/types'
import { CIPipelineDataType } from '../ciPipeline/types'
import { deepEqual } from '../common'
import { CIBuildArgType, CIConfigDiffType, CurrentMaterialType } from './types'
import { RootBuildContext } from './ciConfigConstant'

export const _multiSelectStyles = {
    ...multiSelectStyles,
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: state.isDisabled ? '1px solid var(--N200)' : state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        backgroundColor: state.isDisabled ? 'var(--N50)' : 'white',
        boxShadow: 'none',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 'auto',
    }),
    menuList: (base) => {
        return {
            ...base,
            position: 'relative',
            paddingBottom: '0px',
            maxHeight: '250px',
        }
    },
}

export const tempMultiSelectStyles = {
    ...multiSelectStyles,
    multiValue: (base, state) => {
        return {
            ...base,
            border: `1px solid var(--N200)`,
            borderRadius: `4px`,
            background: 'white',
            height: '28px',
            marginRight: '8px',
            padding: '2px',
            fontSize: '12px',
        }
    },
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

export const TARGET_PLATFORM_LIST: OptionType[] = [
    { label: 'linux/arm64', value: 'linux/arm64' },
    { label: 'linux/amd64', value: 'linux/amd64' },
    { label: 'linux/arm/v7', value: 'linux/arm/v7' },
]

export const CI_CONFIG_FORM_VALIDATION = {
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
            error: 'Invalid Dockerfile Path',
            regex: PATTERNS.STRING,
        },
    },
    projectPath: {
        required: false,
    },
    registry: {
        required: true,
        validatior: {
            error: 'Registry is required',
            regex: PATTERNS.STRING,
        },
    },
    repository_name: {
        required: false,
    },
    buildContext: {
        required: false,
    },
}

export const getCIConfigFormState = (
    ciConfig: CiPipelineResult,
    selectedCIPipeline: CIPipelineDataType,
    currentMaterial: CurrentMaterialType,
    currentRegistry: any,
) => {
    return {
        // when creating app for the first time,ciConfig will be null as CiPipelineResult will be empty,set the default values
        repository: { value: currentMaterial?.name || '', error: '' },
        dockerfile: {
            value:
                (selectedCIPipeline?.isDockerConfigOverridden
                    ? selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath
                    : ciConfig?.ciBuildConfig?.dockerBuildConfig &&
                      ciConfig.ciBuildConfig.dockerBuildConfig?.dockerfileRelativePath) || 'Dockerfile',
            error: '',
        },
        projectPath: {
            value:
                (selectedCIPipeline?.isDockerConfigOverridden
                    ? selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.buildPackConfig?.projectPath
                    : ciConfig?.ciBuildConfig?.buildPackConfig &&
                      ciConfig.ciBuildConfig.buildPackConfig?.projectPath) || '',
            error: '',
        },
        registry: { value: currentRegistry?.id, error: '' },
        repository_name: {
            value: selectedCIPipeline?.isDockerConfigOverridden
                ? selectedCIPipeline.dockerConfigOverride?.dockerRepository
                : ciConfig
                  ? ciConfig.dockerRepository
                  : '',
            error: '',
        },
        buildContext: {
            value: selectedCIPipeline?.isDockerConfigOverridden
                ? selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.buildContext
                : ciConfig?.ciBuildConfig?.dockerBuildConfig && ciConfig.ciBuildConfig.dockerBuildConfig?.buildContext,
            error: '',
        },
        useRootBuildContext: {
            value: selectedCIPipeline?.isDockerConfigOverridden
                ? selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.useRootBuildContext
                : ciConfig?.ciBuildConfig
                  ? ciConfig.ciBuildConfig.useRootBuildContext
                  : true,
            error: '',
        },
    }
}

export const initCurrentCIBuildConfig = (
    allowOverride: boolean,
    ciConfig: CiPipelineResult,
    selectedCIPipeline: CIPipelineDataType,
    selectedMaterial: any,
    selectedBuildContextGitMaterial: any,
    dockerfileValue: string,
    buildContextValue: string,
    useRootBuildContext: boolean,
) => {
    if (
        allowOverride &&
        selectedCIPipeline?.isDockerConfigOverridden &&
        selectedCIPipeline.dockerConfigOverride?.ciBuildConfig
    ) {
        return {
            buildPackConfig: selectedCIPipeline.dockerConfigOverride.ciBuildConfig.buildPackConfig,
            ciBuildType:
                selectedCIPipeline.dockerConfigOverride.ciBuildConfig.ciBuildType ||
                CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
            dockerBuildConfig: selectedCIPipeline.dockerConfigOverride.ciBuildConfig.dockerBuildConfig || {
                dockerfileRelativePath: dockerfileValue.replace(/^\//, ''),
                dockerfileContent: '',
                buildContext: buildContextValue,
            },
            gitMaterialId: selectedMaterial?.value,
            buildContextGitMaterialId: selectedBuildContextGitMaterial?.id,
            useRootBuildContext,
        }
    }
    if (ciConfig?.ciBuildConfig) {
        return {
            buildPackConfig: ciConfig.ciBuildConfig.buildPackConfig,
            ciBuildType: ciConfig.ciBuildConfig.ciBuildType || CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
            dockerBuildConfig: ciConfig.ciBuildConfig.dockerBuildConfig || {
                dockerfileRelativePath: dockerfileValue.replace(/^\//, ''),
                dockerfileContent: '',
                buildContext: buildContextValue,
            },
            gitMaterialId: selectedMaterial?.value,
            buildContextGitMaterialId: selectedBuildContextGitMaterial?.id,
            useRootBuildContext,
        }
    }
    return {
        buildPackConfig: null,
        ciBuildType: CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
        dockerBuildConfig: {
            dockerfileRelativePath: dockerfileValue.replace(/^\//, ''),
            dockerfileContent: '',
            buildContext: buildContextValue,
        },
        gitMaterialId: selectedMaterial?.value,
        buildContextGitMaterialId: selectedBuildContextGitMaterial?.id,
        useRootBuildContext,
    }
}

export const processBuildArgs = (args: Record<string, string>): CIBuildArgType[] => {
    const processedArgs = args
        ? Object.keys(args).map((arg) => ({
              k: arg,
              v: args[arg],
              keyError: '',
              valueError: '',
          }))
        : []

    if (processedArgs.length === 0) {
        processedArgs.push({ k: '', v: '', keyError: '', valueError: '' })
    }

    return processedArgs
}

export const getTargetPlatformMap = (): Map<string, boolean> => {
    const targetPlatformMap = new Map<string, boolean>()

    for (const targetPlatform of TARGET_PLATFORM_LIST) {
        targetPlatformMap.set(targetPlatform.value, true)
    }
    return targetPlatformMap
}

export const CI_BUILDTYPE_ALIAS = {
    [CIBuildType.SELF_DOCKERFILE_BUILD_TYPE]: 'using dockerfile',
    [CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE]: 'using customized dockerfile',
    [CIBuildType.BUILDPACK_BUILD_TYPE]: 'without dockerfile',
}

const getDefaultDiffValues = (
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
    globalCIBuildType: CIBuildType,
    ciBuildTypeOverride: CIBuildType,
): CIConfigDiffType[] => {
    return [
        {
            configName: 'Container Registry',
            changeBGColor: globalCIConfig.dockerRegistry !== ciConfigOverride?.dockerRegistry,
            baseValue: globalCIConfig.dockerRegistry,
            overridenValue: ciConfigOverride?.dockerRegistry,
        },
        {
            configName: 'Container Repository',
            changeBGColor: globalCIConfig.dockerRepository !== ciConfigOverride?.dockerRepository,
            baseValue: globalCIConfig.dockerRepository,
            overridenValue: ciConfigOverride?.dockerRepository,
        },
        {
            configName: 'Build the container image',
            changeBGColor: globalCIBuildType !== ciBuildTypeOverride,
            baseValue: CI_BUILDTYPE_ALIAS[globalCIBuildType],
            overridenValue: CI_BUILDTYPE_ALIAS[ciBuildTypeOverride],
        },
    ]
}

const updateSelfDockerfileDiffValues = (
    ciConfigDiffValues: CIConfigDiffType[],
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
    globalGitMaterialName: string,
    currentMaterialName: string,
    globalCIBuildType: CIBuildType,
    ciBuildTypeOverride: CIBuildType,
): void => {
    if (
        globalCIBuildType === CIBuildType.SELF_DOCKERFILE_BUILD_TYPE ||
        ciBuildTypeOverride === CIBuildType.SELF_DOCKERFILE_BUILD_TYPE
    ) {
        ciConfigDiffValues.push({
            configName: 'Git Repository',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.gitMaterialId !== ciConfigOverride?.ciBuildConfig?.gitMaterialId,
            baseValue: globalGitMaterialName,
            overridenValue: currentMaterialName,
        })
        ciConfigDiffValues.push({
            configName: 'Dockerfile Path',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath !==
                ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath,
            baseValue: globalCIConfig.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath,
            overridenValue: ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath,
        })
    }
}

const updateCreateDockerfileDiffValues = (
    ciConfigDiffValues: CIConfigDiffType[],
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
    globalCIBuildType: CIBuildType,
    ciBuildTypeOverride: CIBuildType,
): void => {
    if (
        globalCIBuildType === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE ||
        ciBuildTypeOverride === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE
    ) {
        ciConfigDiffValues.push({
            configName: 'Dockerfile Language',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.dockerBuildConfig?.language !==
                ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.language,
            baseValue: globalCIConfig.ciBuildConfig?.dockerBuildConfig?.language,
            overridenValue: ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.language,
        })
        ciConfigDiffValues.push({
            configName: 'Framework',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.dockerBuildConfig?.languageFramework !==
                ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.languageFramework,
            baseValue: globalCIConfig.ciBuildConfig?.dockerBuildConfig?.languageFramework,
            overridenValue: ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.languageFramework,
        })
        ciConfigDiffValues.push({
            configName: 'Dockerfile',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.dockerBuildConfig?.dockerfileContent !==
                ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileContent,
            baseValue: globalCIConfig.ciBuildConfig?.dockerBuildConfig?.dockerfileContent,
            overridenValue: ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileContent,
            showInEditor: true,
        })
    }
}

export const getAbsoluteProjectPath = (projectPath: string): string => {
    if (projectPath) {
        return projectPath.startsWith('./') ? projectPath : `./${projectPath}`
    }
    return './'
}

const updateBuildpackDiffValues = (
    ciConfigDiffValues: CIConfigDiffType[],
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
    globalGitMaterialName: string,
    currentMaterialName: string,
    globalCIBuildType: CIBuildType,
    ciBuildTypeOverride: CIBuildType,
): void => {
    if (
        globalCIBuildType === CIBuildType.BUILDPACK_BUILD_TYPE ||
        ciBuildTypeOverride === CIBuildType.BUILDPACK_BUILD_TYPE
    ) {
        ciConfigDiffValues.push({
            configName: 'Git Repository',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.gitMaterialId !== ciConfigOverride?.ciBuildConfig?.gitMaterialId,
            baseValue: globalGitMaterialName,
            overridenValue: currentMaterialName,
        })

        const baseProjectPath = getAbsoluteProjectPath(globalCIConfig.ciBuildConfig?.buildPackConfig?.projectPath)
        const overridenProjectPath = getAbsoluteProjectPath(
            ciConfigOverride.ciBuildConfig?.buildPackConfig?.projectPath,
        )
        ciConfigDiffValues.push({
            configName: 'Project Path',
            changeBGColor: baseProjectPath !== overridenProjectPath,
            baseValue: baseProjectPath,
            overridenValue: overridenProjectPath,
        })
        ciConfigDiffValues.push({
            configName: 'Builder Language',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.buildPackConfig?.language !==
                ciConfigOverride?.ciBuildConfig?.buildPackConfig?.language,
            baseValue: globalCIConfig.ciBuildConfig?.buildPackConfig?.language,
            overridenValue: ciConfigOverride?.ciBuildConfig?.buildPackConfig?.language,
        })
        ciConfigDiffValues.push({
            configName: 'Version',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.buildPackConfig?.languageVersion !==
                ciConfigOverride?.ciBuildConfig?.buildPackConfig?.languageVersion,
            baseValue: globalCIConfig.ciBuildConfig?.buildPackConfig?.languageVersion,
            overridenValue: ciConfigOverride?.ciBuildConfig?.buildPackConfig?.languageVersion,
        })
        ciConfigDiffValues.push({
            configName: 'Builder',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.buildPackConfig?.builderId !==
                ciConfigOverride?.ciBuildConfig?.buildPackConfig?.builderId,
            baseValue: globalCIConfig.ciBuildConfig?.buildPackConfig?.builderId,
            overridenValue: ciConfigOverride?.ciBuildConfig?.buildPackConfig?.builderId,
        })
    }
}

export const getCIConfigDiffValues = (
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
    materials,
    gitMaterials,
): CIConfigDiffType[] => {
    const globalCIBuildType = globalCIConfig.ciBuildConfig?.ciBuildType
    const ciBuildTypeOverride = ciConfigOverride?.ciBuildConfig?.ciBuildType
    let globalGitMaterialName
    let currentMaterialName
    let globalBuildContextGitMaterialItem
    let currentBuildContextGitMaterialItem
    let globalBuildContext = globalCIConfig.ciBuildConfig?.dockerBuildConfig?.buildContext
    let currentBuildContext = ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.buildContext
    const globalUseRootBuildContext = globalCIConfig.ciBuildConfig
        ? globalCIConfig.ciBuildConfig.useRootBuildContext
        : true
    const currentUseRootBuildContext = ciConfigOverride?.ciBuildConfig
        ? ciConfigOverride?.ciBuildConfig.useRootBuildContext
        : true
    globalBuildContext = globalBuildContext || ''
    currentBuildContext = currentBuildContext || ''
    if (
        globalCIBuildType !== CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE ||
        ciBuildTypeOverride !== CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE
    ) {
        if (materials) {
            for (const gitMaterial of materials) {
                if (gitMaterial.gitMaterialId === globalCIConfig.ciBuildConfig?.gitMaterialId) {
                    globalGitMaterialName = gitMaterial.materialName
                }

                if (gitMaterial.gitMaterialId === ciConfigOverride?.ciBuildConfig?.gitMaterialId) {
                    currentMaterialName = gitMaterial.materialName
                }
            }
        }

        if (window._env_.ENABLE_BUILD_CONTEXT && gitMaterials) {
            for (const gitMaterial of gitMaterials) {
                if (gitMaterial.id === globalCIConfig.ciBuildConfig?.buildContextGitMaterialId) {
                    globalBuildContextGitMaterialItem = gitMaterial
                }

                if (gitMaterial.id === ciConfigOverride?.ciBuildConfig?.buildContextGitMaterialId) {
                    currentBuildContextGitMaterialItem = gitMaterial
                }
            }
        }
    }

    const ciConfigDiffValues: CIConfigDiffType[] = getDefaultDiffValues(
        globalCIConfig,
        ciConfigOverride,
        globalCIBuildType,
        ciBuildTypeOverride,
    )

    // Update ciConfigDiffValues further with Self-managed Dockerfile diff values
    // if ciBuildType is SELF_DOCKERFILE_BUILD_TYPE
    updateSelfDockerfileDiffValues(
        ciConfigDiffValues,
        globalCIConfig,
        ciConfigOverride,
        globalGitMaterialName,
        currentMaterialName,
        globalCIBuildType,
        ciBuildTypeOverride,
    )

    // Update ciConfigDiffValues further with Buildpack diff values
    // if ciBuildType is BUILDPACK_BUILD_TYPE
    updateBuildpackDiffValues(
        ciConfigDiffValues,
        globalCIConfig,
        ciConfigOverride,
        globalGitMaterialName,
        currentMaterialName,
        globalCIBuildType,
        ciBuildTypeOverride,
    )

    // Update ciConfigDiffValues further with Create/Managed Dockerfile diff values
    // if ciBuildType is MANAGED_DOCKERFILE_BUILD_TYPE
    updateCreateDockerfileDiffValues(
        ciConfigDiffValues,
        globalCIConfig,
        ciConfigOverride,
        globalCIBuildType,
        ciBuildTypeOverride,
    )
    ciConfigDiffValues.push({
        configName: 'Target platform for build',
        changeBGColor: getTargetPlatformChangeBGColor(globalCIConfig, ciConfigOverride),
        baseValue: globalCIConfig.ciBuildConfig?.dockerBuildConfig?.targetPlatform,
        overridenValue: ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform,
    })
    if (
        window._env_.ENABLE_BUILD_CONTEXT &&
        globalCIBuildType !== CIBuildType.BUILDPACK_BUILD_TYPE &&
        ciBuildTypeOverride !== CIBuildType.BUILDPACK_BUILD_TYPE
    ) {
        ciConfigDiffValues.push(
            {
                configName: 'Repo containing build context',
                changeBGColor:
                    globalCIConfig.ciBuildConfig?.buildContextGitMaterialId !==
                    ciConfigOverride?.ciBuildConfig?.buildContextGitMaterialId,
                baseValue: globalBuildContextGitMaterialItem?.name,
                overridenValue: currentBuildContextGitMaterialItem?.name,
            },
            {
                configName: 'Build context',
                changeBGColor:
                    (globalUseRootBuildContext
                        ? RootBuildContext
                        : globalBuildContextGitMaterialItem?.checkoutPath + globalBuildContext) !==
                    (currentUseRootBuildContext
                        ? RootBuildContext
                        : currentBuildContextGitMaterialItem?.checkoutPath + currentBuildContext),
                baseValue: globalUseRootBuildContext
                    ? RootBuildContext
                    : globalBuildContextGitMaterialItem?.checkoutPath + globalBuildContext,
                overridenValue: currentUseRootBuildContext
                    ? RootBuildContext
                    : currentBuildContextGitMaterialItem?.checkoutPath + currentBuildContext,
            },
        )
    }
    return ciConfigDiffValues
}

const getTargetPlatformChangeBGColor = (
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
): boolean => {
    const globalTargetPlatforms = globalCIConfig.ciBuildConfig?.dockerBuildConfig?.targetPlatform?.split(',')
    const overridenTargetPlatforms = ciConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform?.split(',')
    return !deepEqual(globalTargetPlatforms, overridenTargetPlatforms)
}
