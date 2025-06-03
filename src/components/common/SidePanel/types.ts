import { FunctionComponent } from 'react'

import { IconName, MainContext, SidePanelTab, useMotionValue } from '@devtron-labs/devtron-fe-common-lib'

export interface SidePanelProps {
    asideWidth: ReturnType<typeof useMotionValue<number>>
}

export interface SidePanelContentBaseProps {
    SidePanelHeaderActions: FunctionComponent
}

export interface SidePanelContentProps {
    tab?: SidePanelTab
    onClose: () => void
    setSidePanelConfig: MainContext['setSidePanelConfig']
    sidePanelConfig: MainContext['sidePanelConfig']
}

export interface TabConfig {
    label: string
    iconName: IconName
    id: SidePanelTab
}
