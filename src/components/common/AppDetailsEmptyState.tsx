import { EmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import notFound from '../../assets/img/page-not-found.png'
import { ERROR_EMPTY_SCREEN } from '../../config/constantMessaging'
import { EnvType } from '../v2/appDetails/appDetails.type'

interface AppDetailsEmptyChart {
  envType?: string
}

export function AppDetailsEmptyState({envType}: AppDetailsEmptyChart) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={notFound} alt="error" className="w-100" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9 w-300 dc__text-center ">{ERROR_EMPTY_SCREEN.APP_NOT_AVAILABLE}</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>
               <div className='dc__text-center w-300'>{ERROR_EMPTY_SCREEN.DEPLOYMENT_NOT_EXIST} {envType === EnvType.APPLICATION && ERROR_EMPTY_SCREEN.SELECT_ANOTHER_ENVIRONMENT}.</div>
            </EmptyState.Subtitle>
        </EmptyState>
    )
}
