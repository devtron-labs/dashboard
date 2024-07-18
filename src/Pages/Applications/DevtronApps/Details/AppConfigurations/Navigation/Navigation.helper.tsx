import { NavLink, generatePath } from 'react-router-dom'

import { ReactComponent as Lock } from '@Icons/ic-locked.svg'
import { ReactComponent as ProtectedIcon } from '@Icons/ic-shield-protect-fill.svg'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ReactComponent as ICEditFile } from '@Icons/ic-edit-file.svg'
import { URLS } from '@Config/routes'
import { CollapsibleListItem } from '@Pages/Shared/CollapsibleList'
import { ResourceConfigStage, ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import { CustomNavItemsType, EnvConfigType, EnvEnvironment, EnvResourceType } from '../appConfig.type'

export const renderNavItem = (item: CustomNavItemsType, isBaseConfigProtected?: boolean) => {
    const linkDataTestName = item.title.toLowerCase().split(' ').join('-')

    return (
        <NavLink
            data-testid={`${linkDataTestName}-link`}
            key={item.title}
            onClick={(event) => {
                if (item.isLocked) {
                    event.preventDefault()
                }
            }}
            className="env-config-nav-item cursor"
            to={item.href}
        >
            <span className="dc__truncate nav-text">{item.title}</span>
            {item.isLocked && (
                <Lock className="icon-dim-20 dc__no-shrink" data-testid={`${linkDataTestName}-lockicon`} />
            )}
            {!item.isLocked && isBaseConfigProtected && item.isProtectionAllowed && (
                <ProtectedIcon className="icon-dim-20 fcv-5" />
            )}
        </NavLink>
    )
}

/**
 * Generates a URL path based on the provided parameters.
 *
 * @param basePath - The base path for the URL.
 * @param params - URL parameters
 * @param resourceType - The type of resource.
 * @param href - An optional href to append to the path.
 * @param paramToCheck -  The parameter to check in the URL.
 * @returns The generated URL path.
 */
export const getNavigationPath = (
    basePath: string,
    params: { appId: string; envId: string; resourceType: string },
    id: number,
    resourceType: EnvResourceType,
    href?: string,
    paramToCheck: 'appId' | 'envId' = 'envId',
) => {
    const additionalPath = href ? `/${href}` : ''
    const isEnvIdChanged = paramToCheck === 'envId'
    const isBaseEnv = id === -1
    const _resourceType = isEnvIdChanged && !isBaseEnv ? URLS.APP_ENV_OVERRIDE_CONFIG : resourceType

    return `${generatePath(basePath, {
        ...params,
        resourceType: _resourceType,
        [paramToCheck]: id !== -1 ? id : undefined,
    })}${isEnvIdChanged && !isBaseEnv ? `/${resourceType}${additionalPath}` : `${additionalPath}`}`
}

/**
 * Returns an object containing the appropriate icon, icon properties and tooltip properties based on the resource configuration state.
 *
 * @param configState - The state of the resource configuration.
 * @returns An object containing the icon, props and tooltipProps if conditions are met, otherwise undefined.
 */
const getIcon = (
    configState: ResourceConfigState,
    isProtected: boolean,
): CollapsibleListItem['iconConfig'] | undefined => {
    if (isProtected && configState !== ResourceConfigState.Published && configState !== ResourceConfigState.Unnamed) {
        return {
            Icon: configState === ResourceConfigState.ApprovalPending ? ICStamp : ICEditFile,
            tooltipProps: {
                content: configState === ResourceConfigState.ApprovalPending ? 'Approval pending' : 'Draft',
                placement: 'right',
                arrow: false,
            },
            props: {
                className: configState === ResourceConfigState.Draft ? 'scn-6' : '',
            },
        }
    }

    return undefined
}

const SUBTITLE = {
    [ResourceConfigStage.Inheriting]: 'Inheriting',
    [ResourceConfigStage.Unpublished]: 'Unpublished',
    [ResourceConfigStage.Env]: 'Created at environment',
    [ResourceConfigStage.Overridden]: 'Overridden',
}

export const getEnvConfiguration = (
    envConfig: EnvConfigType,
    basePath: string,
    params: { appId: string; envId: string; resourceType: string },
    { id, isProtected }: EnvEnvironment,
    paramToCheck: 'appId' | 'envId' = 'envId',
): {
    deploymentTemplate: Pick<CollapsibleListItem, 'title' | 'subtitle' | 'href' | 'iconConfig'> & {
        configState: ResourceConfigState
    }
    configmaps: (Pick<CollapsibleListItem, 'title' | 'subtitle' | 'href' | 'iconConfig'> & {
        configState: ResourceConfigState
    })[]
    secrets: (Pick<CollapsibleListItem, 'title' | 'subtitle' | 'href' | 'iconConfig'> & {
        configState: ResourceConfigState
    })[]
} =>
    Object.keys(envConfig).reduce(
        (acc, curr) => ({
            ...acc,
            [curr]:
                curr === 'deploymentTemplate'
                    ? {
                          configState: envConfig[curr].configState,
                          title: 'Deployment Template',
                          subtitle: SUBTITLE[envConfig[curr].configStage],
                          href: getNavigationPath(
                              basePath,
                              params,
                              id,
                              EnvResourceType.DeploymentTemplate,
                              '',
                              paramToCheck,
                          ),
                          iconConfig: getIcon(envConfig[curr].configState, isProtected),
                      }
                    : envConfig[curr].map(({ configState, name, configStage }) => ({
                          configState,
                          title: name,
                          href: getNavigationPath(
                              basePath,
                              params,
                              id,
                              curr === 'configmaps' ? EnvResourceType.ConfigMap : EnvResourceType.Secret,
                              name,
                              paramToCheck,
                          ),
                          iconConfig: getIcon(configState, isProtected),
                          subtitle: SUBTITLE[configStage],
                      })),
        }),
        {
            deploymentTemplate: undefined,
            configmaps: [],
            secrets: [],
        },
    )
