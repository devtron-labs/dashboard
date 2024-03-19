import React from 'react'
import { Switch, useRouteMatch, Route } from 'react-router-dom'
import LinkedCIDetailsModal from './LinkedCIDetailsModal'
import { URLS } from '../../../config'
import { LinkedCIDetailModalProps } from './types'

const LinkedCIDetail = (props: LinkedCIDetailModalProps) => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/${URLS.LINKED_CI_DETAILS}/:ciPipelineId`}
                render={() => <LinkedCIDetailsModal {...props} />}
                exact
            />
        </Switch>
    )
}

export default LinkedCIDetail
