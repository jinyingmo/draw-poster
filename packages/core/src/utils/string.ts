const EMOJIS: RegExp[] = [
  /\ud83c[\udde6-\uddff]\ud83c[\udde6-\uddff]/,
  /\ud83c\udff4(?:\udb40[\udc20-\udc7e])+?\udb40\udc7f/,
  /[\ud800-\udbff][\udc00-\udfff]/,
  /[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194\u2195\u2196\u2197\u2198\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263a\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u26F9\u2702\u2708\u2709\u270C\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u2764\u27A1\u2934\u2935\u2B05-\u2b07\u3030\u303D\u3297\u3299\u261D\u26F9\u270A-\u270d]/
]
const EMOJI_JOINER = /\u200d/
const RE_JOINER = new RegExp('^' + EMOJI_JOINER.source)
const EMOJI_TESTER = new RegExp('(?:' + EMOJIS.map((re) => re.source).join('|') + ')')
const TEXT_TYPE = 'TEXT_TYPE'
const OTHER_TYPE = 'OTHER_TYPE'

type Segment = {
  text: string
  type: typeof TEXT_TYPE | typeof OTHER_TYPE
}

function matchJoined(str: string) {
  let matched = ''
  const matchedJoiner = str.match(RE_JOINER)
  if (matchedJoiner) {
    matched += matchedJoiner[0]
    str = str.substr(matchedJoiner[0].length)
    matched += matchOneEmoji(str)
  }
  return matched
}

function matchOneEmoji(str: string) {
  let matched = ''
  const emojiTester = EMOJI_TESTER
  if (emojiTester.test(str)) {
    const reEmoji = EMOJI_TESTER
    const matchedEmoji = str.match(reEmoji)
    if (!matchedEmoji) {
      return matched
    }
    matched += matchedEmoji[0]
    str = str.substr(str.indexOf(matched) + matchedEmoji[0].length)
    matched += matchJoined(str)
  }
  return matched
}

export function splitToSegment(str = ''): Segment[] {
  const arr: Segment[] = []
  while (str.length > 0) {
    const matched = matchOneEmoji(str)
    if (matched) {
      const firstIndex = str.indexOf(matched)
      if (firstIndex > 0) {
        arr.push({
          text: str.slice(0, firstIndex),
          type: TEXT_TYPE
        })
      }
      arr.push({
        text: matched,
        type: OTHER_TYPE
      })
      str = str.slice(firstIndex + matched.length)
    } else {
      arr.push({
        text: str,
        type: TEXT_TYPE
      })
      str = ''
    }
  }
  return arr
}

export function len(str = '') {
  let length = 0
  const segmentArr = splitToSegment(str)
  for (let i = 0; i < segmentArr.length; i++) {
    if (segmentArr[i].type === TEXT_TYPE) {
      length += segmentArr[i].text.length
    } else {
      length += 1
    }
  }
  return length
}
