export type Matcher = (start: number, source: string) => number | null
export type TotalMatcher = (start: number, source: string) => number

type PartialMatcher<M extends Matcher> = M extends TotalMatcher ? never : M
type MatcherReturning<R> = (start: number, source: string) => R

export function exact(text: string): Matcher {
  return (start, source) => {
    const end = start + text.length
    return source.slice(start, end) === text ? end : null
  }
}

function makeSticky(re: RegExp): RegExp {
  let flags = re.flags
  if (!flags.includes('y')) {
    flags = flags + 'y'
  }
  return new RegExp(re.source, flags)
}

export function regex(re: RegExp): Matcher {
  re = makeSticky(re)
  return (start, source) => {
    re.lastIndex = start
    const result = re.exec(source)
    return result ? re.lastIndex : null
  }
}

export function takeRegex(re: RegExp): TotalMatcher {
  const m = regex(re)
  return (start, source) => {
    const result = m(start, source)
    return result === null ? start : result
  }
}

export function zeroOrMore<M extends Matcher>(
  m: PartialMatcher<M>
): TotalMatcher {
  return (start, source) => {
    let current = start
    let result: number | null
    while ((result = m(current, source)) !== null) {
      if (result === current) {
        break
      }
      current = result
    }
    return current
  }
}

export function oneOrMore<M extends Matcher>(m: PartialMatcher<M>): Matcher {
  return seq(m, zeroOrMore(m))
}

export function seq(m: TotalMatcher, ...mm: TotalMatcher[]): TotalMatcher
export function seq(m: Matcher, ...mm: Matcher[]): Matcher
export function seq<R extends number | null>(
  m: MatcherReturning<R>,
  ...mm: MatcherReturning<R>[]
): MatcherReturning<R> {
  return (start, source) => {
    let result = m(start, source)
    if (result === null) {
      return result
    }
    for (let i = 0; i < mm.length; i++) {
      const newStart: number | null = result
      if (newStart === null) {
        return result
      }
      result = mm[i](newStart, source)
    }
    return result
  }
}

