import React, { useState } from "react";
import { useSearchString } from "../../../../common";
import { ResourceTabsJSON, StatusViewTabJSON } from "../../../utils/tabUtils/tab.json";
import { useTab } from "../../../utils/tabUtils/useTab";
import { useRouteMatch, useParams, useLocation, useHistory } from 'react-router';
import { iTab } from "../../../utils/tabUtils/tab.type";
import { NavLink } from "react-router-dom";

export const StatusFilterButtonComponent: React.FC<{}> = ({ }) => {
    const { queryParams } = useSearchString()
    const [{ tabs }, dispatch] = useTab(StatusViewTabJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const location = useLocation();
    const { path } = useRouteMatch();

    return (
        <div className="flexbox en-2 bw-1 br-4 flex left">
            {
                tabs.map((tab: iTab, index) => {

                    return (
                        <div className="pointer flex left ">
                            <NavLink to={``} className="cn-9 pr-6 fw-6 no-decor flex left">
                                {tab.status !== 'all' && <div className={`app-summary__icon icon-dim-16 mr-6 ${tab.status.toLowerCase()} ${tab.status.toLowerCase()}--node`} style={{ zIndex: 'unset' }} />}
                                <span className="capitalize">{tab.count}  {tab.status.toLowerCase()}</span> <div className="cn-7">|</div>
                            </NavLink>
                        </div>
                    )
                })
            }

        </div>
    );
}