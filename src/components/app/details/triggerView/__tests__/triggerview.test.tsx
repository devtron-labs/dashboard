import React from 'react'
import TriggerView from '../TriggerView'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { cdTriggerResponse } from '../__mocks__/trigger.view.mock'
import { getCDMaterialList } from '../../../service'
import { DeploymentNodeType } from '../types'
describe('Trigger View', () => {
    it('Render Trigger View', () => {
        const { container } = render(<TriggerView />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })
})

describe('cd trigger view service tests', () => {
  test('trigger view git material list response', () => {
    console.log( getCDMaterialList(
      "297", DeploymentNodeType.CD
      ))
      expect(
        getCDMaterialList(
          "297", DeploymentNodeType.CD
          ),
      ).toStrictEqual(cdTriggerResponse)

  })
})
