import React from 'react'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: string
    classname: string
    Icon
    iconClass?: string
    renderActionButton?: () => JSX.Element
}

function InfoColourBar({ message, classname, Icon, iconClass, renderActionButton }: InfoColourBarType) {
    return (
        <div className={`${classname} info-bar flex content-space pt-10 pb-10 pl-16 pr-16 br-4`}>
            <span className="flex top">
                <Icon className={`${iconClass} icon-dim-20 mr-8`} /> {message}
            </span>
            <span> {typeof renderActionButton === 'function' && renderActionButton()}</span>
        </div>
    )
}

export default InfoColourBar
