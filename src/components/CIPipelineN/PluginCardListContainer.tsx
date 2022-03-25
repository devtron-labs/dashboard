import React from 'react'
import { PluginCard } from './PluginCard'

interface pluginCardType{
  imageSource: string
  title: string
  subTitle: string
  tags: string[]
}

export function PluginCardListContainer({
    pluginListTitle,
    pluginList,
}: {
    pluginListTitle: string
    pluginList: pluginCardType[]
}) {
    return pluginList.length>0 && (
        <div className="plugin-container">
            <div className="cn-5 fw-6 fs-13">{pluginListTitle}</div>
            {pluginList?.map((pluginDetails) => (
            <PluginCard
                imgSource={pluginDetails.imageSource}
                title={pluginDetails.title}
                subTitle={pluginDetails.subTitle}
                tags={pluginDetails.tags}
            />
            ))}
        </div>
    )
}
