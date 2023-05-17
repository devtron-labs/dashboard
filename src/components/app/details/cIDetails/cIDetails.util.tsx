import notScanned from '../../../../assets/img/not-scanned.png';
import scannedDisabled from '../../../../assets/img/ic-empty-scanner-disabled.png'
import { ReactComponent as novulnerability } from '../../../../assets/img/ic-vulnerability-not-found.svg';
import React from 'react';
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg';
import { ReactComponent as Arrow } from '../../../../assets/icons/ic-arrow-forward.svg';
import { EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib';
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging';

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
          title={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.TITLE}
          subTitle={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_SCANNED_DISABLED}
          isButtonAvailable={true}
          renderButton={renderScanedViewButton}
          classname="dc__position-rel-imp"
      />
  )
}

export function ImageNotScannedView() {
    return <GenericEmptyState
      image={scannedDisabled}
      title={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.TITLE}
      subTitle={EMPTY_STATE_STATUS.CI_DETAILS_IMAGE_NOT_SCANNED.SUBTITLE}
  />
}

export function NoVulnerabilityView() {
    return <GenericEmptyState image={novulnerability} title={EMPTY_STATE_STATUS.CI_DEATILS_NO_VULNERABILITY_FOUND} />
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