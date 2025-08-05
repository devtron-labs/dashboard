/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { StatusComponent, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterStatusProps } from './types'
import { getClusterStatus } from './utils'

export const ClusterStatus = ({ status, errorInNodeListing }: ClusterStatusProps) => (
    <Tooltip alwaysShowTippyOnHover={!!errorInNodeListing} content={errorInNodeListing} interactive>
        {/* This div is added to render the tooltip, otherwise it is not visible. */}
        <div className="flex left">
            <StatusComponent status={getClusterStatus(status)} hideIconTooltip message={status} />
        </div>
    </Tooltip>
)
