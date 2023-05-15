import React from 'react'
import '@testing-library/jest-dom'
import { act, render } from '@testing-library/react'
import ClusterManifest from '../ClusterManifest'
import { ClusterManifestType } from '../types'
import { EDIT_MODE_TYPE } from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'
import { clusterManifestResponse } from '../__mocks__/ClusterManifest.mock'
import { BrowserRouter } from 'react-router-dom'
import * as data from '../clusterNodes.service'

describe('ClusterManifest', () => {
  const mockClusterManifest: ClusterManifestType = {
    terminalAccessId: 123,
    manifestMode: EDIT_MODE_TYPE.NON_EDIT,
    setManifestMode: jest.fn(),
    setManifestData: jest.fn(),
    errorMessage: [],
    setManifestAvailable: jest.fn(),
  };

  it('renders loading message while fetching manifest', async () => {
    const { getByText } = render(<ClusterManifest {...mockClusterManifest} />);
    expect(getByText('Fetching manifest')).toBeInTheDocument();
  });

  it('renders default manifest when in non-edit mode', async () => {
    let component
    jest.spyOn(data, 'getClusterManifest').mockImplementation(clusterManifestResponse)
    await act(async () => {
        component = render(<ClusterManifest {...mockClusterManifest} />, {
            wrapper: BrowserRouter,
        })
    })
    const manifestComponent = component.container.querySelector('.h-100.flexbox.dc__flex-direction')
  });

});