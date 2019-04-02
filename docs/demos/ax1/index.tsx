import React, { useMemo, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useLiveVar, useListen } from 'lib/live'
import { Nav, NavItem, NavLink } from 'reactstrap'

function App() {
  const input = useLiveVar(() => '')
  const inputValue = useListen(input)

  return (
    <main role="main" className="container mt-3">
      <div className="row">
        <div className="col-md colLeft">
          <div className="px-3 pt-4">
            <div className="inputWrapper">
              <textarea
                className="form-control text-monospace input"
                value={inputValue}
                onChange={e => input(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="col-md colRight">
          <div className="px-3">
            <TabbedOutput input={inputValue} />
          </div>
        </div>
      </div>
    </main>
  )
}


function TabbedOutput({ input }: { input: string }) {
  const [mode, setMode] = useState('Pretty Printer')
  const setModeParser = useCallback(() => setMode('Parser'), [])
  const setModePrettyPrinter = useCallback(() => setMode('Pretty Printer'), [])
  const setModeDOM = useCallback(() => setMode('DOM'), [])
  return (
    <>
      <Nav className="mb-4" tabs>
        <NavItem>
          <NavLink href="#" active={mode === 'Parser'} onClick={setModeParser}>
            Parser
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={mode === 'Pretty Printer'}
            onClick={setModePrettyPrinter}
          >
            Pretty Printer
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="#" active={mode === 'DOM'} onClick={setModeDOM}>
            DOM
          </NavLink>
        </NavItem>
      </Nav>
      <ParserOutput input={input} mode={mode} />
    </>
  )
}

function ParserOutput({ input, mode }: { input: string; mode: string }) {
  const result = useMemo(() => parseAx(input), [input])
  if (result.type === 'failure') {
    return (
      <pre>
        <code className="failure">{JSON.stringify(result, null, 2)}</code>
      </pre>
    )
  }
  const parsed = result.result
  if (mode === 'DOM') {
    try {
      return toDOM(parsed)
    } catch (e) {
      return <span className="failure">{e.message}</span>
    }
  } else if (mode === 'Pretty Printer') {
    const prettied = prettyPrint(parsed, 40)
    return (
      <pre>
        <code>{prettied}</code>
      </pre>
    )
  } else {
    return (
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    )
  }
}

function toDOM(ax: Ax, key = 0): React.ReactElement {
  if (!ax.name) {
    const children = []
    let i = 0
    for (const parameter of ax.parameters) {
      children.push(toDOM(parameter, i))
      i++
    }
    return <React.Fragment key={key}>{children}</React.Fragment>
  }
  if (ax.name === 'div') {
    const attributes = {} as any
    const children = []
    let i = 0
    for (const parameter of ax.parameters) {
      const { name, parameters } = parameter
      if (name === 'class') {
        attributes.className = parameters.map(toClassName).join(' ')
      } else if (name === 'style') {
        attributes.style = toStyleDictionary(parameters)
      } else {
        children.push(toDOM(parameter, i))
      }
      i++
    }
    return (
      <div {...attributes} key={key}>
        {children}
      </div>
    )
  } else if (ax.name === 'text') {
    return (
      <React.Fragment key={key}>
        {ax.parameters.map(a => toStringLiteral(a))}
      </React.Fragment>
    )
  } else {
    throw new Error('unknown command: ' + ax.name)
  }
}

function toStyleDictionary(ax: AxParameters): any {
  const result = {} as any
  for (const { name, parameters } of ax) {
    if (parameters.length !== 1) {
      throw new Error('bad key/value pair')
    }
    const value = toStringLiteral(parameters[0])
    result[name] = value
  }
  return result
}

function toClassName(ax: Ax): string {
  const str = toStringLiteral(ax)
  if (/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(str)) {
    return str
  } else {
    throw new Error('not a class name')
  }
}

function toStringLiteral(ax: Ax): string {
  if (ax.parameters.length) {
    throw new Error('not a string literal: ' + ax.name)
  }
  return ax.name
}

interface Ax {
  readonly name: string
  readonly parameters: AxParameters
}

type AxParameters = ReadonlyArray<Ax>

interface PartialAx {
  readonly name: string
  parameters?: PartialAx[]
}

const NO_PARAMETERS = Object.seal([]) // shared object for performance

function pushParameter(command: PartialAx, parameter: PartialAx): void {
  if (!command.parameters) {
    command.parameters = []
  }
  command.parameters.push(parameter)
}

function completeAx(partial: PartialAx): Ax {
  return {
    name: partial.name,
    parameters: partial.parameters
      ? partial.parameters.map(completeAx)
      : NO_PARAMETERS,
  }
}

class Scanner {
  constructor(private input: string) {}
  index = 0
  match(re: RegExp): string[] | undefined {
    if (!re.sticky) {
      throw new Error('reg ex must be sticky')
    }
    re.lastIndex = this.index
    const match = re.exec(this.input)
    if (!match) {
      return undefined
    }
    this.index = re.lastIndex
    return match
  }
  matchAlways(re: RegExp): string[] {
    return this.match(re) || ['']
  }
}

interface ParseSuccess {
  type: 'success'
  result: Ax
}

interface ParseFailure {
  type: 'failure'
  errors: { lineNumber: number; message: string }[]
}

type ParseResult = ParseSuccess | ParseFailure

const WORD_REGEX = /[^\s":,]+/y

function parseName(s: Scanner): string | null {
  const stringMatch = s.match(/"([^"\\]*|\\["\\bfnrt\/]|\\u[0-9a-f]{4})*"/y)
  if (stringMatch) {
    return JSON.parse(stringMatch[0])
  } else {
    const wordMatch = s.match(WORD_REGEX)
    if (wordMatch) {
      return wordMatch[0]
    }
  }
  return null
}

function parseLinearCommandExpression(
  s: Scanner
): { firstCommand: PartialAx; lastCommand: PartialAx } | string {
  const name = parseName(s)
  if (name === null) {
    return 'Expected command'
  }
  const firstCommand = { name }
  let lastCommand = firstCommand
  while (s.match(/ /y)) {
    const subname = parseName(s)
    if (subname === null) {
      return 'Expected command as parameter'
    }
    const subcommand = { name: subname }
    pushParameter(lastCommand, subcommand)
    lastCommand = subcommand
  }
  return { firstCommand, lastCommand }
}

const INDENT_SIZE = 2

function parseAx(input: string): ParseResult {
  const lines = input.split('\n')
  let indentSpacesCount = 0
  const root: PartialAx = { name: '' }
  let currentCommand = root
  const commandStack = [root]
  let lineNumber = 1
  function failure(message: string): ParseFailure {
    return { type: 'failure', errors: [{ lineNumber, message }] }
  }
  for (const line of lines) {
    const s = new Scanner(line)
    const [spaces] = s.matchAlways(/ */y)
    while (spaces.length <= indentSpacesCount - INDENT_SIZE) {
      commandStack.pop()
      currentCommand = commandStack[commandStack.length - 1]
      indentSpacesCount -= INDENT_SIZE
    }
    if (spaces.length !== indentSpacesCount) {
      return failure('indent')
    }

    const lceResult = parseLinearCommandExpression(s)
    if (typeof lceResult === 'string') {
      return failure(lceResult)
    }
    const { firstCommand, lastCommand } = lceResult
    let eolCommand = lastCommand
    pushParameter(currentCommand, firstCommand)
    currentCommand = lastCommand
    indentSpacesCount += INDENT_SIZE

    if (s.match(/: /y)) {
      const colonCommand = currentCommand
      const lce1 = parseLinearCommandExpression(s)
      if (typeof lce1 === 'string') {
        return failure(lce1)
      }
      const { firstCommand, lastCommand } = lce1
      pushParameter(colonCommand, firstCommand)
      eolCommand = lastCommand
      if (!s.match(/, /y)) {
        return failure('Expected comma')
      }
      do {
        const lce = parseLinearCommandExpression(s)
        if (typeof lce === 'string') {
          return failure(lce)
        }
        const { firstCommand, lastCommand } = lce
        pushParameter(colonCommand, firstCommand)
        eolCommand = lastCommand
      } while (s.match(/, /y))
    }

    currentCommand = eolCommand
    commandStack.push(currentCommand)

    if (!s.match(/$/my)) {
      return failure('Expected end of line')
    }
    lineNumber++
  }
  return { type: 'success', result: completeAx(root) }
}

function prettyPrintName(name: string): string {
  WORD_REGEX.lastIndex = 0
  if (WORD_REGEX.exec(name) && WORD_REGEX.lastIndex === name.length) {
    return name
  }
  return JSON.stringify(name)
}

const SPACES_MEMO = new Map<number, string>()
function getSpaces(count: number): string {
  if (!SPACES_MEMO.has(count)) {
    SPACES_MEMO.set(count, new Array(count + 1).join(' '))
  }
  return SPACES_MEMO.get(count)!
}

function prettyPrint(ax: Ax, lineLength: number): string {
  if (!ax.name) {
    // root
    return ax.parameters.map(a => doPrettyPrint(a, lineLength)).join('')
  }
  return doPrettyPrint(ax, lineLength)
}

function doPrettyPrint(
  ax: Ax,
  lineLength: number,
  indentSpacesCount = 0,
  leftOnLine = lineLength,
  afterComma = false
): string {
  const name = prettyPrintName(ax.name)
  const firstParameter = ax.parameters[0]
  if (!firstParameter) {
    return name + '\n'
  }
  if (ax.parameters.length === 1) {
    if (
      name.length + 1 + prettyPrintName(firstParameter.name).length <=
      leftOnLine
    ) {
      return (
        name +
        ' ' +
        doPrettyPrint(
          firstParameter,
          lineLength,
          indentSpacesCount,
          leftOnLine - name.length - 1,
          afterComma
        )
      )
    }
  } else if (!afterComma) {
    const lastParameter = ax.parameters[ax.parameters.length - 1]
    const allButLastParameter = ax.parameters
      .slice(0, -1)
      .map(prettyPrintLinearLine)
    if (allButLastParameter.every(x => x !== null)) {
      const line = name + ': ' + allButLastParameter.join(', ') + ', '
      if (
        line.length + prettyPrintName(lastParameter.name).length <=
        leftOnLine
      ) {
        return (
          line +
          doPrettyPrint(
            lastParameter,
            lineLength,
            indentSpacesCount,
            leftOnLine - line.length,
            true
          )
        )
      }
    }
  }

  const newIndent = indentSpacesCount + INDENT_SIZE
  return (
    name +
    '\n' +
    ax.parameters
      .map(
        a =>
          getSpaces(newIndent) +
          doPrettyPrint(a, lineLength, newIndent, lineLength - newIndent)
      )
      .join('')
  )
}

function prettyPrintLinearLine(ax: Ax): string | null {
  const firstParameter = ax.parameters[0]
  if (!firstParameter) {
    return prettyPrintName(ax.name)
  } else if (ax.parameters.length === 1) {
    const parameter = prettyPrintLinearLine(firstParameter)
    if (parameter !== null) {
      return prettyPrintName(ax.name) + ' ' + parameter
    } else {
      return null
    }
  } else {
    return null
  }
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
