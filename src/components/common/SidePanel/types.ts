import { FunctionComponent } from 'react'

import { IconName, MainContext, SidePanelTab, useMotionValue } from '@devtron-labs/devtron-fe-common-lib'

export interface SidePanelProps {
    asideWidth: ReturnType<typeof useMotionValue<number>>
}

export interface SidePanelContentBaseProps {
    SidePanelHeaderActions: FunctionComponent
}

export interface SidePanelContentProps extends Pick<MainContext, 'sidePanelConfig' | 'setSidePanelConfig'> {
    tab?: SidePanelTab
    onClose: () => void
}

export interface TabConfig {
    label: string
    iconName: IconName
    id: SidePanelTab
}
