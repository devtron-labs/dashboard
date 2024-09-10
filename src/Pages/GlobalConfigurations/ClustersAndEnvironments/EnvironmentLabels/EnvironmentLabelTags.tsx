import {
    Button,
    ButtonVariantType,
    TagDetails,
    TagType,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ICHelpOutline } from '@Icons/ic-help-outline.svg'
import { ReactComponent as ICPropagateTags } from '@Icons/inject-tag.svg'
import { EnvironmentLabelTagsProps } from './types'

const renderAdditionalContent = () => (
    <div className="p-12 fs-13 lh-20 cn-9">
        <p className="m-0">Labels will be attached to the provided namespace in the Kubernetes cluster.</p>
        <br />
        <p className="m-0">Use these labels to filter/identify resources via CLI or in other Kubernetes tools.</p>
    </div>
)

export const EnvironmentLabelTags = ({ tags = [], setTags }: EnvironmentLabelTagsProps) => {
    // METHODS
    const addTag = () => {
        const newTag: TagType = {
            id: Date.now() * Math.random(),
            key: '',
            value: '',
            propagate: true,
            isPropagateDisabled: true,
        }
        setTags([...(tags ?? []), newTag])
    }

    const setTagData = (index: number, tagData: TagType) => {
        const updatedTags = tags.map((tag, idx) => (index === idx ? tagData : tag))
        setTags(updatedTags)
    }

    const removeTag = (index: number) => {
        const updatedTags = tags.filter((_, idx) => index !== idx)
        setTags(updatedTags)
    }

    // RENDERERS
    const renderPropagateTagsInfo = () => (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300"
            placement="top"
            Icon={ICPropagateTags}
            iconClass="icon-dim-20"
            heading="Propagate labels to namespace"
            infoText=""
            additionalContent={renderAdditionalContent()}
            trigger="click"
            interactive
            showCloseButton
            documentationLink="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels"
            documentationLinkText="Learn more about labels"
        >
            <button type="button" className="dc__transparent flex dc__gap-4">
                <ICPropagateTags className="icon-dim-16" />
                <span className="fs-13 lh-20 cn-7">Propagate labels</span>
                <ICHelpOutline className="icon-dim-16 fcn-6" />
            </button>
        </TippyCustomized>
    )

    const renderTags = () => (
        <div>
            {tags.map((tag, index) => (
                <TagDetails key={tag.id} index={index} tagData={tag} setTagData={setTagData} removeTag={removeTag} />
            ))}
        </div>
    )

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="flexbox dc__align-items-center dc__content-space">
                <Button
                    startIcon={<ICAdd />}
                    dataTestId="add-environment-label-button"
                    text="Add label"
                    variant={ButtonVariantType.text}
                    onClick={addTag}
                />
                {renderPropagateTagsInfo()}
            </div>
            {renderTags()}
        </div>
    )
}
