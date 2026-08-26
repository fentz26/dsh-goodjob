/**
 * GoodJob configuration schema: the validated face of {@link ./config-types.ts}
 * for composition and the user settings document.
 * @module dsh-goodjob/config
 */
import z from '@deepseek-ai/schemastery';
import { DEFAULTS } from './config-types.ts';
import type { Config } from './config-types.ts';
export { DEFAULTS };
export type { Config };
/** The validated configuration schema. */
export declare const ConfigSchema: z<Config>;
