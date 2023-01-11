
export enum GitProvider {
    GITLAB = 'GITLAB',
    GITHUB = 'GITHUB',
    AZURE_DEVOPS = 'AZURE_DEVOPS',
    BITBUCKET_CLOUD = 'BITBUCKET_CLOUD'
};

export const GitHost = {
    GITHUB: "https://github.com/",
    GITLAB: "https://gitlab.com/",
    AZURE_DEVOPS: 'https://dev.azure.com/',
    BITBUCKET_CLOUD: "https://bitbucket.org/"
}

export const ShortGitHosts = ['github.com', 'gitlab.com', 'dev.azure.com', 'bitbucket.org']

export const GitLink = {
    GITHUB: "https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch",
    GITLAB: "https://docs.gitlab.com/ee/user/group/#create-a-group",
    AZURE_DEVOPS: 'https://docs.microsoft.com/en-us/azure/devops/organizations/projects/create-project?view=azure-devops&tabs=preview-page#create-a-project',
    BITBUCKET_WORKSPACE: 'https://support.atlassian.com/bitbucket-cloud/docs/create-your-workspace/',
    BITBUCKET_PROJECT: 'https://support.atlassian.com/bitbucket-cloud/docs/group-repositories-into-projects/'
}

export const DefaultGitOpsConfig = {
    id: undefined,
    provider: GitProvider.GITHUB,
    active: true,
}


export const DefaultShortGitOps = {
    host: '',
    username: '',
    token: '',
    gitHubOrgId: '',
    gitLabGroupId: '',
    azureProjectName: '',
    bitBucketWorkspaceId: '',
    bitBucketProjectKey: '',
}

export const LinkAndLabelSpec = new Map()
LinkAndLabelSpec.set(GitProvider.GITHUB, {
    link: GitLink.GITHUB,
    linkText: '(How to create organization in GitHub?)',
    label: 'GitHub Organisation Name*',
})
LinkAndLabelSpec.set(GitProvider.GITLAB, {
    link: GitLink.GITLAB,
    linkText: '(How to create group in GitLab?)',
    label: 'GitLab Group ID*',
})
LinkAndLabelSpec.set(GitProvider.AZURE_DEVOPS, {
    link: GitLink.AZURE_DEVOPS,
    linkText: '(How to create project in Azure?)',
    label: 'Azure DevOps Project Name*',
})
LinkAndLabelSpec.set(GitProvider.BITBUCKET_CLOUD, {
    link: GitLink.BITBUCKET_PROJECT,
    linkText: '(How to create project in bitbucket?)',
    label: 'Bitbucket Project Key',
})