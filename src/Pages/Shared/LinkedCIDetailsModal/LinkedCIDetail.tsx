import React from 'react'
import { Switch, useRouteMatch, Route } from 'react-router-dom'
import { Drawer } from '@devtron-labs/devtron-fe-common-lib'
import LinkedCIDetailsModal from './LinkedCIDetailsModal'
import { URLS } from '../../../config'
import { LinkedCIDetailModalProps } from './types'

const LinkedCIDetail = (props: LinkedCIDetailModalProps) => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/${URLS.LINKED_CI_DETAILS}/:ciPipelineId`} exact>
                <Drawer position="right" width="800px">
                    <LinkedCIDetailsModal {...props} />
                </Drawer>
            </Route>
        </Switch>
    )
}

export default LinkedCIDetail
