import React, { useEffect, useRef } from 'react'
import { Drawer } from '../../../../common'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { MarkDown } from '../../../../charts/discoverChartDetail/DiscoverChartDetails'
import './environmentStatus.scss'

function NotesDrawer({ notes, close }: { notes: string; close: () => void }) {
    const appNotesRef = useRef<HTMLDivElement>(null)

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }

    const outsideClickHandler = (evt): void => {
        if (
            appNotesRef.current &&
            !appNotesRef.current.contains(evt.target) &&
            typeof close === 'function'
        ) {
            close()
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
        <Drawer position="right" width="50%">
            <div className="app-notes__modal bcn-0" ref={appNotesRef}>
                <div className="app-notes__header box-shadow pb-12 pt-12 mb-20 bcn-0">
                    <div className="title flex content-space cn-9 fs-16 fw-6 pl-20 pr-20 ">
                        Notes
                        <span className="cursor" onClick={close}>
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                </div>
                <div className="app-notes__body">
                    <MarkDown className="app-notes__markdown" markdown={notes} breaks={true} />
                </div>
            </div>
        </Drawer>
    )
}

export default NotesDrawer
