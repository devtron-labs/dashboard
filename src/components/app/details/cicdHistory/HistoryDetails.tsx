import React from 'react'
import { multiSelectStyles } from '../../../common'
import { useRouteMatch, useParams, useHistory, generatePath } from 'react-router'
import { OptionType } from '../../types'
import ReactSelect from 'react-select'
import { Option } from '../../../v2/common/ReactSelect.utils'
import { STAGE_TYPE } from '../triggerView/types'
import { BuildDetails } from './types'
export default function HistoryDetails({
    triggerHistory,
    pipeline,
    fullScreenView,
    setFullScreenView,
    synchroniseState,
    isSecurityModuleInstalled,
    isBlobStorageConfigured,
}: BuildDetails) {

}
