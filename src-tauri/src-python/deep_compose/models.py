from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel

# -----------------------------------------------------------------
# 聊天界面相关模型
# -----------------------------------------------------------------

class Message(BaseModel):
    """
    代表一条聊天消息。
    """
    id: str
    role: Literal['user', 'assistant']
    content: str


# -----------------------------------------------------------------
# LLM 生成的音乐创作计划 (Plan) 相关模型
# -----------------------------------------------------------------

class SongInfo(BaseModel):
    """歌曲的基本元数据信息。"""
    title: str
    mood: List[str]
    genre: str
    bpm: int
    key: str
    timeSignature: str
    durationSeconds: int

class Instrument(BaseModel):
    """描述歌曲中用到的一个乐器。"""
    instrumentName: str
    midiProgram: int
    role: str
    is_drum: Optional[bool] = None
    status: Literal['pending', 'generating', 'generated'] = 'pending' 

class SongSection(BaseModel):
    """描述歌曲结构中的一个部分（如主歌、副歌）。"""
    section: str
    bars: int
    description: str

class Plan(BaseModel):
    """
    代表由 LLM 生成的完整的歌曲创作计划。
    """
    songInfo: SongInfo
    instrumentation: List[Instrument]
    songStructure: List[SongSection]



class Track(BaseModel):
    """
    代表一个乐器的完整音轨数据
    """
    instrumentName: str
    midiProgram: int
    clef: Literal["treble", "bass", "alto", "tenor"]
    abcNotes: str
