import { UserStatus, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { MutableRefObject } from 'react'
import { PermissionGroup, User } from '../../../types'
import { BulkSelectionEntityTypes, BulkSelectionModalTypes } from './constants'

export type BulkSelectionState = Record<User['id'] | PermissionGroup['id'], boolean>

export type BulkSelectionModalConfig = {
    type: BulkSelectionModalTypes
    onSuccess?: () => void
    onCancel?: () => void
} | null

export interface BulkSelectionActionWidgetProps {
    parentRef: MutableRefObject<HTMLDivElement>
    count: number
    areActionsDisabled: boolean
    // TODO (v2): Something better
    filterConfig: {
        searchKey: string
        // Only for users
        statuses?: UserStatus[]
    }
    selectedIdentifiersCount: number
    isCountApproximate?: boolean
    setBulkSelectionModalConfig: (config: BulkSelectionModalConfig) => void
    refetchList: () => void
    showStatus: boolean
}

export interface BulkSelectionModalProps
    extends BulkSelectionModalConfig,
        Pick<
            BulkSelectionActionWidgetProps,
            'refetchList' | 'setBulkSelectionModalConfig' | 'selectedIdentifiersCount'
        > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlFilters: UseUrlFiltersReturnType<any> & {
        // Required for users
        statuses?: UserStatus[]
    }
    entityType: BulkSelectionEntityTypes
}

export interface BulkSelectionClearConfirmationModalProps {
    type: BulkSelectionModalTypes.clearAllAcrossPages | BulkSelectionModalTypes.selectAllAcrossPages
    onClose: () => void
    onSubmit: () => void
}

export interface BulkDeleteModalProps
    extends Pick<BulkSelectionModalProps, 'refetchList' | 'urlFilters' | 'entityType'>,
        Pick<BulkSelectionActionWidgetProps, 'selectedIdentifiersCount'> {
    onClose: () => void
}
