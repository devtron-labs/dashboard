import { PATTERNS } from '../../config'
import { CiPipelineResult } from '../app/details/triggerView/types'
import { OptionType } from '../app/types'
import { CIBuildType, CIPipelineDataType } from '../ciPipeline/types'
import { multiSelectStyles } from '../common'

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
