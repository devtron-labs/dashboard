import React, { useState } from "react";
import { useSearchString } from "../../../../common";
import {  StatusViewTabJSON } from "../../../utils/tabUtils/tab.json";
import { useTab } from "../../../utils/tabUtils/useTab";
import { useRouteMatch, useParams, useLocation, useHistory } from 'react-router';
import { iLink } from "../../../utils/tabUtils/link.type";
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
                tabs.map((tab: iLink, index) => {

                    return (
                        <div key={`${'tab' + index}`} className="pointer flex left ">
                            <NavLink to={``} className="cn-9 pr-6 fw-6 no-decor flex left bcb-1 border-right">
                                {tab.status !== 'all' && <div className={`app-summary__icon icon-dim-16 mr-6 ml-6 mt-6 mb-6 ${tab.status.toLowerCase()} ${tab.status.toLowerCase()}--node`} style={{ zIndex: 'unset' }} />}
                                <span className="capitalize ">{tab.count}  {tab.status.toLowerCase()}</span>
                            </NavLink>
                        </div>
                    )
                })
            }

        </div>
    );
}