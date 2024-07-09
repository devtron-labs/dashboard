import { NavLink, generatePath } from 'react-router-dom'

import { ReactComponent as Lock } from '../../../../../../assets/icons/ic-locked.svg'
import { ReactComponent as ProtectedIcon } from '../../../../../../assets/icons/ic-shield-protect-fill.svg'
import { ReactComponent as ICStamp } from '../../../../../../assets/icons/ic-stamp.svg'
import { ReactComponent as ICEditFile } from '../../../../../../assets/icons/ic-edit-file.svg'
import { CustomNavItemsType, EnvResourceType } from '../appConfig.type'
import { EnvConfig, ResourceConfigState, ResourceType } from '../../../service.types'
import { CollapsibleListItem } from '../../../../../Shared/CollapsibleList'
import { URLS } from '../../../../../../config'
import { AppEnvironment } from '../../../../../../services/service.types'

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
            className="app-compose__nav-item cursor"
            to={item.href}
        >
            <span className="dc__ellipsis-right nav-text">{item.title}</span>
            {item.isLocked && (
                <Lock className="app-compose__nav-icon icon-dim-20" data-testid={`${linkDataTestName}-lockicon`} />
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
 * @param appId - The application ID.
 * @param envId - The environment ID. Use -1 if no environment is specified.
 * @param resourceType - The type of resource.
 * @param configState - The state of the resource configuration.
 * @param href - An optional href to append to the path.
 * @returns The generated URL path.
 */
export const getNavigationPath = (
    basePath: string,
    appId: string,
    envId: number,
    resourceType: EnvResourceType,
    configState?: ResourceConfigState,
    href?: string,
) => {
    const createPath = configState === ResourceConfigState.Unnamed ? '/create' : ''
    const additionalPath = href ? `/${href}` : ''
    const resourcePath = envId !== -1 ? `/${resourceType}` : ''
    const url = `${resourcePath}${createPath || additionalPath}`

    return `${generatePath(basePath, {
        appId,
        resourceType: envId !== -1 ? URLS.APP_ENV_OVERRIDE_CONFIG : resourceType,
        envId: envId === -1 ? undefined : envId,
    })}${url}`
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
                placement: 'right' as const,
                arrow: false,
            },
            props: {
                className: configState === ResourceConfigState.Draft ? 'scn-6' : '',
            },
        }
    }

    return undefined
}

const getSubtitle = (global: boolean, overridden: boolean) => {
    if (overridden) {
        return 'Overridden'
    }
    if (global && !overridden) {
        return 'Inheriting'
    }

    return 'Created at environment'
}

export const getEnvConfiguration = (
    envConfigRes: EnvConfig,
    basePath: string,
    appId: string,
    environmentData:
        | AppEnvironment
        | {
              environmentName: string
              environmentId: number
              isProtected: boolean
          },
) =>
    envConfigRes.resourceConfig.reduce<{
        deploymentTemplate: Omit<CollapsibleListItem, 'subtitle'>
        configMaps: CollapsibleListItem[]
        secrets: CollapsibleListItem[]
    }>(
        (acc, curr) => {
            return {
                ...acc,
                deploymentTemplate:
                    curr.type === ResourceType.DeploymentTemplate
                        ? {
                              configState: curr.configState,
                              title: 'Deployment template',
                              href: getNavigationPath(
                                  basePath,
                                  appId,
                                  environmentData.environmentId,
                                  EnvResourceType.DeploymentTemplate,
                                  curr.configState,
                              ),
                              iconConfig: getIcon(curr.configState, environmentData.isProtected),
                          }
                        : acc.deploymentTemplate,
                configMaps:
                    curr.type === ResourceType.ConfigMap
                        ? [
                              ...acc.configMaps,
                              {
                                  configState: curr.configState,
                                  title: curr.name,
                                  href: getNavigationPath(
                                      basePath,
                                      appId,
                                      environmentData.environmentId,
                                      EnvResourceType.ConfigMap,
                                      curr.configState,
                                      curr.name,
                                  ),
                                  iconConfig: getIcon(curr.configState, environmentData.isProtected),
                                  subtitle:
                                      environmentData.environmentId !== -1
                                          ? getSubtitle(curr.global, curr.overridden)
                                          : undefined,
                              },
                          ]
                        : acc.configMaps,
                secrets:
                    curr.type === ResourceType.Secret
                        ? [
                              ...acc.secrets,
                              {
                                  configState: curr.configState,
                                  title: curr.name,
                                  href: getNavigationPath(
                                      basePath,
                                      appId,
                                      environmentData.environmentId,
                                      EnvResourceType.Secret,
                                      curr.configState,
                                      curr.name,
                                  ),
                                  iconConfig: getIcon(curr.configState, environmentData.isProtected),
                                  subtitle:
                                      environmentData.environmentId !== -1
                                          ? getSubtitle(curr.global, curr.overridden)
                                          : undefined,
                              },
                          ]
                        : acc.secrets,
            }
        },
        {
            deploymentTemplate: null,
            configMaps: [],
            secrets: [],
        },
    )
