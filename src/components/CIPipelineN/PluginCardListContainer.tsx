import React from 'react'
import { PluginType } from '../ciPipeline/types'
import { PluginCard } from './PluginCard'

export function PluginCardListContainer({
    pluginListTitle,
    pluginList,
}: {
    pluginListTitle: string
    pluginList: PluginType[]
}) {
    return (
        pluginList.length > 0 && (
            <div className="plugin-container">
                <div className="cn-5 fw-6 fs-13 mt-20 mb-8">{pluginListTitle}</div>
                {pluginList?.map((pluginDetails) => (
                    <PluginCard
                        key={pluginDetails.id}
                        imgSource={pluginDetails.icon}
                        title={pluginDetails.name}
                        subTitle={pluginDetails.description}
                        tags={pluginDetails.tags}
                    />
                ))}
            </div>
        )
    )
}
