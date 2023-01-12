import React from 'react'
import { ReactComponent as InjectTag } from '../../../../assets/icons/inject-tag.svg'
import { ReactComponent as Help } from '../../../../assets/icons/ic-help-outline.svg'
import TippyCustomized, { TippyTheme } from '../../../common/TippyCustomized'
import { DOCUMENTATION } from '../../../../config'

export default function PropagateTagInfo() {
    const additionalInfo = () => {
        return (
            <div className="p-12 fs-13">
                Use these tags to filter/identify resources via CLI or in other Kubernetes tools.
            </div>
        )
    }
    return (
        <div className="flexbox">
            <InjectTag className="icon-dim-16 mt-2 mr-4" />
            <span>Propagate tags</span>
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-300"
                placement="top"
                Icon={InjectTag}
                heading={'Propagate tags to K8s resources'}
                infoText={`Add a tag and click on the ⬡ icon to propagate tags as labels to Kubernetes resources.`}
                additionalContent={additionalInfo()}
                showCloseButton={true}
                trigger="click"
                interactive={true}
                documentationLink={DOCUMENTATION.CHART_GROUP}
                documentationLinkText={'View Documentation'}
            >
                <Help className="icon-dim-16 mt-2 ml-4 cursor" />
            </TippyCustomized>
        </div>
    )
}
