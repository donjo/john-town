import { createDefine } from "fresh";

export type State = Record<string, unknown>;

export const define = createDefine<State>();
