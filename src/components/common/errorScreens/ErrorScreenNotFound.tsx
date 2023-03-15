import React from 'react'
import notFound from '../../../assets/img/ic-empty-error@2x.png'
import { useHistory } from 'react-router'
import { ERROR_EMPTY_SCREEN} from '../../../config/constantMessaging'
import { URLS } from '../../../config'
import { EmptyState } from '@devtron-labs/devtron-fe-common-lib'

function ErrorScreenNotFound() {
  const history = useHistory()

  const redirectToHome = () => {
    history.push(`/${URLS.APP}/${URLS.APP_LIST}`)
  }

  return (
    <div>
         <EmptyState>
              <EmptyState.Image>
                  <img src={notFound} alt="Not Found" />
              </EmptyState.Image>
              <EmptyState.Title>
                  <h3 className="title">{ERROR_EMPTY_SCREEN.PAGE_NOT_FOUND}</h3>
              </EmptyState.Title>
              <EmptyState.Subtitle >
                   <p>{ERROR_EMPTY_SCREEN.PAGE_NOT_EXIST}</p>
              </EmptyState.Subtitle>
              <EmptyState.Button>
                        <button className="flex cta h-32"
                        onClick={redirectToHome}
                        >
                            {ERROR_EMPTY_SCREEN.TAKE_BACK_HOME}
                        </button>
                    </EmptyState.Button>
          </EmptyState>
    </div>
  )
}

export default ErrorScreenNotFound