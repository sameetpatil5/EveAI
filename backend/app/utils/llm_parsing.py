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
    """Sanitize JSON-ish text by escaping literal newlines inside string values.

    This is a conservative sanitizer: it walks the text and when inside a
    double-quoted string it replaces raw newlines and carriage returns with
    explicit escape sequences. It does not attempt full JSON repair but fixes
    the common issue where LLMs place unescaped newlines inside quoted values.
    """
    if raw is None:
        return raw

    out_chars = []
    in_string = False
    escape = False
    for ch in raw:
        if escape:
            # previous was a backslash, include char verbatim
            out_chars.append(ch)
            escape = False
            continue

        if ch == "\\":
            out_chars.append(ch)
            escape = True
            continue

        if ch == '"':
            out_chars.append(ch)
            in_string = not in_string
            continue

        if in_string:
            if ch == "\n":
                out_chars.append("\\n")
                continue
            if ch == "\r":
                out_chars.append("\\r")
                continue
        out_chars.append(ch)

    return "".join(out_chars)
