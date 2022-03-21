import React, { useState, useEffect, useRef } from 'react';
import ReactGA from 'react-ga';
import { DropdownIcon, Page, Progressing } from '../../../common';
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails';
import '../../../charts/modal/DeployChart.scss';
import MessageUI, { MsgUIType } from '../../common/message.ui';

function ReadmeColumn({ readmeCollapsed, toggleReadmeCollapsed, readme, loading = false, ...props }) {
    return (
        <div className="deploy-chart__readme-column">
            {loading && (
                <div {...(readmeCollapsed && { style: { width: '0' } })}>
                    <Progressing pageLoader />
                </div>
            )}
            {!loading && !readme && (
                <MessageUI
                    icon={MsgUIType.ERROR}
                    msg="Readme is not available for the selected chart version"
                    size={16}
                    theme="light-gray"
                    iconClassName="no-readme-icon"
                    msgStyle={{ color: 'var(--N700)', marginTop: '0' }}
                    {...(readmeCollapsed && { bodyStyle: { width: '0' } })}
                />
            )}
            {!loading && readme && <MarkDown markdown={readme} className="deploy-chart__readme-markdown" />}
            <aside className="flex column" onClick={readme ? (e) => {
                if (readmeCollapsed) {
                    ReactGA.event({
                        category: 'DeployChart',
                        action: 'Readme Expands',
                        label: ''
                    });
                }
                toggleReadmeCollapsed(t => !t)
            } : e => { }}>
                {readme && <DropdownIcon className={`rotate ${readme ? '' : 'not-available'}`} style={{ ['--rotateBy' as any]: `${readmeCollapsed ? -90 : 90}deg` }} color={readmeCollapsed ? '#06c' : 'white'} />}
                {readmeCollapsed && <div className={`rotate ${readme ? '' : 'not-available'}`} style={{ ['--rotateBy' as any]: `-90deg`, width: '106px', margin: '70px' }}>{readme ? 'View Readme.md' : 'README.md not available'}</div>}
                {readmeCollapsed && <Page className="rotate" style={{ ['--rotateBy' as any]: `0deg` }} />}
            </aside>
        </div>
    );
}

export default ReadmeColumn;
