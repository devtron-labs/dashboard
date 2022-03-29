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
            <div className="pc-icon-container bcn-1 br-8 mr-16 flexbox">
                <img src={imgSource} alt="" className="icon-dim-24" />
            </div>
            <div>
                <div className="fs-13 fw-6 cn-9 mb-4 lh-1-25">{title}</div>
                <div className="fs-12 fw-4 cn-7 lh-16">{subTitle}</div>
                <div>
                    {tags?.map((tag, index) => (
                        <span key={index} className="tag-container fs-11 br-4 mr-8 cn-7 bcn-1">
                            {tag}{' '}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
