/**
 * 代表一条聊天消息。
 * @param id - 消息的唯一标识符，用于 React 列表渲染的 key。
 * @param role - 消息的发送者，'user' 代表用户，'assistant' 代表 AI。
 * @param content - 消息的文本内容，支持 Markdown 格式。
 * @param plan - 可选的音乐创作计划，当 AI 生成计划时此字段有值。
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  plan?: Plan;
}

// LLM 生成的音乐创作计划 (Plan) 相关类型

/**
 * 歌曲的基本元数据信息。
 */
export interface SongInfo {
  title: string;
  mood: string[];
  genre: string;
  bpm: number;
  key: string;
  timeSignature: string;
  durationSeconds: number;
}

/**
 * 描述歌曲中用到的一个乐器。
 * @param is_drum - 可选属性，如果为 true，表示这是一个鼓组轨道。
 */
export interface Instrument {
  instrumentName: string;
  midiProgram: number;
  role: string;
  is_drum?: boolean;
  status: 'pending' | 'generating' | 'generated';
}

/**
 * 描述歌曲结构中的一个部分（如主歌、副歌）。
 */
export interface SongSection {
  section: string;
  bars: number;
  description: string;
}

/**
 * 代表由 LLM 生成的完整的歌曲创作计划。
 * 这是整个创作过程的“总纲”。
 */
export interface Plan {
  songInfo: SongInfo;
  instrumentation: Instrument[];
  songStructure: SongSection[];
}



/**
 * 代表一个乐器的完整音轨数据，使用 ABC 谱字符串来描述音乐。
 * @param instrumentName - 该音轨对应的乐器名。
 * @param abcString - 描述该乐器演奏内容的 ABC 谱字符串。
 */
export interface Track {
  instrumentName: string;
  abcNotes: string;
  clef: "treble" | "bass" | "alto" | "tenor" | "perc";
  midiProgram: number;
}