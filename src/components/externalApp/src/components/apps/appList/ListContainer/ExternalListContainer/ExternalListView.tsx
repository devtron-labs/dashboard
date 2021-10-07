import React from 'react';
import { Progressing } from '../../../../common';
import { NavLink, Link, Route, Switch } from 'react-router-dom';
import { ViewType } from '../../../../../config'
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../../../../assets/icons/ic-question.svg'
import './appList.css'
export default function ExternalListView({ externalList, view }) {

    function renderDefaultListTitle() {
        return (
            <div>
                <div className="bcn-0">
                    <div className="external-list__header pt-8 pb-8">
                        <div className="external-list__cell pr-12 pl-20">
                            <span className="app-list__cell-header p-0 flex">
                                App name
                            </span>
                        </div>
                        <div className="external-list__cell external-list__cell--width pl-12 pr-12">
                            <span className="app-list__cell-header">Environment</span>
                            <Tippy className="default-tt" arrow={false} placement="top" content={
                                <span style={{ display: "block", width: "200px" }}> Environment is a unique combination of cluster and namespace. </span>}>
                                <Question className="icon-dim-16 ml-4" />
                            </Tippy>
                        </div>
                        <div className="external-list__cell pr-20">
                            <div className="m-auto_mr-0 flex">
                                <span className="app-list__cell-header">Last Updated</span>
                            </div>
                        </div>
                        <div className="app-list__cell app-list__cell--action"></div>
                    </div>
                </div>
            </div>
        )
    }
    function renderListRow(list) {
        return (
            <div className="bcn-0">
                <Link to="" className="external-list__row flex left cn-9 pt-19 pb-19 pl-20">
                    <div className="external-list__cell content-left pr-12"> <p className="truncate-text m-0">{list.appName}</p></div>
                    <div className="external-list__cell external-list__cell--width ">{list.environment}/{list.namespace}</div>
                    <div className="external-list__cell pl-12 pr-12"> {list.lastDeployedOn} </div>
                    <div className="app-list__cell app-list__cell--action">
                    </div>
                </Link>
            </div>
        )
    }

    function renderDefaultListRows() {
        if (view === ViewType.LOADING) {
            return <div style={{ height: "calc(100vh - 280px)" }}> <Progressing pageLoader /> </div>
        } else {
            return <>
                {externalList?.map((list) => { return renderListRow(list) })}
            </>
        }
    }

    return (
        <div>
            {renderDefaultListTitle()}
            {renderDefaultListRows()}
        </div>
    )
}
