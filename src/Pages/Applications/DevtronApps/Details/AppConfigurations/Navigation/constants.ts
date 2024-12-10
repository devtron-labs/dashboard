import { CollapsibleListItem } from '@devtron-labs/devtron-fe-common-lib'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ReactComponent as ICEditFile } from '@Icons/ic-edit-file.svg'
import { ReactComponent as ICCheckCircleDots } from '@Icons/ic-check-circle-dots.svg'

export const RESOURCE_CONFIG_STATE_TO_ICON_CONFIG_MAP: Record<
    ResourceConfigState,
    Pick<CollapsibleListItem<'navLink'>['iconConfig'], 'Icon'> & {
        tippyContent: CollapsibleListItem<'navLink'>['iconConfig']['tooltipProps']['content']
    }
> = {
    [ResourceConfigState.ApprovalPending]: {
        Icon: ICCheckCircleDots,
        tippyContent: 'Approval Pending',
    },
    [ResourceConfigState.Draft]: {
        Icon: ICEditFile,
        tippyContent: 'In-draft',
    },
    [ResourceConfigState.Published]: {
        Icon: ICStamp,
        tippyContent: 'Approval required for configuration change',
    },
    [ResourceConfigState.Unnamed]: {
        Icon: null,
        tippyContent: null,
    },
} as const
