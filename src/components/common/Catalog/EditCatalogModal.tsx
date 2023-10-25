import React, { useEffect, useRef } from 'react'

import { Drawer } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { EditCatalogModalProps } from './types'

export const EditCatalogModal = (props: EditCatalogModalProps) => {
    const { onClose } = props
    const modalRef = useRef(null)

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof onClose === 'function') {
            evt.preventDefault()
            onClose(evt)
        }
    }

    const outsideClickHandler = (evt): void => {
        if (modalRef.current && !modalRef.current.contains(evt.target) && typeof onClose === 'function') {
            onClose(evt)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    return (
        <Drawer position="right" width="800px">
            <div className="h-100 bcn-0 create-app-container" ref={modalRef}>
                <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                    <h2 className="fs-16 cn-9 fw-6 m-0">Edit catalog details</h2>
                    <Close className="icon-dim-20 cursor" onClick={onClose} />
                </div>
            </div>
        </Drawer>
    )
}
