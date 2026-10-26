"use client";

import { Select } from "@/components/ui";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Portrait } from "@/app/game/art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "@/app/game/battle/labels";
import RigPreview from "./RigPreview";
import type { CharacterPreview } from "./types";

const number = new Intl.NumberFormat("vi-VN");
const bytes = (value: number) => `${(value / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} KB (${number.format(value)} byte)`;

function CharacterDetails({ character, size }: { character: CharacterPreview; size: "battle" | "large" }) {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const total = character.files.reduce((sum, file) => sum + file.bytes, 0);
  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Portrait id={character.id} element={character.element} profession={character.profession} className="size-16 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-xl font-bold">{character.name}</h2>
          <p className="text-sm text-stone-400">{PROFESSION_NAME[character.profession]} · {ELEMENT_NAME[character.element]}</p>
          <p className="mt-1 text-xs text-stone-400">Rig trong trận: {bytes(character.rigBytes)} · Tất cả: {bytes(total)}</p>
        </div>
      </header>
      <RigPreview id={character.id} size={size} onSnapshot={setSnapshot} />
      <section aria-label="Tranh nhân vật" className="space-y-3">
        <h2 className="text-lg font-semibold">Đối chiếu hình ảnh</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {character.assets.map((asset) => (
            <figure key={asset.kind} data-art={asset.kind} className="min-w-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-900/60">
              <div className="relative flex aspect-[4/5] items-center justify-center bg-[radial-gradient(ellipse_at_center,#40372d,transparent)] p-2">
                {asset.file ? (
                  <Image src={asset.file.url} alt={`${asset.label} của ${character.name}`} width={640} height={640} unoptimized
                    className="h-full w-full object-contain" />
                ) : asset.kind === "standing" && snapshot ? (
                  <Image src={snapshot} alt={`Rig đứng của ${character.name}`} width={640} height={640} unoptimized className="h-full w-full object-contain" />
                ) : asset.kind === "portrait" ? (
                  <Portrait id={character.id} element={character.element} profession={character.profession} className="w-3/4" />
                ) : (
                  <p className="p-3 text-center text-sm text-stone-500">{asset.kind === "standing" ? "Đang dựng hình…" : "Chưa có tranh riêng"}</p>
                )}
              </div>
              <figcaption className="space-y-1 border-t border-stone-700 p-2 text-xs">
                <h3 className="font-semibold text-stone-100">{asset.label}</h3>
                {asset.file ? (
                  <>
                    <a href={asset.file.url} target="_blank" rel="noreferrer" className="block break-all text-amber-300 underline decoration-amber-900">{asset.file.name}</a>
                    <p className="text-stone-400">{bytes(asset.file.bytes)}</p>
                  </>
                ) : (
                  <p className="text-stone-400">{asset.kind === "standing" ? `Ghép từ lớp rig · ${bytes(character.rigBytes)}` : asset.kind === "portrait" ? "Chân dung SVG mặc định" : asset.kind === "style" ? "Chưa có tranh phong thái" : "Dùng hoạt ảnh của rig"}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <details className="rounded-xl border border-stone-700 bg-black/20 p-3 text-sm">
        <summary className="cursor-pointer font-medium">Các file ({character.files.length}) · {bytes(total)}</summary>
        <ul className="mt-3 divide-y divide-stone-800">
          {character.files.map((file) => (
            <li key={file.url} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 text-xs">
              <a href={file.url} target="_blank" rel="noreferrer" className="break-all text-amber-300">{file.name}</a>
              <span className="text-stone-400">{bytes(file.bytes)}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function CharacterPreviewer({ characters }: { characters: readonly CharacterPreview[] }) {
  const query = useSearchParams();
  const [size, setSize] = useState<"battle" | "large">("battle");
  const character = characters.find((c) => c.id === query.get("id")) ?? characters.find((c) => c.id === "nguyenBac") ?? characters[0];
  if (!character) return <p>Chưa có nhân vật có hình động.</p>;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-amber-900/70 bg-black/20 p-3">
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          Nhân vật
          <Select value={character.id} onChange={(event) => {
            const url = new URL(window.location.href);
            url.searchParams.set("id", event.target.value);
            window.history.pushState(null, "", `${url.pathname}${url.search}`);
          }} className="min-w-0">
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Kích cỡ hình động">
          {(["battle", "large"] as const).map((value) => (
            <button key={value} type="button" aria-pressed={size === value} onClick={() => setSize(value)}
              className="rounded-lg border border-stone-600 px-3 py-2 text-sm aria-pressed:border-amber-300 aria-pressed:bg-amber-900/50">
              {value === "battle" ? "Cỡ trong trận" : "Cỡ lớn"}
            </button>
          ))}
        </div>
      </div>
      <CharacterDetails key={character.id} character={character} size={size} />
    </div>
  );
}
