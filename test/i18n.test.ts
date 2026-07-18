import { readdirSync, readFileSync, statSync } from "fs"
import { join } from "path"

import en from "../src/i18n/en"

// Use this array for keys that for whatever reason aren't greppable so they
// don't hold your test suite hostage by always failing.
const EXCEPTIONS: string[] = [
  // "welcomeScreen:readyForLaunch",

  /**
   * This translation key actually shows up in a comment describing the usage of the translate
   * function in the src/i18n/translate.ts file. Because this scan doesn't account for commented
   * out code, we must manually exclude it so tests don't fail because of a comment.
   */
  "hello",
]

function iterate(obj, stack, array) {
  for (const property in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      if (typeof (obj as object)[property] === "object") {
        iterate(obj[property], `${stack}.${property}`, array)
      } else {
        array.push(`${stack.slice(1)}.${property}`)
      }
    }
  }

  return array
}

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) return getSourceFiles(path)
    if (/\.(ts|tsx)$/.test(path)) return [path]
    return []
  })
}

function getUsedTranslations() {
  const matcher = /(?:[Tt]x=\{?"([^"]+)"\}?|translate\("([^"]+)"\))/g
  const keys = new Set<string>()

  for (const file of getSourceFiles(join(process.cwd(), "src"))) {
    const contents = readFileSync(file, "utf8")
    for (const match of contents.matchAll(matcher)) {
      const key = match[1] ?? match[2]
      if (key) keys.add(key)
    }
  }

  return [...keys]
}

describe("i18n", () => {
  test("There are no missing keys", () => {
    const allTranslationsDefinedOld = iterate(en, "", [])
    // Replace first instance of "." because of i18next namespace separator
    const allTranslationsDefined = allTranslationsDefinedOld.map((key) => key.replace(".", ":"))
    const allTranslationsUsed = getUsedTranslations()

    for (let i = 0; i < allTranslationsUsed.length; i += 1) {
      if (!EXCEPTIONS.includes(allTranslationsUsed[i])) {
        // You can add keys to EXCEPTIONS (above) if you don't want them included in the test
        expect(allTranslationsDefined).toContainEqual(allTranslationsUsed[i])
      }
    }
  })
})
