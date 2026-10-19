import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // src/core/ là logic trận đấu: TypeScript thuần, xác định theo seed.
    // Xem docs/tech/kien-truc.md.
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*", "react-dom", "react-dom/*", "next", "next/*", "@/app/*", "node:*"],
              message: "src/core/ chỉ được import TypeScript thuần.",
            },
          ],
        },
      ],
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "Dùng PRNG có seed trong src/core/rng.ts." },
        { object: "Date", property: "now", message: "Logic trận đấu không được đọc giờ hệ thống." },
      ],
      "no-restricted-globals": ["error", "window", "document", "localStorage", "fetch", "crypto"],
    },
  },
]);
