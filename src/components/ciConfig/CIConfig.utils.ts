import { PATTERNS } from '../../config'
import { CiPipelineResult } from '../app/details/triggerView/types'
import { OptionType } from '../app/types'
import { CIBuildType, CIPipelineDataType, DockerConfigOverrideType } from '../ciPipeline/types'
import { multiSelectStyles } from '../common'
import { CIConfigDiffType } from './types'

export const _multiSelectStyles = {
    ...multiSelectStyles,
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: state.isDisabled ? '1px solid var(--N200)' : state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
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
            error: 'Dockerfile is required',
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
}

export const getCIConfigFormState = (
    ciConfig: CiPipelineResult,
    selectedCIPipeline: CIPipelineDataType,
    _selectedMaterial: any,
    _selectedRegistry: any,
) => {
    return {
        repository: { value: _selectedMaterial?.name || '', error: '' },
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
        registry: { value: _selectedRegistry?.id, error: '' },
        repository_name: {
            value: selectedCIPipeline?.isDockerConfigOverridden
                ? selectedCIPipeline.dockerConfigOverride?.dockerRepository
                : ciConfig
                ? ciConfig.dockerRepository
                : '',
            error: '',
        },
    }
}

export const initCurrentCIBuildConfig = (
    allowOverride: boolean,
    ciConfig: CiPipelineResult,
    selectedCIPipeline: CIPipelineDataType,
    selectedMaterial: any,
    dockerfileValue: string,
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
            },
            gitMaterialId: selectedMaterial?.id,
        }
    } else if (ciConfig?.ciBuildConfig) {
        return {
            buildPackConfig: ciConfig.ciBuildConfig.buildPackConfig,
            ciBuildType: ciConfig.ciBuildConfig.ciBuildType || CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
            dockerBuildConfig: ciConfig.ciBuildConfig.dockerBuildConfig || {
                dockerfileRelativePath: dockerfileValue.replace(/^\//, ''),
                dockerfileContent: '',
            },
            gitMaterialId: selectedMaterial?.id,
        }
    } else {
        return {
            buildPackConfig: null,
            ciBuildType: CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
            dockerBuildConfig: {
                dockerfileRelativePath: dockerfileValue.replace(/^\//, ''),
                dockerfileContent: '',
            },
            gitMaterialId: selectedMaterial?.id,
        }
    }
}

export const processBuildArgs = (
    args: Map<string, string>,
): {
    k: string
    v: string
    keyError: string
    valueError: string
}[] => {
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

const CI_BUILD_TYPE_ALIAS = {
    [CIBuildType.SELF_DOCKERFILE_BUILD_TYPE]: 'Using Dockerfile',
    [CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE]: 'Creating Dockerfile',
    [CIBuildType.BUILDPACK_BUILD_TYPE]: 'Without Dockerfile',
}

const getDefaultDiffValues = (
    globalCIConfig: DockerConfigOverrideType,
    ciConfigOverride: DockerConfigOverrideType,
    globalCIBuildType: CIBuildType,
    ciBuildTypeOverride: CIBuildType,
): CIConfigDiffType[] => {
    return [
        {
            configName: 'Container registry',
            changeBGColor: globalCIConfig.dockerRegistry !== ciConfigOverride?.dockerRegistry,
            baseValue: globalCIConfig.dockerRegistry,
            overridenValue: ciConfigOverride?.dockerRegistry,
        },
        {
            configName: 'Container repository',
            changeBGColor: globalCIConfig.dockerRepository !== ciConfigOverride?.dockerRepository,
            baseValue: globalCIConfig.dockerRepository,
            overridenValue: ciConfigOverride?.dockerRepository,
        },
        {
            configName: 'Build the container image',
            changeBGColor: globalCIBuildType !== ciBuildTypeOverride,
            baseValue: CI_BUILD_TYPE_ALIAS[globalCIBuildType],
            overridenValue: CI_BUILD_TYPE_ALIAS[ciBuildTypeOverride],
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
            configName: 'Git repository',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.gitMaterialId !== ciConfigOverride?.ciBuildConfig?.gitMaterialId,
            baseValue: globalGitMaterialName,
            overridenValue: currentMaterialName,
        })
        ciConfigDiffValues.push({
            configName: 'Dockerfile path',
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
            configName: 'Dockerfile language',
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
            configName: 'Git repository',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.gitMaterialId !== ciConfigOverride?.ciBuildConfig?.gitMaterialId,
            baseValue: globalGitMaterialName,
            overridenValue: currentMaterialName,
        })
        ciConfigDiffValues.push({
            configName: 'Project path',
            changeBGColor:
                globalCIConfig.ciBuildConfig?.buildPackConfig?.projectPath !==
                ciConfigOverride.ciBuildConfig?.buildPackConfig?.projectPath,
            baseValue: globalCIConfig.ciBuildConfig?.buildPackConfig?.projectPath,
            overridenValue: ciConfigOverride.ciBuildConfig?.buildPackConfig?.projectPath,
        })
        ciConfigDiffValues.push({
            configName: 'Builder language',
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
): CIConfigDiffType[] => {
    const globalCIBuildType = globalCIConfig.ciBuildConfig?.ciBuildType
    const ciBuildTypeOverride = ciConfigOverride?.ciBuildConfig?.ciBuildType
    let globalGitMaterialName, currentMaterialName
    if (
        materials &&
        (globalCIBuildType !== CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE ||
            ciBuildTypeOverride !== CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE)
    ) {
        for (const gitMaterial of materials) {
            if (gitMaterial.gitMaterialId === globalCIConfig.ciBuildConfig?.gitMaterialId) {
                globalGitMaterialName = gitMaterial.materialName
            }

            if (gitMaterial.gitMaterialId === ciConfigOverride?.ciBuildConfig?.gitMaterialId) {
                currentMaterialName = gitMaterial.materialName
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

    return ciConfigDiffValues
}
