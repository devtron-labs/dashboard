import { GitProvider } from './constants'

// Adding BITBUCKET_DC to GitProviderType Avoid adding directly as it will add Tab to GitProviderTab
export type GitProviderType = GitProvider | 'BITBUCKET_DC'

export interface GitProviderTabProps {
    /**
     * Currently selected tab
     */
    providerTab?: GitProviderType
    isTabChecked: boolean
    /**
     * Acts as handleChange on radio tab
     */
    handleGitopsTab: (e) => void
    /**
     * Based on this would showCheck of previous selected on tab
     */
    lastActiveTabName: GitProviderType
    /**
     * Value of tab to be rendered
     */
    provider: GitProvider
    /**
     * If true would disable radio tab
     */
    saveLoading: boolean
    dataTestId: string
}
