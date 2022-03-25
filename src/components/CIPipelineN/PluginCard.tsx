import React from 'react'

export function PluginCard({
    imgSource,
    title,
    subTitle,
    tags,
}: {
    imgSource: string
    title: string
    subTitle: string
    tags?: string[]
}) {
    return (
        <div className="flex left cursor plugin-card">
            <div className="sqr-44">
                <img src={imgSource} alt="" className="icon-dim-24" />
            </div>
            <div>
                <div className="ci-stage__title">{title}</div>
                <div className="ci-stage__description">{subTitle}</div>
            </div>
            <div>
                {tags?.map((tag) => (
                    <span>{tag} </span>
                ))}
            </div>
        </div>
    )
}
