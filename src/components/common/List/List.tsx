import React from 'react'
import { Toggle } from '@devtron-labs/devtron-fe-common-lib'
import arrowTriangle from '../../../assets/icons/appstatus/ic-chevron-down.svg'
import './list.scss'

const Logo = ({ src = '', style = {}, className = '', children = null }) => {
    return (
        <>
            {src && <img src={src} alt="" className={`list__logo ${className}`} style={style} />}
            {children}
        </>
    )
}

const Title = ({ title = '', subtitle = '', style = {}, className = '', tag = '', ...props }) => {
    return (
        <div className="flex column left">
            <div className={`list__title ${className}`}>
                {title} {tag && <span className="tag">{tag}</span>}
            </div>
            {subtitle && <div className={`list__subtitle ${className}`}>{subtitle}</div>}
        </div>
    )
}

const ListToggle = ({ onSelect, enabled = false }) => {
    return <Toggle onSelect={onSelect} selected={enabled} />
}

const DropDown = ({ className = '', style = {}, src = null, ...props }) => {
    if (React.isValidElement(src)) {
        return src
    }
    return <img {...props} src={src || arrowTriangle} alt="" className={`list__arrow ${className}`} style={style} />
}

List.Logo = Logo
List.Title = Title
List.Toggle = ListToggle
List.DropDown = DropDown

export default function List({ children = null, className = '', ...props }) {
    return (
        <div className={`compound-list ${className}`} {...props}>
            {children}
        </div>
    )
}
