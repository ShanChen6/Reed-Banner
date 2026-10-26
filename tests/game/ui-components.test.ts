import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, Card, CardHeader, CardBody, CardFooter, CardTitle, FormField, Input, Select, Alert, buttonVariants } from "../../src/components/ui";
import { cn } from "../../src/lib/cn";
import { Pagination } from "../../src/components/ui/Pagination";

describe("shared UI contracts", () => {
  it("buttons do not accidentally submit forms, but support explicit submit", () => {
    assert.match(renderToStaticMarkup(createElement(Button, null, "Lưu")), /type="button"/);
    assert.match(renderToStaticMarkup(createElement(Button, { type: "submit", disabled: true }, "Lưu")), /type="submit"[^>]*disabled=""/);
  });

  it("preserves form submission and validation attributes through shared fields", () => {
    const html = renderToStaticMarkup(FormField({
      label: "Mật khẩu",
      children: createElement(Input, { name: "password", type: "password", required: true, minLength: 8, autoComplete: "new-password", "aria-invalid": true }),
    }));
    assert.match(html, /<label[^>]*>.*Mật khẩu.*<input/);
    for (const attr of ['name="password"', 'type="password"', 'required=""', 'minLength="8"', 'autoComplete="new-password"', 'aria-invalid="true"']) assert.ok(html.includes(attr), attr);
    assert.match(renderToStaticMarkup(createElement(Select, { name: "element", defaultValue: "moc" }, createElement("option", { value: "moc" }, "Mộc"))), /value="moc" selected=""/);
  });

  it("keeps semantic card tags and alert announcements", () => {
    assert.match(renderToStaticMarkup(createElement(Card, { as: "article", "aria-label": "Nhiệm vụ" })), /^<article/);
    assert.match(renderToStaticMarkup(createElement(Alert, null, "Lỗi")), /role="alert"/);
    assert.match(renderToStaticMarkup(createElement(Alert, { tone: "success" }, "Đã lưu")), /role="status"/);
  });

  it("pagination disables unavailable directions and both directions while busy", () => {
    const props = { hasPrevious: false, hasNext: true, onPrevious() {}, onNext() {} };
    const html = renderToStaticMarkup(createElement(Pagination, props));
    assert.match(html, /<nav[^>]*aria-label="Phân trang"/);
    const buttons = html.match(/<button[^>]*>/g)!;
    assert.match(buttons[0]!, /disabled/);
    assert.doesNotMatch(buttons[1]!, /disabled/);
    const busy = renderToStaticMarkup(createElement(Pagination, { ...props, busy: true }));
    assert.equal((busy.match(/disabled=""/g) ?? []).length, 2);
  });

  it("pagination delegates navigation without changing cursor semantics", () => {
    const calls: string[] = [];
    const nav = Pagination({ hasPrevious: true, hasNext: true, onPrevious: () => calls.push("previous"), onNext: () => calls.push("next") });
    nav.props.children[0].props.onClick();
    nav.props.children[2].props.onClick();
    assert.deepEqual(calls, ["previous", "next"]);
  });

  it("caller utility classes override component defaults without dropping typography roles", () => {
    const classes = buttonVariants({ size: "md", className: "px-8 text-sm", fullWidth: true });
    assert.ok(classes.includes("px-8"));
    assert.ok(!classes.split(" ").includes("px-4"));
    assert.ok(!classes.split(" ").includes("text-base"));
    assert.ok(classes.includes("w-full"));
    assert.equal(cn("text-caption text-muted", { "font-bold": true }), "text-caption text-muted font-bold");
    assert.equal(cn("text-heading", "text-sm"), "text-sm");
  });

  it("card composition preserves heading semantics and accepts padding overrides", () => {
    const html = renderToStaticMarkup(createElement(Card, { padding: "none" },
      createElement(CardHeader, null, createElement(CardTitle, null, "Sử ký")),
      createElement(CardBody, { className: "p-6" }, "Nội dung"),
      createElement(CardFooter, null, "Thao tác"),
    ));
    assert.match(html, /<h2[^>]*>Sử ký<\/h2>/);
    assert.match(html, /data-slot="card-body" class="p-6"/);
    assert.doesNotMatch(html.split(">")[0]!, /\bp-4\b/);
  });
});
