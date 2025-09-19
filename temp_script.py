from pathlib import Path
path = Path('frontend/src/components/ui/Pagination.tsx')
text = path.read_text(encoding='utf-8')
target = "              className={}\n"
new = """              className={}\n"""
if target not in text:
    raise SystemExit('target pattern not found')
path.write_text(text.replace(target, new, 1), encoding='utf-8')
