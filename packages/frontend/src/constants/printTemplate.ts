export const PRINT_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    max-width: 760px;
    margin: 40px auto;
    padding: 0 32px;
    color: #000;
  }
  h1 { font-size: 22pt; margin: 0 0 4px; border-bottom: 2px solid #000; padding-bottom: 6px; }
  h2 { font-size: 13pt; border-bottom: 1px solid #aaa; padding-bottom: 3px; margin: 24px 0 10px; }
  h3 { font-size: 11pt; margin: 14px 0 4px; }
  p  { margin: 6px 0; }
  a  { color: #000; }
  hr { border: none; border-top: 1px solid #bbb; margin: 18px 0; }
  ul, ol { padding-left: 22px; margin: 6px 0; }
  li { margin: 3px 0; }
  code { font-family: 'Courier New', monospace; font-size: 10pt; background: #f2f2f2; padding: 1px 4px; }
  pre  { background: #f2f2f2; padding: 12px; overflow: auto; }
  blockquote { border-left: 3px solid #aaa; margin: 8px 0 8px 12px; padding-left: 12px; color: #444; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #ccc; padding: 5px 10px; text-align: left; }
  th { background: #f2f2f2; font-weight: bold; }
  @media print {
    body { margin: 0; padding: 24px 32px; }
  }
`

export function generatePrintHtml(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  <style>
    ${PRINT_STYLES}
  </style>
</head>
<body>${content}</body>
</html>`
}
