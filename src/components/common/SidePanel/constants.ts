import { SidePanelTab, TabConfig } from './types'

export const SIDE_PANEL_MIN_ASIDE_WIDTH = 362

export const SIDE_PANEL_MAX_ASIDE_WIDTH = 525

export const SIDE_PANEL_ASIDE_DRAG_HANDLE = 'aside-drag'

export const TABS_CONFIG: TabConfig[] = [
    {
        label: 'Docs',
        iconName: 'ic-book-open',
        id: SidePanelTab.DOCUMENTATION,
    },
    {
        label: 'Ask',
        iconName: 'ic-sparkle-color',
        id: SidePanelTab.ASK_DEVTRON,
    },
]
