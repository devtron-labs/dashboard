import { CollapsibleListItem } from '@devtron-labs/devtron-fe-common-lib'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ReactComponent as ICFileEdit } from '@Icons/ic-file-edit.svg'
import { ReactComponent as ICCheckCircleDots } from '@Icons/ic-check-circle-dots.svg'

export const RESOURCE_CONFIG_STATE_TO_ICON_CONFIG_MAP: Record<
    ResourceConfigState,
    Pick<CollapsibleListItem<'navLink'>['iconConfig'], 'Icon'> & {
        tippyContent: CollapsibleListItem<'navLink'>['iconConfig']['tooltipProps']['content']
        iconClass?: string
    }
> = {
    [ResourceConfigState.ApprovalPending]: {
        Icon: ICCheckCircleDots,
        tippyContent: 'Approval Pending',
    },
    [ResourceConfigState.Draft]: {
        Icon: ICFileEdit,
        tippyContent: 'In-draft',
        iconClass: 'scv-5',
    },
    [ResourceConfigState.Published]: {
        Icon: ICStamp,
        tippyContent: 'Approval(s) will be required for configuration change',
        iconClass: 'scv-5',
    },
    [ResourceConfigState.Unnamed]: {
        Icon: null,
        tippyContent: null,
    },
} as const
