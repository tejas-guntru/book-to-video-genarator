
export enum Stage {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  SUMMARIZING = 'SUMMARIZING',
  CREATING_SCRIPT = 'CREATING_SCRIPT',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  DONE = 'DONE',
}

export interface VideoScriptScene {
  scene: number;
  visual: string;
  narration: string;
}
