import { GitProvider } from './constants'

export const getProviderNameFromEnum = (provider: GitProvider, enableBitBucketSource?: boolean) => {
    switch (provider) {
        case GitProvider.GITHUB:
            return 'GitHub'
        case GitProvider.GITLAB:
            return 'GitLab'
        case GitProvider.AZURE_DEVOPS:
            return 'Azure'
        case GitProvider.BITBUCKET_CLOUD:
            return enableBitBucketSource ? 'Bitbucket' : 'Bitbucket Cloud'
        case GitProvider.AWS_CODE_COMMIT:
            return 'AWS Code Commit'
        default:
            return 'Other GitOps'
    }
}
