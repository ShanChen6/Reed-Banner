import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { GET } from "../../src/app/api/battles/[id]/route";
import { POST } from "../../src/app/api/battles/[id]/actions/route";

describe("xác thực route trận online", () => {
  it("ẩn trận khi GET hoặc POST action không có cookie tài khoản hợp lệ", async () => {
    const params = Promise.resolve({ id: "m_private" });
    const get = await GET(
      new NextRequest("http://localhost/api/battles/m_private"),
      { params },
    );
    assert.equal(get.status, 404);
    const getBody = await get.json();
    assert.equal(getBody.error, "notFound");
    assert.equal(typeof getBody.now, "number");

    const post = await POST(
      new NextRequest("http://localhost/api/battles/m_private/actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          seq: 0,
          action: { type: "nextWave" },
        }),
      }),
      { params },
    );
    assert.equal(post.status, 404);
    assert.equal((await post.json()).error, "notFound");
  });
});
