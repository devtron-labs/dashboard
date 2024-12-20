import { NavLink, generatePath } from 'react-router-dom'

import { CollapsibleListItem, EnvResourceType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Lock } from '@Icons/ic-locked.svg'
import { ReactComponent as ProtectedIcon } from '@Icons/ic-shield-protect-fill.svg'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ReactComponent as ICFileEdit } from '@Icons/ic-file-edit.svg'
import { ResourceConfigStage, ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import {
    CustomNavItemsType,
    EnvConfigRouteParams,
    EnvConfigType,
    ExtendedCollapsibleListItem,
    EnvConfigObjectKey,
} from '../AppConfig.types'

const renderNavItemIcon = (isLocked: boolean, isProtected: boolean, dataTestId: string) => {
    if (isLocked) {
        return <Lock className="icon-dim-20 dc__no-shrink" data-testid={`${dataTestId}-lockicon`} />
    }
    if (!isLocked && isProtected) {
        return <ProtectedIcon className="icon-dim-20 fcv-5" data-testid={`${dataTestId}-protectedicon`} />
    }
    return null
}

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
            className="dc__nav-item cursor fs-13 lh-32 cn-7 w-100 br-4 px-8 flexbox dc__align-items-center dc__content-space dc__no-decor"
            to={item.href}
        >
            <span className="dc__truncate nav-text">{item.title}</span>
            {renderNavItemIcon(item.isLocked, isBaseConfigProtected && item.isProtectionAllowed, linkDataTestName)}
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
 * @returns The generated URL path.
 */
export const getNavigationPath = (
    basePath: string,
    params: EnvConfigRouteParams,
    resourceType: EnvResourceType,
    href?: string,
) => `${generatePath(basePath, { ...params, resourceType })}${href ? `/${href}` : ''}`

const getIconClassFromConfigState = (configState: ResourceConfigState) => {
    switch (configState) {
        case ResourceConfigState.Draft:
            return 'scn-6'
        case ResourceConfigState.ApprovalPending:
            return 'scv-5'
        default:
            return ''
    }
}

/**
 * Returns an object containing the appropriate icon, icon properties and tooltip properties based on the resource configuration state.
 *
 * @param configState - The state of the resource configuration.
 * @returns An object containing the icon, props and tooltipProps if conditions are met, otherwise null.
 */
const getIcon = (
    configState: ResourceConfigState,
    isProtected: boolean,
): CollapsibleListItem<'navLink'>['iconConfig'] => {
    if (isProtected && configState !== ResourceConfigState.Published && configState !== ResourceConfigState.Unnamed) {
        return {
            Icon: configState === ResourceConfigState.ApprovalPending ? ICStamp : ICFileEdit,
            tooltipProps: {
                content: configState === ResourceConfigState.ApprovalPending ? 'Approval pending' : 'Draft',
                placement: 'right',
                arrow: false,
                className: 'default-tt',
            },
            props: {
                className: `p-2 dc__no-shrink ${getIconClassFromConfigState(configState)}`,
            },
        }
    }

    return null
}

const SUBTITLE: Record<ResourceConfigStage, string> = {
    [ResourceConfigStage.Inheriting]: 'Inheriting',
    [ResourceConfigStage.Unpublished]: 'Unpublished',
    [ResourceConfigStage.Env]: 'Created at environment',
    [ResourceConfigStage.Overridden]: 'Overridden',
}

export const getEnvConfiguration = (
    envConfig: EnvConfigType,
    basePath: string,
    params: EnvConfigRouteParams,
    isProtected: boolean,
): {
    deploymentTemplate: ExtendedCollapsibleListItem
    configmaps: ExtendedCollapsibleListItem[]
    secrets: ExtendedCollapsibleListItem[]
} =>
    Object.keys(envConfig).reduce(
        (acc, curr) => ({
            ...acc,
            [curr]:
                curr === EnvConfigObjectKey.DeploymentTemplate
                    ? {
                          configState: envConfig[curr].configState,
                          title: 'Deployment Template',
                          subtitle: SUBTITLE[envConfig[curr].configStage],
                          href: getNavigationPath(basePath, params, EnvResourceType.DeploymentTemplate),
                          iconConfig: getIcon(envConfig[curr].configState, isProtected),
                      }
                    : envConfig[curr].map(({ configState, name, configStage }) => ({
                          configState,
                          title: name,
                          href: getNavigationPath(
                              basePath,
                              params,
                              curr === EnvConfigObjectKey.ConfigMap
                                  ? EnvResourceType.ConfigMap
                                  : EnvResourceType.Secret,
                              name,
                          ),
                          iconConfig: getIcon(configState, isProtected),
                          subtitle: SUBTITLE[configStage],
                          clearQueryParamsOnNavigation: true,
                      })),
        }),
        {
            deploymentTemplate: null,
            configmaps: [],
            secrets: [],
        },
    )

export const resourceTypeBasedOnPath = (pathname: string) => {
    if (pathname.includes(`/${EnvResourceType.ConfigMap}`)) {
        return EnvResourceType.ConfigMap
    }
    if (pathname.includes(`/${EnvResourceType.Secret}`)) {
        return EnvResourceType.Secret
    }
    return EnvResourceType.DeploymentTemplate
}
