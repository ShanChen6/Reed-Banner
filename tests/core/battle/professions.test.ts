import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_PROFESSIONS, ATTACK_TILE, EXPANSION_PROFESSIONS, LEGACY_PROFESSIONS, NEW_PROFESSIONS_ENABLED, PROFESSION_RESOURCE_TILE, isActiveProfession, isLeaderProfession, normalizeProfession } from '../../../src/core/battle/rules';
import { TILE_KINDS, STANDARD_WEIGHTS } from '../../../src/core/board/tiles';

test('canonical catalog has eight unique professions and one marksman namespace', () => {
  assert.equal(ALL_PROFESSIONS.length, 8);
  assert.equal(new Set(ALL_PROFESSIONS).size, 8);
  assert.deepEqual(EXPANSION_PROFESSIONS, ['xaThu', 'satThu']);
  assert.equal(normalizeProfession('cungThu'), 'xaThu');
  for (const profession of ALL_PROFESSIONS) {
    assert.equal(normalizeProfession(normalizeProfession(profession)), profession);
  }
  for (const invalid of [null, {}, 1, 'archer', '__proto__', 'constructor']) {
    assert.equal(normalizeProfession(invalid), undefined);
  }
});

test('Xạ thủ và Sát thủ đã mở trong trận, Đinh Bộ Lĩnh chọn được cả tám nghề', () => {
  assert.equal(NEW_PROFESSIONS_ENABLED, true);
  for (const profession of LEGACY_PROFESSIONS) assert.equal(isActiveProfession(profession), true);
  for (const profession of EXPANSION_PROFESSIONS) {
    assert.equal(isActiveProfession(profession), true);
    assert.equal(isLeaderProfession(profession), true);
  }
  assert.equal(isActiveProfession('cungThu'), false);
});

test('attack semantics do not create profession tiles or change board probabilities', () => {
  assert.equal(ATTACK_TILE, 'kiem');
  assert.deepEqual(TILE_KINDS, ['kiem', 'amDuong', 'banhChung', 'tim', 'vang', 'sach', 'trong']);
  assert.deepEqual(STANDARD_WEIGHTS, { kiem:18, amDuong:16, banhChung:15, tim:15, vang:11, sach:11, trong:14 });
  assert.equal(Object.values(PROFESSION_RESOURCE_TILE).includes(ATTACK_TILE), false);
  assert.equal(Object.hasOwn(PROFESSION_RESOURCE_TILE, 'xaThu'), false);
  assert.equal(Object.hasOwn(PROFESSION_RESOURCE_TILE, 'satThu'), false);
});
