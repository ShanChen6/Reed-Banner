import assert from 'node:assert/strict';
import { it } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkDocs, collectAnchors, extractLinks, slugify } from '../../scripts/check-docs';

it('slug giữ chữ có dấu và bỏ dấu câu như GitHub', () => {
  assert.equal(slugify('5. Tinh thần F (riêng từng tướng, hiện hành)'), '5-tinh-thần-f-riêng-từng-tướng-hiện-hành');
  assert.equal(slugify('2.1 Đánh trùm (Claude đặt 20/10/2026)'), '21-đánh-trùm-claude-đặt-20102026');
  assert.equal(slugify('Dùng `code` và [link](x.md)'), 'dùng-code-và-link');
});

it('anchor gồm tiêu đề trùng tên và thẻ <a id>', () => {
  const anchors = collectAnchors('# A\n## Mục\n## Mục\n<a id="haVan"></a>\n```\n# không tính\n```\n');
  assert.deepEqual([...anchors].sort(), ['a', 'havan', 'mục', 'mục-1']);
});

it('bỏ qua link trong code và link ngoài', () => {
  const links = extractLinks('[a](a.md) `[b](b.md)` [c](https://x.y)\n```\n[d](d.md)\n```\n![e](img/e.png#x)');
  assert.deepEqual(links, [
    { line: 1, url: 'a.md' },
    { line: 5, url: 'img/e.png#x' },
  ]);
});

it('tài liệu trong repo hợp lệ', () => {
  const issues = checkDocs(process.cwd());
  assert.deepEqual(issues, [], issues.map((i) => `${i.file}:${i.line} ${i.message}`).join('\n'));
});

it('báo thiếu dòng trạng thái và dòng "Đã xóa" trỏ tới file vẫn còn', () => {
  // Ghép đường dẫn bằng hàm để chính file test này không bị tính là nhắc tới tài liệu không tồn tại.
  const doc = (name: string) => ['docs', name].join('/');
  const root = mkdtempSync(path.join(tmpdir(), 'check-docs-'));
  try {
    mkdirSync(path.join(root, 'docs'));
    writeFileSync(path.join(root, doc('co-nhan.md')), '# Có nhãn\n\n> Trạng thái: **REFERENCE**\n');
    writeFileSync(path.join(root, doc('thieu-nhan.md')), '# Thiếu nhãn\n\nNội dung.\n');
    writeFileSync(path.join(root, doc('nhan-cu.md')), '# Nhãn cũ\n\n> Trạng thái: **SUPERSEDED**\n');
    writeFileSync(path.join(root, doc('MOVED.md')), [
      '# Đường dẫn đã chuyển', '', '> Trạng thái: **REFERENCE**', '',
      '| Đường dẫn | Lý do |', '|---|---|',
      `| \`${doc('co-nhan.md')}\` | Xóa 12/11/2026: thử |`,
      `| \`${doc('da-xoa-that.md')}\` | Xóa 12/11/2026: thử |`, '',
    ].join('\n'));
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    const messages = checkDocs(root).map((i) => `${i.file} ${i.message}`);
    assert.ok(messages.some((m) => m.startsWith(`${doc('thieu-nhan.md')} thiếu dòng`)), messages.join('\n'));
    assert.ok(messages.some((m) => m.startsWith(`${doc('nhan-cu.md')} trạng thái "SUPERSEDED"`)), messages.join('\n'));
    assert.ok(messages.some((m) => m === `${doc('MOVED.md')} ghi là đã xóa nhưng vẫn còn: ${doc('co-nhan.md')}`), messages.join('\n'));
    assert.ok(!messages.some((m) => m.includes('da-xoa-that')), messages.join('\n'));
    assert.ok(!messages.some((m) => m.startsWith(doc('co-nhan.md'))), messages.join('\n'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
