import assert from "node:assert/strict";
import test from "node:test";
import { applyProfileAction, newProfile, parseProfileAction, type ProfileAction } from "@/core";

test("chooseLeader lưu hệ và nghề của thủ lĩnh", () => {
  const r = applyProfileAction(newProfile(), { type: "chooseLeader", element: "hoa", profession: "xaThu" });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.profile.element, "hoa");
    assert.equal(r.profile.profession, "xaThu");
  }
});

test("chooseLeader từ chối hệ hoặc nghề lạ", () => {
  const bad = { type: "chooseLeader", element: "xxx", profession: "tuongSi" } as unknown as ProfileAction;
  assert.equal(applyProfileAction(newProfile(), bad).ok, false);
  const bad2 = { type: "chooseLeader", element: "kim", profession: "xxx" } as unknown as ProfileAction;
  assert.equal(applyProfileAction(newProfile(), bad2).ok, false);
});

test("parseProfileAction nhận chooseLeader đúng dạng", () => {
  assert.deepEqual(parseProfileAction({ type: "chooseLeader", element: "kim", profession: "tuongSi" }), {
    type: "chooseLeader",
    element: "kim",
    profession: "tuongSi",
  });
  assert.equal(parseProfileAction({ type: "chooseLeader", element: 1 }), null);
});
