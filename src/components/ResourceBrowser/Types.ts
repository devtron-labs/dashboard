import React from 'react'
import { MultiValue } from 'react-select'
import { ResponseType } from '../../services/service.types'
import { LabelTag, OptionType } from '../app/types'

export interface ResourceDetail {
  name: string
  status: string
  namespace: string
  age: string
  ready: string
  restarts: string
}

export interface ResourceListListResponse extends ResponseType {
    result?: ResourceDetail[]
}