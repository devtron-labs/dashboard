import React from "react";
import { StatusViewTabJSON } from "../../utils/tabUtils/tab.json";
import { useTab } from "../../utils/tabUtils/useTab";
import { iLink } from "../../utils/tabUtils/link.type";
import IndexStore from "../index.store";

export const StatusFilterButtonComponent: React.FC<{}> = ({ }) => {
    const [{ tabs }, dispatch] = useTab(StatusViewTabJSON);

    const handleFileterClick = (filterName: string) => {
        IndexStore.updateFilterType(filterName)
    }

    return (
        <div className="en-2 bw-1 br-4 flex left">
            <span className="border-right bcb-1 fw-6 cb-5 pl-8 pr-8 pt-5 pb-5">All</span>
            {
                tabs.map((tab: iLink, index) => {
                    return (
                        <div key={`${'filter_tab_' + index}`} onClick={() => {
                            handleFileterClick(tab.status)
                        }} className="pointer flex left border-right">
                            <a className="cn-9 pr-6 fw-6 no-decor flex left" >
                                {tab.status !== 'all' && <div className={`app-summary__icon icon-dim-16 mr-6 ml-6 mt-6 mb-6 ${tab.status.toLowerCase()} ${tab.status.toLowerCase()}--node`} style={{ zIndex: 'unset' }} />}
                                <span className="capitalize " style={{ minWidth: '58px' }}>{tab.count}  {tab.status.toLowerCase()}</span>
                            </a>
                        </div>
                    )
                })
            }
        </div>
    );
}