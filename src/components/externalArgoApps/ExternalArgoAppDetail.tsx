import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router'
import { showError, Progressing, ErrorScreenManager, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'
import { getArgoAppDetail } from '../external-apps/ExternalAppService'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil'
import AppDetailsComponent from '../v2/appDetails/AppDetails.component'
import { AppDetails, AppType } from '../v2/appDetails/appDetails.type'
import IndexStore from '../v2/appDetails/index.store'
import { ExternalArgoAppDetailType } from './externalArgoApp.type'

const ExternalArgoAppDetail = ({ appName, clusterId, isExternalApp, namespace }: ExternalArgoAppDetailType) => {
    const location = useLocation()
    const history = useHistory()
    const [isLoading, setIsLoading] = useState(true)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)

    let initTimer = null
    let isAPICallInProgress = false

    // component load
    useEffect(() => {
        _init()
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
            IndexStore.publishAppDetails({} as AppDetails, AppType.EXTERNAL_ARGO_APP) // Cleared out the data on unmount
        }
    }, [])

    useEffect(() => {
        if (checkIfToRefetchData(location)) {
            setTimeout(() => {
                _getAndSetAppDetail()
                deleteRefetchDataFromUrl(history, location)
            }, 2000)
        }
    }, [location.search])

    const _init = () => {
        if (!isAPICallInProgress) {
            _getAndSetAppDetail()
        }
        initTimer = setTimeout(() => {
            _init()
        }, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const _getAndSetAppDetail = async () => {
        isAPICallInProgress = true
        getArgoAppDetail(appName, clusterId, namespace)
            .then((appDetailResponse) => {
                IndexStore.publishAppDetails(appDetailResponse.result, AppType.EXTERNAL_ARGO_APP)
                setErrorResponseCode(undefined)
                setIsLoading(false)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setErrorResponseCode(errors.code)
                setIsLoading(false)
                isAPICallInProgress = false
            })
    }

    if (isLoading) {
        return (
            <div className="dc__loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    }
    if (errorResponseCode) {
        return (
            <div className="dc__loading-wrapper">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }

    return (
        <AppDetailsComponent
            isExternalApp={isExternalApp}
            loadingDetails={false}
            _init={_init}
            loadingResourceTree={false}
        />
    )
}

export default ExternalArgoAppDetail
