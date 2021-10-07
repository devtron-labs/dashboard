import React, { useState, useEffect } from 'react'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import ExternalListView from './ExternalListView'
import { ViewType } from '../../../../../config'
import { showError } from '../../../../common'
import { getExternalList } from './externalList.data'

export default function ExternalListContainer() {

    const [externalList, setExternalState] = useState([])
    const [viewType, setViewType] = useState(ViewType.LOADING || ViewType.FORM || ViewType.EMPTY || ViewType.ERROR)
    const location = useLocation();


    useEffect(() => {
        fetchExternalListApp()
    }, [])

    function fetchExternalListApp() {
        setViewType(ViewType.LOADING)
        getExternalList(location.search).then((response) => {
            setExternalState(response)
            setViewType(ViewType.FORM)
        }).catch((error) => {
            showError(error);
        })
        setViewType(ViewType.FORM)
    }

    return (
        <div>

            <ExternalListView
                view={viewType}
                externalList={externalList}
            />
        </div>
    )
}
