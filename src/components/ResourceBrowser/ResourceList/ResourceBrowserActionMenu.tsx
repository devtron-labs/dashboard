import React, { useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as ManifestIcon } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg'
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as MenuDots } from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { PopupMenu } from '../../common'
import { RESOURCE_ACTION_MENU } from '../Constants'
import { ResourceDetail } from '../Types'

export default function NodeActionsMenu({ resourceData }: { resourceData: ResourceDetail }) {
    const history = useHistory()
    const { url } = useRouteMatch()

    const handleEditYamlAction = () => {
        history.push(`${url}/${resourceData.name}?tab=yaml`)
    }

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex" isKebab={true}>
                    <MenuDots className="node-actions-menu-icon icon-dim-16" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <div className="fs-13 fw-4 lh-20 pt-8 pb-8 w-160">
                        <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={() => {}}>
                            <ManifestIcon className="mr-8" />
                            {RESOURCE_ACTION_MENU.manifest}
                        </span>
                        <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={() => {}}>
                            <CalendarIcon className="mr-8" />
                            {RESOURCE_ACTION_MENU.Events}
                        </span>
                        <>
                            <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={() => {}}>
                                <LogAnalyzerIcon className="mr-8" />
                                {RESOURCE_ACTION_MENU.logs}
                            </span>
                            <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={() => {}}>
                                <TerminalIcon className="mr-8" />
                                {RESOURCE_ACTION_MENU.terminal}
                            </span>
                        </>
                        <span className="flex left h-36 cursor pl-12 pr-12 cr-5 dc__hover-n50" onClick={() => {}}>
                            <DeleteIcon className="mr-8 scr-5" />
                            {RESOURCE_ACTION_MENU.delete}
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
        </>
    )
}
