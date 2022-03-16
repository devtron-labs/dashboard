import React from 'react';
import { ReactComponent as RightArrow } from '../../../../assets/icons/ic-arrow-left.svg';
import { NavLink } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
interface TemplateConfiguration {
    setShowTemplate: (boolean) => void;
}

function DeploymentConfiguration({ setShowTemplate }: TemplateConfiguration) {
    const match = useRouteMatch();
    const { path, url } = useRouteMatch();

    return (
        <div className="m-20 fs-13 cn-9">
            <NavLink
                to={`${match.url}/deployment-template`}
                onClick={() => setShowTemplate(true)}
                className="bcb-1 no-decor bcn-0 cn-9 pl-16 pr-16 pt-12 pb-12 br-4 en-2 bw-1 mb-20 flex content-space cursor"
            >
                <div>
                    Deployment template
                     {/* <span className="cn-6 ml-4">2 changes from previous deployment</span> */}
                </div>
                <span>
                    {' '}
                    <RightArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '180deg' }} />
                </span>
            </NavLink>
        </div>
    );
}

export default DeploymentConfiguration;
