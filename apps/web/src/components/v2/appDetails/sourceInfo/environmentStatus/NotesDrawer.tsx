/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { MarkDown } from '../../../../charts/discoverChartDetail/DiscoverChartDetails'
import './environmentStatus.scss'
import { NotesDrawerType } from './notesDrawer.type'
import { Drawer } from '@devtron-labs/devtron-fe-common-lib'

const NotesDrawer = ({ notes, close }: NotesDrawerType) => {
    const appNotesRef = useRef<HTMLDivElement>(null)

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape') {
            evt.preventDefault()
            close()
        }
    }

    const outsideClickHandler = (evt): void => {
        if (evt && appNotesRef.current && !appNotesRef.current.contains(evt.target)) {
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
                <div className="app-notes__header dc__box-shadow pb-12 pt-12 mb-20 bcn-0">
                    <div
                        className="title flex dc__content-space cn-9 fs-16 fw-6 pl-20 pr-20 "
                        data-testid="notes-heading-after-click"
                    >
                        Notes
                        <span className="cursor" onClick={close} data-testid="close-notes-button">
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                </div>
                <div className="app-notes__body dc__white-space-pre">
                    <MarkDown className="app-notes__markdown fs-13" markdown={notes} breaks />
                </div>
            </div>
        </Drawer>
    )
}

export default NotesDrawer
