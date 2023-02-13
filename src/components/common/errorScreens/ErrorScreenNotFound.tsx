import React from 'react'
import EmptyState from '../../EmptyState/EmptyState'
import notFound from '../../../assets/img/ic-empty-error@2x.png'
import { useHistory } from 'react-router'

function ErrorScreenNotFound() {
  const history = useHistory()

  const redirectToHome = () => {
    history.push(`/`)
  }

  return (
    <div>
         <EmptyState>
              <EmptyState.Image>
                  <img src={notFound} alt="Not Found" />
              </EmptyState.Image>
              <EmptyState.Title>
                  <h3 className="title">We could not find this page</h3>
              </EmptyState.Title>
              <EmptyState.Subtitle >
                   <p>This page doesn’t exist or was removed. We suggest you go back to home.</p>
              </EmptyState.Subtitle>
              <EmptyState.Button>
                        <button className="flex cta h-32"
                        onClick={redirectToHome}
                        >
                            Take me home
                        </button>
                    </EmptyState.Button>
          </EmptyState>
    </div>
  )
}

export default ErrorScreenNotFound