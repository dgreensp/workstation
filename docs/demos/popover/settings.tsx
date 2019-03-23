import React from 'react'
import { Label, Input, Form, FormGroup } from 'reactstrap';
import { useLiveRef, useLiveRefState } from './LiveRef';

export function useSettings() {
  return {
    showArrow: useLiveRef(false),
    forceOpen: useLiveRef(false),
  }
}

export type Settings = ReturnType<typeof useSettings>;

export function SettingsForm({ settings }: { settings: Settings }) {
  const showArrow = useLiveRefState(settings.showArrow);
  const forceOpen = useLiveRefState(settings.forceOpen)

  return <Form>
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
