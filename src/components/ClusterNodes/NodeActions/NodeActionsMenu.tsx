import React, { useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as CubeIcon } from '../../../assets/icons/ic-cube.svg'
import { ReactComponent as EditFileIcon } from '../../../assets/icons/ic-edit-file.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import MenuDots from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { PopupMenu } from '../../common'
import { ColumnMetadataType, NodeActionsMenuProps } from '../types'
import CordonNodeModal from './CordonNodeModal'
import DrainNodeModal from './DrainNodeModal'
import DeleteNodeModal from './DeleteNodeModal'

export default function NodeActionsMenu({ nodeData, openTerminal }: NodeActionsMenuProps) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const [showCordonNodeDialog, setCordonNodeDialog] = useState(false)
    const [showDrainNodeDialog, setDrainNodeDialog] = useState(false)
    const [showDeleteNodeDialog, setDeleteNodeDialog] = useState(false)

    const handleOpenTerminalAction = () => {
        openTerminal(nodeData)
    }

    const handleEditYamlAction = () => {
        history.push(`${url}/${nodeData.name}?tab=yaml`)
    }

    const toggleShowCordonNodeDialog = () => {
        setCordonNodeDialog((prevState) => !prevState)
    }

    const toggleShowDrainNodeDialog = () => {
        setDrainNodeDialog((prevState) => !prevState)
    }

    const toggleShowDeleteNodeDialog = () => {
        setDeleteNodeDialog((prevState) => !prevState)
    }

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button isKebab={true}>
                    <img src={MenuDots} className="icon-dim-16" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <div className="fs-13 fw-4 lh-20 pt-8 pb-8 w-160">
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50"
                            onClick={handleOpenTerminalAction}
                        >
                            <TerminalIcon className="mr-8" />
                            Shell
                        </span>
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50"
                            onClick={toggleShowCordonNodeDialog}
                        >
                            <CubeIcon className="mr-8" />
                            Cordon
                        </span>
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50"
                            onClick={toggleShowDrainNodeDialog}
                        >
                            <CubeIcon className="mr-8" />
                            Drain
                        </span>
                        <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={() => {}}>
                            <CubeIcon className="mr-8" />
                            Edit taints
                        </span>
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50"
                            onClick={handleEditYamlAction}
                        >
                            <EditFileIcon className="mr-8" />
                            Edit YAML
                        </span>
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={toggleShowDeleteNodeDialog}
                        >
                            <DeleteIcon className="mr-8 scr-5" />
                            Delete
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
            {showCordonNodeDialog && (
                <CordonNodeModal nodeData={nodeData} toggleShowCordonNodeDialog={toggleShowCordonNodeDialog} />
            )}
            {showDrainNodeDialog && (
                <DrainNodeModal nodeData={nodeData} toggleShowDrainNodeDialog={toggleShowDrainNodeDialog} />
            )}
            {showDeleteNodeDialog && (
                <DeleteNodeModal nodeData={nodeData} toggleShowDeleteNodeDialog={toggleShowDeleteNodeDialog} />
            )}
        </>
    )
}
