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

import React from 'react'
import { PluginType, PluginDetailType, VariableType } from '@devtron-labs/devtron-fe-common-lib'
import { PluginCard } from './PluginCard'

export const PluginCardListContainer = ({
    pluginListTitle,
    pluginList,
    setPluginType,
}: {
    pluginListTitle: string
    pluginList: PluginDetailType[]
    setPluginType: (
        PluginType: PluginType,
        pluginId: number,
        pluginName: string,
        pluginDescription: string,
        inputVariables: VariableType[],
        outputVariables: VariableType[],
    ) => void
}) => {
    return (
        pluginList.length > 0 && (
            <div className="plugin-container">
                <div data-testid="preset-plugin-heading" className="cn-5 fw-6 fs-13 mt-20 mb-8">
                    {pluginListTitle}
                </div>
                {pluginList.map((pluginDetails) => (
                    <div
                        key={pluginDetails.id}
                        onClick={() =>
                            setPluginType(
                                PluginType.PLUGIN_REF,
                                pluginDetails.id,
                                pluginDetails.name,
                                pluginDetails.description,
                                pluginDetails.inputVariables ?? [],
                                pluginDetails.outputVariables ?? [],
                            )
                        }
                    >
                        <PluginCard
                            dataTestId={`${pluginDetails.name}-button`}
                            imgSource={pluginDetails.icon}
                            title={pluginDetails.name}
                            subTitle={pluginDetails.description}
                            tags={pluginDetails.tags}
                        />
                    </div>
                ))}
            </div>
        )
    )
}
