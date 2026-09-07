import type { Env as AppEnv } from "../src/env";
import type { D1Migration } from "@cloudflare/vitest-pool-workers";

// The pool exposes bindings as `Cloudflare.Env`; extend it with ours plus the
// migrations array vitest.config.ts injects.
declare global {
  namespace Cloudflare {
    interface Env extends AppEnv {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}
export {};
