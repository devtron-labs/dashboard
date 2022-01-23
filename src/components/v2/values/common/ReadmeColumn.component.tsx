import React, { useState, useEffect, useRef } from 'react';
import ReactGA from 'react-ga';
import { DropdownIcon, Page } from '../../../common';
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails';
import '../../../charts/modal/DeployChart.scss';

function ReadmeColumn({ readmeCollapsed, toggleReadmeCollapsed, readme, ...props }) {

    return (
        <div className="deploy-chart__readme-column">
            <MarkDown markdown={readme} className="deploy-chart__readme-markdown" />
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
    )
}

export default ReadmeColumn