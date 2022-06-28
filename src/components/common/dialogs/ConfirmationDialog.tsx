import React from 'react'
import { VisibleModal2 } from '../modals/VisibleModal2'
function ConfirmationDialog({ className = '', children }) {
    return (
        <VisibleModal2 className="confirmation-dialog">
            <div className={`confirmation-dialog__body ${className}`}>{children}</div>
        </VisibleModal2>
    )
}

function Icon({ src, className = '' }) {
    return <img src={src} className={`confirmation-dialog__icon ${className}`} alt="" />
}

function Body({ title, subtitle = null, children = null }) {
    return (
        <div className="flex left column ">
            <h3 className="confirmation-dialog__title lh-1-25 break-word w-100">{title}</h3>
            {subtitle && <div className="confirmation-dialog__subtitle">{subtitle}</div>}
            {children}
        </div>
    )
}

function ButtonGroup({ children }) {
    return <div className="flex right confirmation-dialog__button-group">{children}</div>
}

ConfirmationDialog.Icon = Icon
ConfirmationDialog.Body = Body
ConfirmationDialog.ButtonGroup = ButtonGroup
export default ConfirmationDialog
