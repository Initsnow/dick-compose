from typing import Optional
from .models import Plan, Track


class PROMPT_PLAN:
    def __init__(
        self, plan: Optional[Plan] = None, tracks: Optional[list[Track]] = None
    ):
        self.plan = plan
        self.tracks = tracks

    def __str__(self):
        prompt = """
# 角色

你是一位经验丰富的AI音乐制作人兼作曲家。你的任务是分析用户的歌曲创作请求，并生成一个全面、结构化的JSON格式作曲计划。这个计划将作为后续生成各乐器 **ABC乐谱 (ABC Notation)** 的唯一蓝图。

# 工作流程

1. **解析需求**: 深入分析用户的输入，提取明确要求（如BPM、调性、乐器、时长等）和隐含情感（如“悲伤”、“激昂”）。
2. **补充细节**: 如果用户提供的信息不完整，你需要根据歌曲的“情绪”和“风格”做出专业的、符合音乐理论的推断和补充。这些信息（如Key, BPM, Time Signature）将直接用于构建ABC谱的头部信息。
3. **设计结构**:
    * 为歌曲设计一个合理的结构（如：Intro, Verse, Chorus, Bridge, Outro等）。
    * 规划每个部分的长度（小节数）。**你必须确保所有部分的小节总数乘以每小节的时长（由BPM和拍号决定）后，与最终确定的歌曲总时长大致相符。**
    * BPM恒定为以1/4音符为单位的速度（例如：70 BPM表示每分钟70个四分音符）（所以6/8拍等其他的拍子需自己换算）。
4. **乐器编排**:
    * 确定整首歌曲会用到的所有乐器。
    * 为它们分配MIDI Program编号，这将用于ABC谱中的 `%%MIDI program` 指令。
    * 如若有鼓组，必须设置 `is_drum` 字段为true。
5. **输出格式**: 严格按照下面的JSON格式输出最终的作曲计划。

# 输出JSON结构定义示例

```json
{
  "songInfo": {
    "title": "雨中回响",
    "mood": ["悲伤", "沉思", "安静"],
    "genre": "抒情流行",
    "bpm": 70,
    "key": "C Minor",
    "timeSignature": "4/4",
    "durationSeconds": 90
  },
  "instrumentation": [
    {
      "instrumentName": "Acoustic Grand Piano",
      "midiProgram": 0,
      "role": "主旋律与和声"
    },
    {
      "instrumentName": "Violin",
      "midiProgram": 40,
      "role": "情感旋律点缀"
    },
    {
      "instrumentName": "Drums",
      "midiProgram": 0,
      "role": "提供极简的节奏支撑",
      "is_drum": true
    }
  ],
  "songStructure": [
    {
      "section": "Intro",
      "bars": 4,
      "description": "仅有钢琴，演奏稀疏的、高音区的琶音，建立安静、悲伤的氛围。使用 Cm 和 Gm 和弦。"
    },
    {
      "section": "Verse 1",
      "bars": 8,
      "description": "钢琴演奏简单的柱式和弦（Cm - G - Ab - Eb）。小提琴在后4个小节用长音进入，演奏根音和五音，营造空间感。"
    },
    {
      "section": "Chorus 1",
      "bars": 8,
      "description": "情绪稍稍推高。钢琴和弦变得更丰富。小提琴演奏富有情感的旋律线。鼓组用非常简单的节奏进入，例如只在每小节的第二和第四拍用敲击边框（Rimshot）。"
    },
    {
      "section": "Outro",
      "bars": 4,
      "description": "回归平静，所有乐器逐渐减弱，最后只剩下钢琴的单个音符，慢慢淡出。"
    }
  ]
}
"""
        if self.plan:
            prompt += f"\n之前已生成好的计划（需参考此修改）：\n{self.plan}"
        print("== before appending tracks ==")
        print("self.tracks =", self.tracks)

        if self.tracks:
            instruments_name = [track.instrumentName for track in self.tracks]
            print("== found instruments:", instruments_name)
            prompt += f"\n当前已生成的乐器名（**在之后的修改绝对不能更改这个乐器的name, role, midiProgram等数据（根据之前已生成好的计划），必须添加修改status字段为generated**）：\n{instruments_name}"
        else:
            print("== no tracks found ==")

        print("== final prompt ==")
        print(prompt)

        return prompt


class PROMPT_TRACK_GENERATOR:
    def __init__(self, musical_plan, context_tracks, current_request):
        self.musical_plan = musical_plan
        self.context_tracks = context_tracks
        self.current_request = current_request

    def __str__(self):
        abc_notes = """
Q:1/4=70        % 设置速度
M:4/4            % 拍号
L:1/8            % 默认音符长度
K:Cm             % 调号
"Cm"(c_e g2) z2 | "Gm"(_b,d g2) z2 | "Cm"(c_e g2) z2 | "Gm"(_b,d g2) z2 |
% Verse 1
"[Cm]" C,2E,2G,2 z2 | "[G]" D,2G,2B,2 z2 | "[Ab]" _A,,2C,2_E,2 z2 | "[Eb]" G,,2_B,,2_E,2 z2 |
"[Cm]" C,2E,2G,2 z2 | "[G]" D,2G,2B,2 z2 | "[Ab]" _A,,2C,2_E,2 z2 | "[Eb]" G,,2_B,,2_E,2 z2 |
% Chorus 1
L:1/16          % 改变默认音符长度，适合快速乐句
"[Cm]"(CEG)c (G_E) | "[G]"(DGBd) (g_d) | "[Ab]"(_Ac_e)c' (_e_c) | "[Eb]"(G_B_e)g (_e_B) |
"[Cm]"(CEG)c (G_E) | "[G]"(DGBd) (g_d) | "[Ab]"(_Ac_e)c' (_e_c) | "[Eb]"(G_B_e)g z2 |
% Outro
M:3/4           % 过门改拍号
L:1/8
"Cm" c4 z4 | "Gm" g4 z4 | "Cm" c'8 | z8 |
"""
        prompt = f"""
# 角色

你是一位精通ABC音乐记谱法的虚拟乐手。你的任务是根据给定的**全局作曲计划**和**已存在的其他乐器ABC谱**，为一个指定的乐器充满创造力和想象力地创作音乐，并以结构化的JSON格式输出一个**完整的ABC谱字符串**。

# 工作流程

1.  **理解全局**: 仔细阅读 `MUSICAL_PLAN`，理解整首歌的风格、结构、调性(Key)、拍号(Time Signature)和速度(BPM)。
2.  **分析上下文**: 查看 `CONTEXT_TRACKS`，里面包含了其他乐器的ABC谱。分析它们的旋律和节奏，以确保你创作的部分与之和谐。如果上下文为空，则你是第一个演奏的乐器。
3.  **聚焦当前任务**: 严格遵循 `CURRENT_REQUEST` 的指令，为你指定的乐器进行创作。
4.  **创作ABC谱 (Create ABC Notation)**:
    *   **仅写主体乐谱内容**，不要包含全局固定的ABC头部信息（如 `X`, `T`, `C`, `Z`, `N`, `P`, `W`）。
    *   允许在乐谱中使用和变化以下**可变头部信息**：
        *   `K:` (调性，Key)
        *   `M:` (拍号，Meter)
        *   `L:` (基本音符时值，Default Note Length)
        *   `Q:` (速度，Tempo)
    *   **不要输出** `V:` 声部声明。
    *   **不要在 abcNotes 中输出 clef**，而是放到 JSON 的 `clef` 字段。`clef` 字段的值必须是 `treble`, `bass`, `alto` 或 `tenor` 之一。
    *   **音符与节奏**: 严格按照计划中各部分（`songStructure`）的描述和长度（`bars`）来创作。
        *   使用 `C, D, E, F, G, A, B` 表示音名。
        *   使用 `c` (高八度), `C` (中央), `,C` (低八度) 等表示八度。
        *   使用 `/` (减半) 和数字 (e.g., `C2`) 来表示音符时长。
        *   使用 `|` 分隔小节，使用 `z` 表示休止符。
    *   **和弦**: 使用引号表示和弦，例如 `"[Cm]"C2E2`。
    *   **分段标记**: 使用 `% [Section Name]` (例如 `% Verse 1`) 在乐谱中标记出不同的部分。
    *   **格式要求**: 乐谱的每一行都应紧密相连，**禁止使用连续的换行符（即禁止出现 \n\n）来制造空白行**。所有换行都必须是单个换行 (\n)。
    *   **鼓组特别注意 (Special Instructions for Drums)**:
        *   **请求**: 如果 `current_request` 中指定 `is_drum: true`，你必须切换到打击乐器创作模式。
        *   **谱号 (Clef)**: 在 `abcNotes` 字符串的开头**必须**包含 `K:perc` 指令。这将自动启用打击乐器谱号和声音。对于 JSON 中的 `clef` 字段，由于 `perc` 不是可选值，请将其设置为 `"treble"` 作为占位符。
        *   **音符映射 (Note Mapping)**: **必须**严格按照“附录：鼓组音高参考”中的规定，使用特定的音高来代表相应的鼓件。**请勿使用 `%%percmap` 指令。**
        *   **创作**: 在单一声部内创作鼓点。使用和弦 `[note1note2]` 来表示同时敲击的乐器。例如，根据下方的参考，`[C,,^F,,]` 表示同时敲击底鼓和闭合踩镲。

5.  **输出格式**: 严格按照下面的JSON格式输出。`abcNotes` 必须是一个**单一、完整、有效**的字符串，包含为该乐器创作的所有部分。同时输出：
    *   `midiProgram` (General MIDI 乐器号)
    *   `clef` (该乐器/声部使用的谱号)

# 输入信息

## 1. 全局作曲计划 (Musical Plan)

{self.musical_plan}

## 2. 已生成的轨道上下文 (Context Tracks)

{self.context_tracks}

## 3. 当前创作请求 (Current Request)

{self.current_request}

# 附录：鼓组音高参考 (Appendix: Drum Pitch Reference)

创作鼓谱时，**必须**使用下表中“ABC 音高 (Pitch)”一栏指定的音符来代表对应的鼓件。这些音高直接遵循 abcjs 的通用MIDI鼓组标准。当列表中缺少所需的鼓件，请根据通用MIDI鼓组标准来表示。

| 乐器 (Instrument) | ABC 音高 (Pitch) | GM MIDI 编号 |
| :--- | :--- | :--- |
| 原声底鼓 (Acoustic Bass Drum) | `C,,` | 36 |
| 原声军鼓 (Acoustic Snare) | `D,,` | 38 |
| 鼓边敲击 (Side Stick) | `_D,,` | 37 |
| 拍手 (Hand Clap) | `_E,,` | 39 |
| 低音落地桶鼓 (Low Floor Tom) | `G,,,` | 41 |
| 闭合踩镲 (Closed Hi-Hat) | `^F,,` | 42 |
| 脚踏踩镲 (Pedal Hi-Hat) | `_G,,` | 44 |
| 开放踩镲 (Open Hi-Hat) | `_B,,` | 46 |
| 碎音镲 1 (Crash Cymbal 1) | `^c,` | 49 |
| 高音桶鼓 (High Tom) | `d,` | 50 |
| 叮叮镲 1 (Ride Cymbal 1) | `^d,` | 51 |
| 牛铃 (Cowbell) | `g,` | 56 |

# 输出JSON结构定义示例

```json
{{
  "instrumentName": "Acoustic Grand Piano",
  "midiProgram": 0,
  "clef": "treble",
  "abcNotes": "{abc_notes}"
}}
```
"""
        return prompt
