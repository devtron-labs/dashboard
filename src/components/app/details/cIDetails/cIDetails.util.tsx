import EmptyState from '../../../EmptyState/EmptyState';
import notScanned from '../../../../assets/img/ic-mechanical-operation.svg';
import React from 'react';
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg';
import { NavLink } from 'react-router-dom';

export function ScanDisabledView(props) {
    return <EmptyState>
        <EmptyState.Image>
            <img src={notScanned} />
        </EmptyState.Image>
        <EmptyState.Title><h3 className="fw-6">Security scan not enabled</h3></EmptyState.Title>
        <EmptyState.Subtitle>Vulnerability scanning hasn’t been enabled for this build pipeline</EmptyState.Subtitle>
    </EmptyState>
}

export function ImageNotScannedView() {
    return <EmptyState>
        <EmptyState.Image>
            <img src={notScanned} />
        </EmptyState.Image>
        <EmptyState.Title><h3 className="fw-6">Image not scanned</h3></EmptyState.Title>
        <EmptyState.Subtitle>This build was executed before scanning was enabled for this pipeline.</EmptyState.Subtitle>
    </EmptyState>
}

export function NoVulnerabilityView() {
    return <EmptyState>
        <EmptyState.Image>
            <img src={notScanned} />
        </EmptyState.Image>
        <EmptyState.Title><h3 className="fw-6">No Vulnerability Found</h3></EmptyState.Title>
    </EmptyState>
}

export function CIRunningView(props) {
    return <EmptyState >
        <EmptyState.Image>
            <MechanicalOperation />
        </EmptyState.Image>
        <EmptyState.Title><h4>Building artifacts</h4></EmptyState.Title>
        {props.isSecurityTab ? null : <EmptyState.Subtitle>Generated artifact(s) will be available here after the pipeline is executed.</EmptyState.Subtitle>}
    </EmptyState>
}