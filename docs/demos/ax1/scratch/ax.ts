/*enum AxTokenType {
  BLANK_LINE,
  STRING,
}

interface AxStringToken {
  readonly type: AxTokenType.STRING
  readonly value: string
  readonly children: AxToken[]
  readonly comment?: string
}

interface AxBlankLineToken {
  readonly type: AxTokenType.BLANK_LINE
  readonly comment?: string
}

type AxToken = AxStringToken | AxBlankLineToken

interface AxStringTokenBuilder {
  addChild(child: AxToken): void
  setComment(comment: string): void
  build(): AxStringToken
}

interface AxStringTokenBuilderConfig {
  value: string
}

const EMPTY_ARRAY = Object.seal([])

function createAxStringTokenBuilder(
  config: AxStringTokenBuilderConfig
): AxStringTokenBuilder {
  const { value } = config
  let children: AxToken[] | undefined
  let comment: string | undefined
  return {
    addChild(child: AxToken): void {
      children = children || []
      children.push(child)
    },
    setComment(newComment: string): void {
      comment = newComment
    },
    build(): AxStringToken {
      return {
        type: AxTokenType.STRING,
        value,
        comment,
        children: children || EMPTY_ARRAY,
      }
    },
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
*/