export const getEnvironmentName = (
    clusterName: string,
    namespace: string,
    environmentName: string,
): string | JSX.Element => {
    if (environmentName) {
        return environmentName
    }
    if (clusterName && namespace) {
        return `${clusterName}__${namespace}`
    }
    return <span>&nbsp;</span>
}
