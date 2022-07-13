import EmptyState from '../../../EmptyState/EmptyState';
import notScanned from '../../../../assets/img/not-scanned.png';
import scannedDisabled from '../../../../assets/img/ic-empty-scanner-disabled.png'
import { ReactComponent as Vulnerability } from '../../../../assets/img/ic-vulnerability-not-found.svg';
import React from 'react';
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg';
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg';
import { NavLink } from 'react-router-dom';

export function ScanDisabledView(props) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={notScanned} />
            </EmptyState.Image>
            <EmptyState.Title>
                <h3 className="fw-6">Image not scanned</h3>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Go to build pipeline configurations and enable ’Scan for vulnerabilities’
            </EmptyState.Subtitle>
            <EmptyState.Button>
                <button className="flex cta h-36" onClick={props.redirectToCreate}>
                    Go to pipeline configurations
                    <Arrow className="button__icon" />
                </button>
            </EmptyState.Button>
        </EmptyState>
    )
}

export function ImageNotScannedView() {
    return <EmptyState>
        <EmptyState.Image>
            <img src={scannedDisabled} />
        </EmptyState.Image>
        <EmptyState.Title><h3 className="fw-6">Image not scanned</h3></EmptyState.Title>
        <EmptyState.Subtitle>This build was executed before scanning was enabled for this pipeline.</EmptyState.Subtitle>
    </EmptyState>
}

export function NoVulnerabilityView() {
    return <EmptyState>
        <EmptyState.Image>
            <Vulnerability />
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