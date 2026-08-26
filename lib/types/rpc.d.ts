/** Loopback-only GoodJob operational commands over DSH Connection RPC. */
import type { Context } from '@deepseek-ai/cordis';
/** Logical Connection channel owned by GoodJob. */
export declare const GOODJOB_RPC_CHANNEL = "/goodjob";
/** Register the loopback-only RPC endpoints used by GoodJob's browser half. */
export declare function registerGoodJobRpc(ctx: Context): () => Promise<void>;
