import EmptyState from '../../../EmptyState/EmptyState'
import notScanned from '../../../../assets/img/not-scanned.png'
import scannedDisabled from '../../../../assets/img/ic-empty-scanner-disabled.png'
import novulnerability from '../../../../assets/img/no_vulnerability.png'
import React from 'react'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg'
import { NavLink } from 'react-router-dom'
import GenericEmptyState from '../../../EmptyState/GenericEmptyState'

export function ScanDisabledView(props) {
    const renderScanedViewButton = () => {
        return (
            <button className="flex cta h-36" onClick={props.redirectToCreate}>
                Go to pipeline configurations
                <Arrow className="button__icon" />
            </button>
        )
    }
    return (
        <GenericEmptyState
            image={notScanned}
            title="Image not scanned"
            subTitle={`Go to build pipeline configurations and enable ’Scan for vulnerabilities’`}
            isButtonAvailable={true}
            renderButton={renderScanedViewButton}
        />
    )
}

export function ImageNotScannedView() {
    return (
        <GenericEmptyState
            image={scannedDisabled}
            title="Image not scanned"
            subTitle="This build was executed before scanning was enabled for this pipeline."
        />
    )
}

export function NoVulnerabilityView() {
    return <GenericEmptyState image={novulnerability} title="No Vulnerability Found" />
}

export function CIRunningView(props) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <MechanicalOperation />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>Building artifacts</h4>
            </EmptyState.Title>
            {props.isSecurityTab ? null : (
                <EmptyState.Subtitle>
                    Generated artifact(s) will be available here after the pipeline is executed.
                </EmptyState.Subtitle>
            )}
        </EmptyState>
    )
}
