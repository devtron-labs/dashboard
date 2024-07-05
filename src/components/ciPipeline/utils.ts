import { DockerConfigOverrideType } from '@devtron-labs/devtron-fe-common-lib'

export const getDockerConfigOverrideData = (
    dockerConfigOverride: DockerConfigOverrideType,
): DockerConfigOverrideType => {
    const updatedConfig = structuredClone(dockerConfigOverride)

    delete updatedConfig?.ciBuildConfig?.dockerBuildConfig?.args

    return updatedConfig
}
