import { useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import Draggable, { DraggableEventHandler } from 'react-draggable'

import {
    AnimatePresence,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    motion,
    useMainContext,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { SideDocumentationProps } from './types'

const MAX_ASIDE_WIDTH = 525
const MIN_ASIDE_WIDTH = 350

export const SideDocumentation = ({ asideWidth, setAsideWidth }: SideDocumentationProps) => {
    // STATES
    const [showIframeOverlay, setShowIframeOverlay] = useState(false)

    // HOOKS
    const { appTheme } = useTheme()
    const { sideDocLink, setSideDocLink } = useMainContext()

    // HANDLERS
    const handleCloseSideDoc = () => {
        setAsideWidth(MIN_ASIDE_WIDTH)
        setSideDocLink(null)
    }

    const handleDrag: DraggableEventHandler = (_, data) => {
        const newWidth = asideWidth - data.deltaX
        const clamped = Math.max(MIN_ASIDE_WIDTH, Math.min(MAX_ASIDE_WIDTH, newWidth))
        setAsideWidth(clamped)
    }

    const handleDragStart = () => setShowIframeOverlay(true)

    const handleDragStop = () => setShowIframeOverlay(false)

    return (
        <AnimatePresence>
            {sideDocLink && (
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
                        transition={{ duration: 0.2 }}
                        className="mt-8 mr-8 mb-8 border__primary br-6 bg__primary flexbox-col dc__overflow-hidden"
                    >
                        <div className="px-16 pt-14 pb-13 border__primary--bottom flex dc__gap-12">
                            <Icon name="ic-book-open" color="N900" />
                            <h2 className="m-0 fs-16 lh-1-5 fw-6 cn-9 flex-grow-1">Documentation</h2>
                            <div className="flex dc__gap-8">
                                <Button
                                    dataTestId="side-doc-open-link"
                                    ariaLabel="side-doc-open-link"
                                    showAriaLabelInTippy={false}
                                    icon={<Icon name="ic-arrow-square-out" color={null} />}
                                    variant={ButtonVariantType.borderLess}
                                    style={ButtonStyleType.neutral}
                                    size={ComponentSizeType.xs}
                                    component={ButtonComponentType.anchor}
                                    anchorProps={{
                                        href: sideDocLink,
                                    }}
                                />
                                <Button
                                    dataTestId="side-doc-close-btn"
                                    ariaLabel="side-doc-close-btn"
                                    showAriaLabelInTippy={false}
                                    icon={<Icon name="ic-close-large" color={null} />}
                                    variant={ButtonVariantType.borderLess}
                                    style={ButtonStyleType.negativeGrey}
                                    size={ComponentSizeType.xs}
                                    onClick={handleCloseSideDoc}
                                />
                            </div>
                        </div>
                        <div className="dc__position-rel flex-grow-1">
                            {showIframeOverlay && <div className="dc__position-abs w-100 h-100 dc__zi-1" />}
                            <iframe
                                title="side-doc"
                                loading="lazy"
                                className="dc__no-border"
                                src={`${sideDocLink}?theme=${appTheme}`}
                                width="100%"
                                height="100%"
                            />
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}
