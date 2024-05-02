import { writeFileSync } from "node:fs";
import { basename } from "node:path";
import { type CharacterDict, KeyCharacters } from "@keybr/keyboard";
import { formatCodePointName, formatCodePointValue } from "./codepoints.ts";
import { characterKeys } from "./keys.ts";
import { type KeyMap, toCharacterDict } from "./layout.ts";

export function writeGeneratedFile(keymap: KeyMap, filename: string): void {
  const id = basename(filename, ".ts")
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(".", "_");
  const dict = toCharacterDict(keymap);
  const sourceFile = generateSourceFile(id, dict);
  writeFileSync(filename, sourceFile);
}

export function generateSourceFile(id: string, dict: CharacterDict): string {
  const lines: string[] = [];
  lines.push("// Generated file, do not edit.");
  lines.push("");
  lines.push('import { type CharacterDict } from "../types.ts";');
  lines.push("");
  lines.push("// prettier-ignore");
  lines.push(`export const LAYOUT_${id}: CharacterDict = {`);
  for (const keyId of characterKeys) {
    const characters = [...(dict[keyId] ?? [])];
    while (characters.length > 0 && characters.at(-1) == null) {
      characters.pop();
    }
    if (characters.length > 0) {
      const fields = characters.map((character) => {
        if (KeyCharacters.isCodePoint(character)) {
          const name = formatCodePointName(character);
          const value = formatCodePointValue(character);
          return `/* ${name} */ ${value}`;
        }
        return `null`;
      });
      lines.push(`  ${keyId}: [${fields.join(", ")}],`);
    }
  }
  lines.push("};");
  lines.push("");
  return lines.join("\n");
}
