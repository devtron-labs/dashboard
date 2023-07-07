import { EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import notFound from '../../assets/img/page-not-found.png'
import { ERROR_EMPTY_SCREEN } from '../../config/constantMessaging'
import { EnvType } from '../v2/appDetails/appDetails.type'

interface AppDetailsEmptyChart {
  envType?: string
}

export function AppDetailsEmptyState({envType}: AppDetailsEmptyChart) {
    return (
        <GenericEmptyState
            image={notFound}
            classname="w-100 dc__text-center "
            heightToDeduct={300}
            title={ERROR_EMPTY_SCREEN.APP_NOT_AVAILABLE}
            subTitle={
                <>
                    {ERROR_EMPTY_SCREEN.DEPLOYMENT_NOT_EXIST}
                    {envType === EnvType.APPLICATION && ERROR_EMPTY_SCREEN.SELECT_ANOTHER_ENVIRONMENT}
                </>
            }
        />
    )
}
