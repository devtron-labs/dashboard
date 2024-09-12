import {
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ERROR_STATUS_CODE,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICTag } from '@Icons/ic-tag.svg'
import { ReactComponent as ICError } from '@Icons/ic-error-exclamation.svg'

import { EnvironmentLabelTags } from './EnvironmentLabelTags'
import { EnvironmentLabelText } from './EnvironmentLabelText'
import { EnvironmentLabelsProps } from './types'

export const EnvironmentLabels = ({ isLoading, error, addLabel, reload, tags, setTags }: EnvironmentLabelsProps) => {
    // CONSTANTS
    const showTags = !(isLoading || error) && !!tags

    // RENDERERS
    const renderLoadingState = () => (
        <>
            <Progressing size={24} />
            <EnvironmentLabelText heading="Connecting to cluster" description="Checking for namespace and labels" />
        </>
    )

    const renderErrorState = () => (
        <>
            <ICError className="icon-dim-24" />
            <EnvironmentLabelText
                heading={
                    error.code === ERROR_STATUS_CODE.SERVICE_TEMPORARY_UNAVAILABLE
                        ? 'Cluster not reachable'
                        : error.code.toString()
                }
                description={error.errors[0].userMessage}
            />
            <Button
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.small}
                dataTestId="add-environment-labels-button"
                text="Retry"
                onClick={reload}
            />
        </>
    )

    const renderEmptyState = () => (
        <>
            <ICTag className="icon-dim-24 scb-5" />
            <EnvironmentLabelText
                heading="Add/Edit labels to namespace"
                description="Labels will be attached to the provided namespace in the Kubernetes cluster"
            />
            <Button
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.small}
                dataTestId="environment-labels-button"
                text="Add/Edit labels"
                onClick={addLabel}
            />
        </>
    )

    return showTags ? (
        <EnvironmentLabelTags tags={tags} setTags={setTags} />
    ) : (
        <div className="flex bcn-50 py-24 px-16">
            <div className="flex column dc__gap-12 dc__mxw-300 mx-auto">
                {isLoading && renderLoadingState()}
                {!isLoading && (error ? renderErrorState() : renderEmptyState())}
            </div>
        </div>
    )
}
