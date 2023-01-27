import React from 'react'
import { ReactComponent as InjectTag } from '../../../../assets/icons/inject-tag.svg'
import { ReactComponent as Help } from '../../../../assets/icons/ic-help-outline.svg'
import TippyCustomized, { TippyTheme } from '../../../common/TippyCustomized'
import { DOCUMENTATION } from '../../../../config'

export default function PropagateTagInfo() {
    const additionalInfo = () => {
        return (
            <div className="p-12 fs-13">
                <div className="mb-20">
                    <span className="flex left">
                        Add a tag and click on the
                        <InjectTag className="icon-dim-16 ml-4 mr-4" />
                        icon to
                    </span>
                    propagate tags as labels to Kubernetes resources
                </div>
                <div>Use these tags to filter/identify resources via CLI or in other Kubernetes tools.</div>
            </div>
        )
    }
    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300"
            placement="top"
            Icon={InjectTag}
            heading={'Propagate tags to K8s resources'}
            infoText=""
            additionalContent={additionalInfo()}
            showCloseButton={true}
            trigger="click"
            interactive={true}
            documentationLink={DOCUMENTATION.APP_TAGS}
            documentationLinkText={'View Documentation'}
        >
            <div className="flexbox cursor">
                <InjectTag className="icon-dim-16 mt-2 mr-4" />
                <span>Propagate tags</span>
                <Help className="icon-dim-16 mt-2 ml-4" />
            </div>
        </TippyCustomized>
    )
}
