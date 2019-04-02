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
  return (
    <pre>
      <code className={result.type}>{JSON.stringify(result, null, 2)}</code>
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
    parameters: partial.parameters ? partial.parameters.map(completeAx) : NO_PARAMETERS,
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

function parseAx(input: string): ParseResult {
  const lines = input.split('\n')
  let indentSpacesCount = 0
  const INDENT_SIZE = 2;
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
    const wordMatch = s.match(/\S+/y)
    if (!wordMatch) {
      return failure('expected command')
    }
    const newCommand = { name: wordMatch[0] }
    pushParameter(currentCommand, newCommand)
    currentCommand = newCommand
    commandStack.push(newCommand)
    indentSpacesCount += INDENT_SIZE
    if (!s.match(/$/my)) {
      return failure('expected end of line')
    }
    lineNumber++
  }
  return { type: 'success', result: completeAx(root) }
}

const root = document.getElementById('root')
ReactDOM.render(<App />, root)
