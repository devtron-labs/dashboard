import React from 'react'
import { AppOverviewProps } from '../types'
import { ReactComponent as AppIcon } from '../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as JobIcon } from '../../../assets/icons/ic-job-node.svg'
import { ReactComponent as GitLab } from '../../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../../assets/icons/git/bitbucket.svg'
import { DefaultJobNote, DefaultAppNote, DefaultHelmChartNote } from '../list-new/Constants'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'

const {
    OVERVIEW: { APP_DESCRIPTION, JOB_DESCRIPTION },
} = EMPTY_STATE_STATUS

export const getAppConfig = (appType: AppOverviewProps['appType']) => {
    switch (appType) {
        case 'app':
            return {
                resourceName: 'application',
                defaultNote: DefaultAppNote,
                icon: <AppIcon className="icon-dim-48" />,
                defaultDescription: APP_DESCRIPTION,
            }
        case 'job':
            return {
                resourceName: 'job',
                defaultNote: DefaultJobNote,
                icon: <JobIcon className="icon-dim-48 dc__icon-bg-color br-4 p-8" />,
                defaultDescription: JOB_DESCRIPTION,
            }
        case 'helm-chart':
            return {
                resourceName: 'application',
                defaultNote: DefaultHelmChartNote,
                icon: null,
                defaultDescription: APP_DESCRIPTION,
            }
    }
}

export const getGitProviderIcon = (gitUrl: string) => {
    let IconComponent = Git
    if (gitUrl.includes('gitlab')) {
        IconComponent = GitLab
    } else if (gitUrl.includes('github')) {
        IconComponent = GitHub
    } else if (gitUrl.includes('bitbucket')) {
        IconComponent = BitBucket
    }
    return <IconComponent className="icon-dim-20 mw-20" />
}
