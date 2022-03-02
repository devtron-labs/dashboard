import React from 'react';
import { CustomNavItemsType } from './AppConfig';

interface HelpBoxType {
    selectedNav: CustomNavItemsType;
}

export default function HelpBox({ selectedNav }: HelpBoxType) {
    return (
        <div className="help-container">
            <div>{selectedNav?.currentStep}/4 Completed</div>
            <div className="progress-container">
                <div className="progress-tracker" style={{ width: selectedNav?.flowCompletionPercent + '%' }}></div>
            </div>
            <div className="fs-13 font-weight-600">{selectedNav?.title}</div>
            <div className="need-help font-weight-600">
                <a
                    className="learn-more__href"
                    href={selectedNav?.supportDocumentURL}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    Need help?
                </a>
            </div>
        </div>
    );
}
