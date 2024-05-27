import React from 'react'
import { GitProvider, GitProviderTabIconsProps } from './gitops.type'
import { ReactComponent as Bitbucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as ICAwsCodeCommit } from '../../assets/icons/ic-aws-codecommit.svg'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as Azure } from '../../assets/icons/ic-azure.svg'
import { ReactComponent as ICGit } from '../../assets/icons/git/git.svg'

const GitProviderTabIcons = ({ provider, rootClassName }: GitProviderTabIconsProps) => {
    switch (provider) {
        case GitProvider.GITHUB:
            return <GitHub className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.GITLAB:
            return <GitLab className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.AZURE_DEVOPS:
            return <Azure className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.BITBUCKET_CLOUD:
            return <Bitbucket className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.AWS_CODE_COMMIT:
            return <ICAwsCodeCommit className={`${rootClassName || ''} dc__no-shrink`} />
        default:
            return <ICGit className={`${rootClassName || ''} dc__no-shrink`} />
    }
}

export default GitProviderTabIcons
