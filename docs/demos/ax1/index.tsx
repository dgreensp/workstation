import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'
import { useLiveVar, useListen } from 'lib/live'

function App() {
  const input = useLiveVar(() => '')
  const inputValue = useListen(input)

  return (
    <main role="main" className="container mt-5">
      <div className="row">
        <div className="col-sm colLeft">
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
        <div className="col-sm colRight">
          <div className="px-3 pt-4">
            <ParserOutput input={inputValue} />
          </div>
        </div>
      </div>
    </main>
  )
}

function ParserOutput({ input }: { input: string }) {
  const result = useMemo(() => parseAx(input), [input])
  const formattedResult = JSON.stringify(result, null, 2)
  const prettyPrinted =
    result.type === 'success' ? prettyPrint(result.result, 80) : null
  return (
    <pre>
      <code className={result.type}>
        {result.type === 'success' ? prettyPrinted : formattedResult}
      </code>
    </pre>
  )
}

interface Ax {
  readonly name: string
  readonly parameters: ReadonlyArray<Ax>
}

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
  leftOnLine = lineLength
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
          leftOnLine - name.length - 1
        )
      )
    }
  } else {
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
            leftOnLine - line.length
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
