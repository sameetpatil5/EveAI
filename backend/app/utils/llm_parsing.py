import re


def extract_json_from_text(text: str) -> str | None:
    """Extract a JSON substring from LLM output.

    Looks for ```json blocks first, then generic {...} block between the
    first '{' and the last '}'. Returns None if nothing found.
    """
    if not text:
        return None

    # look for ```json ... ``` or ``` ... ```
    m = re.search(r"```\s*json\s*(.*?)```", text, flags=re.DOTALL | re.IGNORECASE)
    if not m:
        m = re.search(r"```(.*?)```", text, flags=re.DOTALL)
    if m:
        return m.group(1).strip()

    # fallback: first { to last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]

    return None


def sanitize_json_text(raw: str) -> str:
    """Sanitize JSON-ish text by escaping invalid characters inside string values.

    This sanitizer repairs common LLM JSON issues by:
    - escaping raw newlines, carriage returns, and tabs inside string values
    - escaping unescaped double quotes inside string values
    - escaping stray backslashes that are not part of a valid JSON escape
    - converting other invalid control characters into unicode escapes
    """
    if raw is None:
        return raw

    out_chars = []
    in_string = False
    escape = False
    length = len(raw)

    def _is_likely_string_end(idx: int) -> bool:
        # If the next non-whitespace character is a JSON delimiter and the following
        # structure looks like valid JSON, treat the quote as closing.
        while idx < length and raw[idx] in " \t\r\n":
            idx += 1
        if idx >= length:
            return True
        ch = raw[idx]
        if ch in ":,}]":
            return True
        return False

    i = 0
    while i < length:
        ch = raw[i]

        if escape:
            out_chars.append(ch)
            escape = False
            i += 1
            continue

        if ch == "\\":
            next_char = raw[i + 1] if i + 1 < length else ""
            if next_char in '"\\/bfnrtu':
                out_chars.append(ch)
                escape = True
            else:
                out_chars.append("\\\\")
            i += 1
            continue

        if ch == '"':
            if in_string:
                if _is_likely_string_end(i + 1):
                    out_chars.append(ch)
                    in_string = False
                else:
                    out_chars.append('\\"')
                i += 1
                continue
            out_chars.append(ch)
            in_string = True
            i += 1
            continue

        if in_string:
            if ch == "\n":
                out_chars.append("\\n")
                i += 1
                continue
            if ch == "\r":
                out_chars.append("\\r")
                i += 1
                continue
            if ch == "\t":
                out_chars.append("\\t")
                i += 1
                continue
            if ord(ch) < 0x20:
                out_chars.append(f"\\u{ord(ch):04x}")
                i += 1
                continue

        out_chars.append(ch)
        i += 1

    return "".join(out_chars)
