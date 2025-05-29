import { FunctionComponent } from 'react'

import { IconName, useMotionValue } from '@devtron-labs/devtron-fe-common-lib'

export interface SidePanelProps {
    asideWidth: ReturnType<typeof useMotionValue<number>>
}

export interface SidePanelContentBaseProps {
    SidePanelHeaderActions: FunctionComponent
}

export interface SidePanelContentProps {
    initialTab?: SidePanelTab
    onClose: () => void
}

export enum SidePanelTab {
    DOCUMENTATION = 'documentation',
    ASK_DEVTRON = 'ask-devtron',
}

export interface TabConfig {
    label: string
    iconName: IconName
    id: SidePanelTab
}
