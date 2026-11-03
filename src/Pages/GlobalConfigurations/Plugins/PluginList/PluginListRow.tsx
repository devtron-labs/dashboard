/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Link, useLocation } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuProps,
    Badge,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    PluginCreationType,
    PluginImageContainer,
    PluginTagsContainer,
} from '@devtron-labs/devtron-fe-common-lib'

import { PLUGIN_ROUTE_SEGMENTS, PLUGINS_ROOT_URL } from '../constants'
import { PluginListActionMenuOptionType, PluginListRowProps } from '../types'

const PluginListRow = ({ parentPlugin, pluginDataStore, handleActionMenuClick }: PluginListRowProps) => {
    const { search } = useLocation()
    const { id, name, icon, type, latestVersionId, pluginVersions } = parentPlugin
    const latestVersion = pluginDataStore.pluginVersionStore[latestVersionId]
    const versionCount = pluginVersions?.length ?? 0
    const isPreset = type === PluginCreationType.PRESET
    const hasTags = !!latestVersion?.tags?.length

    const onActionMenuClick: ActionMenuProps<PluginListActionMenuOptionType>['onClick'] = (item) => {
        handleActionMenuClick(item.id, latestVersionId)
    }

    return (
        <div className="flexbox dc__gap-12 px-20 py-12 dc__border-bottom-n1 dc__hover-n50">
            <Link
                to={{ pathname: `${PLUGINS_ROOT_URL}/${latestVersionId}`, search }}
                className="flexbox dc__gap-16 flex-grow-1 dc__overflow-hidden dc__no-decor"
                data-testid={`plugin-list-row-${id}`}
            >
                <PluginImageContainer
                    fallbackImageClassName="icon-dim-40 p-4 dc__no-shrink"
                    imageProps={{
                        src: icon,
                        alt: name,
                        width: 40,
                        height: 40,
                        className: 'p-4 dc__no-shrink br-4',
                    }}
                />

                <div className="flexbox-col dc__gap-4 dc__overflow-hidden">
                    <div className="flexbox dc__align-items-center dc__gap-6">
                        <span className="cn-9 fs-13 fw-6 lh-20 dc__truncate">{name}</span>
                        {latestVersion?.pluginVersion && (
                            <span className="cn-7 fs-12 lh-20 dc__no-shrink">v{latestVersion.pluginVersion}</span>
                        )}
                        {versionCount > 1 && (
                            <>
                                <span className="cn-7 fs-12 lh-20">&bull;</span>
                                <span className="cn-7 fs-12 lh-20 dc__no-shrink">{versionCount} versions</span>
                            </>
                        )}
                    </div>

                    {latestVersion?.description && (
                        <p className="m-0 cn-7 fs-12 lh-18 dc__truncate">{latestVersion.description}</p>
                    )}

                    {(isPreset || hasTags) && (
                        <div className="flexbox dc__align-items-center dc__gap-6 flex-wrap">
                            {isPreset && (
                                <Badge
                                    label="by Devtron"
                                    startIconProps={{ name: 'ic-devtron' }}
                                    size={ComponentSizeType.xxs}
                                />
                            )}
                            {hasTags && <PluginTagsContainer tags={latestVersion.tags} />}
                        </div>
                    )}
                </div>
            </Link>

            <div className="dc__no-shrink">
                <ActionMenu<PluginListActionMenuOptionType>
                    id={`plugin-list-action-menu-${id}`}
                    onClick={onActionMenuClick}
                    position="bottom"
                    alignment="end"
                    options={[
                        {
                            items: [
                                // New versions can only be created for shared plugins
                                ...(!isPreset
                                    ? [
                                          {
                                              id: PLUGIN_ROUTE_SEGMENTS.NEW_VERSION,
                                              label: 'Create new version',
                                              startIcon: { name: 'ic-add' as const },
                                          },
                                      ]
                                    : []),
                                {
                                    id: PLUGIN_ROUTE_SEGMENTS.CLONE,
                                    label: 'Clone this plugin',
                                    startIcon: { name: 'ic-copy' },
                                },
                            ],
                        },
                    ]}
                    buttonProps={{
                        icon: <Icon name="ic-more-vertical" color={null} />,
                        dataTestId: `plugin-list-action-menu-button-${id}`,
                        variant: ButtonVariantType.borderLess,
                        ariaLabel: `Open actions for ${name}`,
                        style: ButtonStyleType.neutral,
                        size: ComponentSizeType.xs,
                        showAriaLabelInTippy: false,
                    }}
                />
            </div>
        </div>
    )
}

export default PluginListRow
