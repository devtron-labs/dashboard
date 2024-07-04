export const getDockerConfigOverrideData = (dockerConfigOverride) => {
    const updatedConfig = structuredClone(dockerConfigOverride)

    delete updatedConfig?.ciBuildConfig?.dockerBuildConfig?.args

    return updatedConfig
}
