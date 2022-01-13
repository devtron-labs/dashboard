import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import DeploymentGroupList from './DeploymentGroupList';
import BulkActionEdit from './BulkActionEdit';
import BulkActionDetails from './BulkActionDetails';
import './BulkActions.scss';
import { DOCUMENTATION, SERVER_MODE } from '../../config';
import EAEmptyState, { EAType } from '../common/eaEmptyState/EAEmptyState';

export default function BulkActions({ serverMode }) {
    const { path } = useRouteMatch();

    const checkInstallHandler = () => {};

    const renderEmptyEAOnly = () => {
        return (
            <div style={{ height: 'calc(100vh - 250px)' }}>
                <EAEmptyState
                    title={'Create, build, deploy and debug custom apps'}
                    msg={
                        'Create custom application by connecting your code repository. Build and deploy images at the click of a button. Debug your applications using the interactive UI.'
                    }
                    img={EAType.BULKEDIT}
                    knowMoreLink={DOCUMENTATION.BULK_UPDATE}
                    checkInstallHandler={checkInstallHandler}
                    isHeader={true}
                    headerText="Deployment Groups"
                />
            </div>
        );
    };
    return serverMode === SERVER_MODE.EA_ONLY ? (
        renderEmptyEAOnly()
    ) : (
        <Switch>
            <Route path={`${path}/:id/details`} render={() => <BulkActionDetails />} />
            <Route exact path={`${path}/:id/edit`} render={() => <BulkActionEdit />} />
            <Route exact path={`${path}`} component={DeploymentGroupList} />
            <Redirect to={`${path}`} />
        </Switch>
    );
}