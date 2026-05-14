#!/usr/bin/env python3
"""Markdown → PDF (WeasyPrint, no browser required)."""
import sys, os, re, subprocess

try:
    import markdown
    from weasyprint import HTML
except ImportError:
    sys.exit("pip3 install weasyprint markdown")

def render_mermaid(md, work_dir):
    """Replace ```mermaid blocks with PNG images via Kroki.io."""
    pattern = re.compile(r'```mermaid\n(.*?)```', re.DOTALL)
    matches = list(pattern.finditer(md))
    for i, m in enumerate(matches):
        img = os.path.join(work_dir, f'_m{i}.png')
        txt = os.path.join(work_dir, f'_m{i}.txt')
        open(txt, 'w').write(m.group(1).strip())
        try:
            r = subprocess.run(
                ['curl', '-sf', '-o', img, '-w', '%{http_code}',
                 '-X', 'POST', 'https://kroki.io/mermaid/png',
                 '-H', 'Content-Type: text/plain', '--data-binary', f'@{txt}'],
                capture_output=True, text=True, timeout=30)
            os.remove(txt)
            if r.stdout.strip() == '200' and os.path.exists(img):
                md = md.replace(m.group(0), f'![diagram]({img})')
        except Exception:
            pass
    return md, [os.path.join(work_dir, f'_m{i}.png') for i in range(len(matches))]

def extract_title(md):
    """Extract first H1 as document title for footer."""
    m = re.search(r'^#\s+(.+)', md, re.MULTILINE)
    return m.group(1).split('—')[0].strip() if m else ''

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')

CSS_TEMPLATE = """
@font-face {{
  font-family: 'CJK';
  src: url('{font_dir}/NotoSansSC.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}}
@font-face {{
  font-family: 'CJK';
  src: url('{font_dir}/NotoSansSC.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}}

@page {{ size: A4; margin: 20mm 18mm 25mm 18mm;
  @bottom-center {{ content: "FOOTER  ·  第 " counter(page) " / " counter(pages) " 页";
    font: 9px 'CJK', sans-serif; color: #999; }} }}

body {{ font: 13px/1.8 'CJK', sans-serif; color: #0a1628; }}

h1 {{ font-size: 24px; font-weight: 700; border-bottom: 3px solid #1a56db; padding-bottom: 8px; margin-top: 0; }}
h2 {{ font-size: 19px; font-weight: 700; color: #1a56db; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 28px; }}
h3 {{ font-size: 16px; font-weight: 600; color: #1e429f; margin-top: 20px; }}
h4 {{ font-size: 14px; font-weight: 600; color: #2563eb; margin-top: 16px; }}

table {{ width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; page-break-inside: avoid; }}
th {{ padding: 8px 10px; text-align: left; font-weight: 600; background: #1a56db; color: #fff; }}
td {{ padding: 6px 10px; border-bottom: 1px solid #93c5fd; vertical-align: top; }}
tr:nth-child(even) td {{ background: #dbeafe; }}

blockquote {{ border-left: 4px solid #1a56db; background: #dbeafe; margin: 10px 0;
  padding: 10px 16px; font-size: 12px; color: #1e3a5f; page-break-inside: avoid; }}

pre {{ background: #1e3a5f; color: #bfdbfe; padding: 12px 14px; border-radius: 6px;
  font: 11px/1.5 Menlo, "Courier New", monospace; white-space: pre-wrap; page-break-inside: avoid; }}
code {{ background: #bfdbfe; padding: 1px 4px; border-radius: 3px;
  font: 11px Menlo, "Courier New", monospace; color: #1e429f; }}
pre code {{ background: none; padding: 0; color: inherit; }}

hr {{ border: none; border-top: 2px solid #3b82f6; margin: 20px 0; }}
strong {{ color: #1e429f; }}
a {{ color: #1a56db; text-decoration: none; }}
li {{ margin: 3px 0; }}
ol, ul {{ padding-left: 2em; }}
ol li, ul li {{ margin: 4px 0; }}
img {{ max-width: 100%; display: block; margin: 12px auto; border-radius: 8px; }}
"""

def main():
    if len(sys.argv) != 3:
        sys.exit("Usage: md2pdf.py <input.md> <output.pdf>")

    src, dst = sys.argv[1], sys.argv[2]
    work_dir = os.path.dirname(os.path.abspath(src))

    md = open(src, encoding='utf-8').read()
    title = extract_title(md)
    md, tmp_files = render_mermaid(md, work_dir)

    html_body = markdown.markdown(md, extensions=['tables', 'fenced_code', 'codehilite', 'toc', 'nl2br'],
        extension_configs={'codehilite': {'css_class': 'highlight', 'guess_lang': False}})

    css = CSS_TEMPLATE.format(font_dir=FONT_DIR).replace('FOOTER', title)
    html = f'<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>{css}</style></head><body>{html_body}</body></html>'

    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    import logging; logging.getLogger("weasyprint").setLevel(logging.WARNING); logging.getLogger("weasyprint").addHandler(logging.StreamHandler()); HTML(string=html, base_url=work_dir).write_pdf(dst)
    print(f"PDF generated: {dst}")

    for f in tmp_files:
        if os.path.exists(f): os.remove(f)

if __name__ == '__main__':
    main()
