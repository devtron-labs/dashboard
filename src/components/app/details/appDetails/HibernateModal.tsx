import { ConfirmationModal, ConfirmationModalVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICHibernate } from '@Icons/ic-medium-hibernate.svg'
import { ReactComponent as ICUnhibernate } from '@Icons/ic-medium-unhibernate.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { HibernationModalTypes } from './appDetails.type'
import { HibernationModalProps } from './types'

const ConfigurePatchDialog = importComponentFromFELibrary('ConfigurePatchDialog', null, 'function')

const HibernateModal = ({
    appName,
    envName,
    hibernating,
    chartName,
    handleHibernate,
    hibernateConfirmationModal,
    handleHibernateConfirmationModalClose,
}: HibernationModalProps) => (
    <>
        {ConfigurePatchDialog && hibernateConfirmationModal === HibernationModalTypes.CONFIGURE_PATCH && (
            <ConfigurePatchDialog chartName={chartName} handleClose={handleHibernateConfirmationModalClose} />
        )}
        {hibernateConfirmationModal !== HibernationModalTypes.CONFIGURE_PATCH && (
            <ConfirmationModal
                variant={ConfirmationModalVariantType.custom}
                Icon={hibernateConfirmationModal === 'hibernate' ? <ICHibernate /> : <ICUnhibernate />}
                title={`${hibernateConfirmationModal === 'hibernate' ? 'Hibernate' : 'Restore'} '${appName}' on '${envName}'`}
                subtitle={`Pods for this application will be scaled ${hibernateConfirmationModal === 'hibernate' ? 'down to 0' : 'up to its original count'} on ${envName} environment.`}
                buttonConfig={{
                    secondaryButtonConfig: {
                        disabled: hibernating,
                        onClick: handleHibernateConfirmationModalClose,
                        text: 'Cancel',
                    },
                    primaryButtonConfig: {
                        isLoading: hibernating,
                        onClick: handleHibernate,
                        text: `${hibernateConfirmationModal === HibernationModalTypes.HIBERNATE ? 'Hibernate' : 'Restore'} App`,
                    },
                }}
                handleClose={handleHibernateConfirmationModalClose}
            >
                <span className="fs-13">{`${hibernateConfirmationModal === HibernationModalTypes.HIBERNATE ? 'A new deployment will un-hibernate the application.' : 'Are you sure you want to continue?'}`}</span>
            </ConfirmationModal>
        )}
    </>
)

export default HibernateModal
