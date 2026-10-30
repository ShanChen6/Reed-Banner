/** Read-time compatibility for persisted JSON snapshots. Does not rewrite history or retune a kit. */
export function migrateStoredProfessionAliases<T>(raw:T):T {
  const visit=(value:unknown):unknown=>{
    if(Array.isArray(value))return value.map(visit);
    if(value===null||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).map(([key,item])=>[
      key, (key==='profession'||key==='baseProfession')&&item==='cungThu' ? 'xaThu' : visit(item),
    ]));
  };
  return visit(raw) as T;
}
