import React, { useState } from 'react'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as ManifestIcon } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg'
import { ReactComponent as CalendarIcon } from '../../../assets/icons/ic-calendar.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as MenuDots } from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { PopupMenu } from '@devtron-labs/devtron-fe-common-lib'
import { RESOURCE_ACTION_MENU } from '../Constants'
import { ResourceBrowserActionMenuType } from '../Types'
import { Nodes } from '../../app/types'
import DeleteResourcePopup from './DeleteResourcePopup'

export default function ResourceBrowserActionMenu({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    handleResourceClick,
    removeTabByIdentifier
}: ResourceBrowserActionMenuType) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const toggleDeleteDialog = () => {
        setShowDeleteDialog((prevState) => !prevState)
    }

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto" isKebab={true}>
                    <MenuDots className="node-actions-menu-icon icon-dim-16" data-testid="popup-menu-button" />
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="dc__border pt-4 pb-4 w-120">
                    <div className="fs-13 fw-4 lh-20">
                        <span
                            data-name={resourceData.name}
                            data-tab={RESOURCE_ACTION_MENU.manifest}
                            data-namespace={resourceData.namespace}
                            className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                            onClick={handleResourceClick}
                            data-testid="manifest-option-link"
                        >
                            <ManifestIcon className="icon-dim-16 mr-8" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.manifest}</span>
                        </span>
                        <span
                            data-name={resourceData.name}
                            data-tab={RESOURCE_ACTION_MENU.Events}
                            data-namespace={resourceData.namespace}
                            className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                            onClick={handleResourceClick}
                            data-testid="events-option-link"
                        >
                            <CalendarIcon className="icon-dim-16 mr-8" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.Events}</span>
                        </span>
                        {selectedResource?.gvk?.Kind === Nodes.Pod && (
                            <>
                                <span
                                    data-name={resourceData.name}
                                    data-tab={RESOURCE_ACTION_MENU.logs}
                                    data-namespace={resourceData.namespace}
                                    className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                    onClick={handleResourceClick}
                                    data-testid="logs-option-link"
                                >
                                    <LogAnalyzerIcon className="icon-dim-16 mr-8" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.logs}</span>
                                </span>
                                <span
                                    data-name={resourceData.name}
                                    data-tab={RESOURCE_ACTION_MENU.terminal}
                                    data-namespace={resourceData.namespace}
                                    className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                    onClick={handleResourceClick}
                                    data-testid="terminal-option-link"
                                >
                                    <TerminalIcon className="icon-dim-16 mr-8" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.terminal}</span>
                                </span>
                            </>
                        )}
                        <span
                            className="flex left h-32 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={toggleDeleteDialog}
                            data-testid="delete-option-link"
                        >
                            <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                            {RESOURCE_ACTION_MENU.delete}
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
            {showDeleteDialog && (
                <DeleteResourcePopup
                    clusterId={clusterId}
                    resourceData={resourceData}
                    selectedResource={selectedResource}
                    getResourceListData={getResourceListData}
                    toggleDeleteDialog={toggleDeleteDialog}
                    removeTabByIdentifier={removeTabByIdentifier}
                />
            )}
        </>
    )
}
