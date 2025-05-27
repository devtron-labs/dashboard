import { useMotionValue } from '@devtron-labs/devtron-fe-common-lib'

export interface SidePanelProps {
    asideWidth: ReturnType<typeof useMotionValue<number>>
}

export interface SidePanelDocumentationProps {
    onClose: () => void
}
