import React from 'react'
import { PluginDetailType, PluginType } from '../ciPipeline/types'
import { PluginCard } from './PluginCard'

export function PluginCardListContainer({
    pluginListTitle,
    pluginList,
    setPluginType,
}: {
    pluginListTitle: string
    pluginList: PluginDetailType[]
    setPluginType: (PluginType) => void
}) {
    return (
        pluginList.length > 0 && (
            <div className="plugin-container">
                <div className="cn-5 fw-6 fs-13 mt-20 mb-8">{pluginListTitle}</div>
                {pluginList?.map((pluginDetails) => (
                    <div key={pluginDetails.id} onClick={() => setPluginType(PluginType.PLUGIN_REF)}>
                        <PluginCard
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
