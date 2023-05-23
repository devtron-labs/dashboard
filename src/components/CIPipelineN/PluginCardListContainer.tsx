import React from 'react'
import { PluginType } from '@devtron-labs/devtron-fe-common-lib'
import { PluginDetailType } from '../ciPipeline/types'
import { PluginCard } from './PluginCard'

export function PluginCardListContainer({
    pluginListTitle,
    pluginList,
    setPluginType,
}: {
    pluginListTitle: string
    pluginList: PluginDetailType[]
    setPluginType: (PluginType: PluginType, pluginId: number, pluginName: string, pluginDescription: string) => void
}) {
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
