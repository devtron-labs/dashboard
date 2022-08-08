import React from 'react'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: string | JSX.Element
    classname: string
    Icon
    iconClass?: string
    renderActionButton?: () => JSX.Element
    title?: string
}

function InfoColourBar({ message, classname, Icon, iconClass, renderActionButton, title }: InfoColourBarType) {
    return (
        <div className={`${classname} info flex content-space pt-10 pb-10 pl-16 pr-16 br-4 top fs-13 fw-4`}>
            <span className="flex top">
                <div className="icon-dim-20 mr-10">
                    <Icon className={`${iconClass} icon-dim-20 mr-8`} />
                </div>
                <div>
                    <div className="fw-6">{title}</div>
                    {message}
                </div>
            </span>
            &nbsp;
            {typeof renderActionButton === 'function' && renderActionButton()}
        </div>
    )
}

export default InfoColourBar
