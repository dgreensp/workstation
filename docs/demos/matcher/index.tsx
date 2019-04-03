import { exact, seq, zeroOrMore, regex, takeRegex } from './Matcher'


const a = exact('a')
const b = zeroOrMore(a)
const c = seq(b, takeRegex(/[bc]/))
console.log(c(1, 'baaabd'))
