import React from 'react'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: React.ReactNode
    classname: string
    Icon
    iconClass?: string
    iconSize?: string // E.g. icon-dim-16, icon-dim-20, etc.
    renderActionButton?: () => JSX.Element
}

function InfoColourBar({ message, classname, Icon, iconClass, iconSize, renderActionButton }: InfoColourBarType) {
    return (
        <div className="info-bar-container">
            <div className={`${classname} info_text flex content-space pt-10 pb-10 pl-16 pr-16 br-4 top fs-13 fw-4`}>
                <span className="flex top">
                    <div className={`${iconSize ?? 'icon-dim-20'} mr-10`}>
                        <Icon className={`${iconSize ?? 'icon-dim-20'} ${iconClass} mr-8`} />
                    </div>
                    {message}
                </span>
                &nbsp;
                {typeof renderActionButton === 'function' && renderActionButton()}
            </div>
        </div>
    )
}

export default InfoColourBar
