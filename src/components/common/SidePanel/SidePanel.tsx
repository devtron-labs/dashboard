import { useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import Draggable, { DraggableEventHandler } from 'react-draggable'

import { AnimatePresence, motion, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { SidePanelDocumentation } from './SidePanelDocumentation'
import { SidePanelProps } from './types'

const MAX_ASIDE_WIDTH = 525
const MIN_ASIDE_WIDTH = 350

export const SidePanel = ({ asideWidth, setAsideWidth }: SidePanelProps) => {
    // STATES
    const [contentOverlay, setContentOverlay] = useState(false)

    // HOOKS
    const { sidePanelConfig, setSidePanelConfig } = useMainContext()

    const { open } = sidePanelConfig

    // HANDLERS
    const handleClose = () => {
        setAsideWidth(MIN_ASIDE_WIDTH)
        setSidePanelConfig({ open: false })
    }

    const handleDrag: DraggableEventHandler = (_, data) => {
        const newWidth = asideWidth - data.deltaX
        const clamped = Math.max(MIN_ASIDE_WIDTH, Math.min(MAX_ASIDE_WIDTH, newWidth))
        setAsideWidth(clamped)
    }

    const handleDragStart = () => setContentOverlay(true)

    const handleDragStop = () => setContentOverlay(false)

    return (
        <AnimatePresence>
            {open && (
                <>
                    <Draggable
                        handle=".aside-drag"
                        defaultClassNameDragging="aside-drag--dragging"
                        axis="none"
                        position={{
                            x: 0,
                            y: 0,
                        }}
                        bounds={{
                            top: 0,
                            bottom: 0,
                        }}
                        onDrag={handleDrag}
                        onStart={handleDragStart}
                        onStop={handleDragStop}
                    >
                        <div className="aside-drag flex dc__cursor-col-resize dc__zi-10">
                            <div className="aside-drag__handle px-1 br-1" />
                        </div>
                    </Draggable>
                    <motion.aside
                        initial={{ x: 350, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 350, opacity: 0 }}
                        transition={{
                            duration: 0.2,
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="dc__position-rel mt-8 mr-8 mb-8 border__primary br-6 bg__primary flexbox-col dc__overflow-hidden"
                    >
                        {contentOverlay && <div className="dc__position-abs w-100 h-100 dc__zi-1" />}
                        <SidePanelDocumentation onClose={handleClose} />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}
