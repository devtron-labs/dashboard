import { NavLink, generatePath } from 'react-router-dom'

import {
    ApprovalConfigDataKindType,
    ApprovalConfigDataType,
    CollapsibleListItem,
    EnvResourceType,
    getIsApprovalPolicyConfigured,
    ResourceIdToResourceApprovalPolicyConfigMapType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Lock } from '@Icons/ic-locked.svg'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ResourceConfigStage, ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import {
    CustomNavItemsType,
    EnvConfigRouteParams,
    EnvConfigType,
    ExtendedCollapsibleListItem,
    EnvConfigObjectKey,
} from '../AppConfig.types'
import { RESOURCE_CONFIG_STATE_TO_ICON_CONFIG_MAP } from './constants'

const renderNavItemIcon = (isLocked: boolean, isApprovalPolicyConfigured: boolean, dataTestId: string) => {
    if (isLocked) {
        return <Lock className="icon-dim-20 dc__no-shrink" data-testid={`${dataTestId}-lockicon`} />
    }
    if (isApprovalPolicyConfigured) {
        return <ICStamp className="icon-dim-20 scv-5 dc__no-shrink" data-testid={`${dataTestId}-protectedicon`} />
    }
    return null
}

/**
 *
 * @param item
 * @param hideApprovalPolicyIcon Used to hide the policy icon (applicable for jobs atm)
 */
export const renderNavItem = (item: CustomNavItemsType, hideApprovalPolicyIcon?: boolean) => {
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
            {renderNavItemIcon(item.isLocked, !hideApprovalPolicyIcon && item.isProtectionAllowed, linkDataTestName)}
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

/**
 * Returns an object containing the appropriate icon, icon properties and tooltip properties based on the resource configuration state.
 *
 * @param configState - The state of the resource configuration.
 * @returns An object containing the icon, props and tooltipProps if conditions are met, otherwise null.
 */
const getIcon = (
    configState: ResourceConfigState,
    approvalConfig: ApprovalConfigDataType,
): CollapsibleListItem<'navLink'>['iconConfig'] => {
    const isApprovalPolicyConfigured = getIsApprovalPolicyConfigured(approvalConfig)

    if (isApprovalPolicyConfigured && configState !== ResourceConfigState.Unnamed) {
        const { Icon, tippyContent, iconClass } = RESOURCE_CONFIG_STATE_TO_ICON_CONFIG_MAP[configState]

        return {
            Icon,
            tooltipProps: {
                content: tippyContent,
                placement: 'right',
                arrow: false,
                className: 'default-tt',
            },
            props: {
                className: `p-2 dc__no-shrink ${iconClass ?? ''}`,
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
    approvalConfigurationMapForEnv: ResourceIdToResourceApprovalPolicyConfigMapType[number]['approvalConfigurationMap'],
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
                          iconConfig: getIcon(
                              envConfig[curr].configState,
                              approvalConfigurationMapForEnv?.[ApprovalConfigDataKindType.deploymentTemplate],
                          ),
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
                          iconConfig: getIcon(
                              configState,
                              approvalConfigurationMapForEnv?.[
                                  curr === EnvConfigObjectKey.ConfigMap
                                      ? ApprovalConfigDataKindType.configMap
                                      : ApprovalConfigDataKindType.configSecret
                              ],
                          ),
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
