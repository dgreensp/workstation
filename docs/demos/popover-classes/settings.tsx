import React from 'react'
import { Label, Input, Form, FormGroup } from 'reactstrap';
import { createLiveVar, Listen } from './live';

export function createSettings() {
  return {
    showArrow: createLiveVar(false),
    forceOpen: createLiveVar(false),
  }
}

export type Settings = ReturnType<typeof createSettings>

export function SettingsForm({ settings }: {settings: Settings}) {
  return <Listen to={settings}>
    {({ showArrow, forceOpen }) => <Form>
      <FormGroup check>
        <Label check>
          <Input type="checkbox" id="showArrow" checked={showArrow} onChange={e => settings.showArrow(e.target.checked)} />
          {' '}Show Arrow
      </Label>
      </FormGroup>
      <FormGroup check>
        <Label check>
          <Input type="checkbox" id="forceOpen" checked={forceOpen} onChange={e => settings.forceOpen(e.target.checked)} />
          {' '}Force Open
      </Label>
      </FormGroup>
    </Form>
    }
  </Listen>
}
