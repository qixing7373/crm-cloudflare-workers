#!/usr/bin/env python3
import pathlib, re

src = pathlib.Path(__file__).parent / 'src'
ptn = re.compile(r'(?:i18n\.)?\$?\b_?t\(\s*[\'"]([^\'"]+)[\'"]\s*\)')
keys = set()

for f in src.rglob('*'):
    if f.suffix in ['.vue', '.ts'] and f.is_file():
        keys.update(m for m in ptn.findall(f.read_text('utf-8')) if m.strip())

out = src / 'i18n' / 'zh-CN.txt'
out.write_text('\n'.join(sorted(keys)) + '\n', 'utf-8')
print(f"Extracted {len(keys)} keys.")
