import React from 'react'
import '@testing-library/jest-dom'
import { act, fireEvent, render } from '@testing-library/react'
import ClusterManifest from '../ClusterManifest'
import { ClusterManifestType } from '../types'
import { EDIT_MODE_TYPE } from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'
import { clusterManifestResponse } from '../__mocks__/ClusterManifest.mock'
import { BrowserRouter } from 'react-router-dom'
import * as data from '../clusterNodes.service'

describe('ClusterManifest', () => {
  const defaultProps: ClusterManifestType = {
    terminalAccessId: 1,
    manifestMode: EDIT_MODE_TYPE.REVIEW,
    setManifestMode: jest.fn(),
    setManifestData: jest.fn(),
    errorMessage: [],
    setManifestAvailable: jest.fn(),
  }

  it('renders the loading message while fetching the manifest', async () => {
    const { getByText } = render(<ClusterManifest {...defaultProps} />)
    expect(getByText(/Fetching manifest/i)).toBeInTheDocument()
  })

  // it('renders the manifest when terminalAccessId is provided', async () => {
  //   let component
  //   jest.spyOn(data, 'getClusterManifest').mockImplementation(clusterManifestResponse)
  //   await act(async () => {
  //       component = render(<ClusterManifest {...defaultProps} manifestMode= {EDIT_MODE_TYPE.NON_EDIT} />)
  //   })

  //   expect(component.container).toBeInTheDocument()
  //   const editor = component.container.querySelector('.dc__overflow-hidden.h-100')
  //   expect(editor).toBeInTheDocument()
  //   expect(component.getByText('apiVersion')).toBeInTheDocument()
  // })

  // it('switches to edit mode when the edit button is clicked', async () => {
  //   const { getByRole } = render(<ClusterManifest {...defaultProps} manifestMode={EDIT_MODE_TYPE.REVIEW} />)

  //   fireEvent.click(getByRole('button', { name: /edit/i }))
  //   expect(defaultProps.setManifestMode).toHaveBeenCalledWith('edit')
  // })

  // it('renders an error message when there is an error in the manifest', async () => {
  //   const { getByText, findByText } = render(<ClusterManifest {...defaultProps} manifestMode={EDIT_MODE_TYPE.APPLY} errorMessage={["some error"]} />)

  //   expect(getByText(/default manifest error/i)).toBeInTheDocument()
  //   expect(await findByText(/some error/i)).toBeInTheDocument()
  // })

  // it('updates the manifest when the user edits it', async () => {
  //   const { findByRole } = render(<ClusterManifest {...defaultProps} />)

  //   const manifestInput = await findByRole('textbox')
  //   fireEvent.change(manifestInput, { target: { value: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod' } })

  //   expect(defaultProps.setManifestData).toHaveBeenCalledWith(
  //     JSON.stringify({ apiVersion: 'v1', kind: 'Pod', metadata: { name: 'my-pod' } })
  //   )
  // })

  // it('shows an error message when the edited manifest is invalid YAML', async () => {
  //   const { getByText, findByText, findByRole } = render(<ClusterManifest {...defaultProps} manifestMode={EDIT_MODE_TYPE.APPLY} />)

  //   const manifestInput = await findByRole('textbox')
  //   fireEvent.change(manifestInput, { target: { value: 'invalid: yaml' } })

  //   expect(getByText(/default manifest error/i)).toBeInTheDocument()
  //   expect(await findByText(/mapping values are not allowed here/i)).toBeInTheDocument()
  //   expect(defaultProps.setManifestMode).toHaveBeenCalledWith('edit')
  // })
})
