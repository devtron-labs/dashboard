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

import { useEffect, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import Draggable, { DraggableEventHandler } from 'react-draggable'

import {
    animate,
    AnimatePresence,
    AppThemeType,
    motion,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { SIDE_PANEL_ASIDE_DRAG_HANDLE, SIDE_PANEL_MAX_ASIDE_WIDTH, SIDE_PANEL_MIN_ASIDE_WIDTH } from './constants'
import { SidePanelContent } from './SidePanelContent'
import { SidePanelProps } from './types'

import './SidePanel.scss'

export const SidePanel = ({ asideWidth }: SidePanelProps) => {
    // STATES
    const [contentOverlay, setContentOverlay] = useState(false)

    // HOOKS
    const { appTheme } = useTheme()
    const { sidePanelConfig, setSidePanelConfig } = useMainContext()

    const { state } = sidePanelConfig
    const open = state !== 'closed'

    useEffect(() => {
        if (open) {
            const controls = animate(asideWidth, SIDE_PANEL_MIN_ASIDE_WIDTH, {
                duration: 0.2,
                ease: 'easeInOut',
            })
            return controls.stop
        }

        const controls = animate(asideWidth, 0, {
            duration: 0.3,
            ease: 'easeInOut',
        })
        return controls.stop
    }, [open])

    // HANDLERS
    const handleClose = () => {
        asideWidth.set(SIDE_PANEL_MIN_ASIDE_WIDTH)
        setSidePanelConfig({ state: 'closed', docLink: null, reinitialize: false })
    }

    const handleDrag: DraggableEventHandler = (_, data) => {
        const newWidth = asideWidth.get() - data.deltaX
        const clamped = Math.max(SIDE_PANEL_MIN_ASIDE_WIDTH, Math.min(SIDE_PANEL_MAX_ASIDE_WIDTH, newWidth))
        asideWidth.set(clamped)
    }

    const handleDragStart = () => setContentOverlay(true)

    const handleDragStop = () => setContentOverlay(false)

    return (
        <AnimatePresence>
            {open && (
                <motion.aside
                    initial={{ x: SIDE_PANEL_MIN_ASIDE_WIDTH, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: SIDE_PANEL_MIN_ASIDE_WIDTH, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flexbox h-100vh dc__overflow-hidden"
                >
                    <Draggable
                        handle={`.${SIDE_PANEL_ASIDE_DRAG_HANDLE}`}
                        defaultClassNameDragging={`${SIDE_PANEL_ASIDE_DRAG_HANDLE}--dragging`}
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
                        <div className={`${SIDE_PANEL_ASIDE_DRAG_HANDLE} flex px-5 dc__cursor-col-resize dc__zi-10`}>
                            <div className="aside-drag__handle px-1 br-1" />
                        </div>
                    </Draggable>
                    <div className="flex-grow-1 py-8 pr-8 dc__overflow-hidden">
                        <div
                            className={`w-100 h-100 dc__position-rel br-6 bg__primary flexbox-col dc__overflow-hidden ${appTheme === AppThemeType.dark ? 'border__primary-translucent' : ''}`}
                        >
                            {contentOverlay && <div className="dc__position-abs w-100 h-100 dc__zi-1" />}
                            <SidePanelContent
                                onClose={handleClose}
                                sidePanelConfig={sidePanelConfig}
                                setSidePanelConfig={setSidePanelConfig}
                            />
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    )
}
