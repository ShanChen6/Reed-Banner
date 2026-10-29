import assert from 'node:assert/strict';
import { it } from 'node:test';
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
