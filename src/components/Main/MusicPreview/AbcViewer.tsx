// AbcViewer.tsx
import type React from "react";
import { useEffect, useRef } from "react";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import { Box, Typography, Button } from "@mui/material";
import type { Track, SongInfo } from "../../../types";

// --- Tauri API 导入 (Tauri v2) ---
import { writeFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";

interface AbcViewerProps {
  tracks: Track[];
  songInfo: SongInfo;
}

const AbcViewer: React.FC<AbcViewerProps> = ({ tracks, songInfo }) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const abcStringRef = useRef<string>("");

  useEffect(() => {
    if (!paperRef.current || !audioRef.current || tracks.length === 0) {
      return;
    }
    paperRef.current.innerHTML = "";
    audioRef.current.innerHTML = "";

    const header = `X: 1
T: ${songInfo.title || "Untitled"}
M: ${songInfo.timeSignature || "4/4"}
Q: 1/4=${songInfo.bpm || 70}
`;
    const combinedAbcString = `${header}${tracks
      .map(
        (track, index) =>
          `V: ${index} name="${track.instrumentName}" clef=${track.clef}\n%%MIDI program ${track.midiProgram}\n` +
          track.abcNotes.trim().replace(/\n\n/g, "\n")
      )
      .join("\n")}`;
    console.log(combinedAbcString);
    abcStringRef.current = combinedAbcString;

    const synthController = new (abcjs as any).synth.SynthController();
    const visualObj = abcjs.renderAbc(paperRef.current, combinedAbcString, {
      responsive: "resize",
      clickListener: (abcElem) => {
        synthController.playEvent(
          abcElem,
          (abcjs as any).synth.getMidiPitches(abcElem),
          (abcjs as any).synth.getMidiBeats(abcElem)
        );
      },
    })[0];

    if (!visualObj) {
      console.error("Failed to render ABC string.");
      return;
    }

    synthController.setTune(visualObj, false);
    synthController.load(audioRef.current, {
      displayLoop: true,
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayWarp: true,
    });
  }, [tracks, songInfo]);

  // --- MIDI 导出处理函数 (最终修正版) ---
  const handleExportMidi = async () => {
    if (!abcStringRef.current) {
      alert("没有可导出的乐谱数据。");
      return;
    }

    try {
      // 1. 异步获取 abcjs 返回的数据，它是一个数组
      const rawMidiDataArray = await (abcjs.synth as any).getMidiFile(
        abcStringRef.current,
        { midiOutputType: "binary" }
      );

      // 2. 从返回的数组中，直接获取第一个元素，这才是真正的 Uint8Array
      // 增加健壮性检查，确保数组不为空且第一个元素是我们期望的类型
      if (
        !Array.isArray(rawMidiDataArray) ||
        rawMidiDataArray.length === 0 ||
        !(rawMidiDataArray[0] instanceof Uint8Array)
      ) {
        console.error(
          "abcjs did not return an array with a Uint8Array at the first position.",
          rawMidiDataArray
        );
        alert("生成 MIDI 数据时返回了意外的格式。");
        return;
      }

      const midiDataBytes = rawMidiDataArray[0];

      // 3. 弹出 Tauri 的“另存为”对话框
      const suggestedFilename = `${songInfo.title || "Untitled"}.mid`;
      const filePath = await save({
        title: "导出 MIDI 文件",
        defaultPath: suggestedFilename,
        filters: [
          {
            name: "MIDI 文件",
            extensions: ["mid", "midi"],
          },
        ],
      });

      if (filePath) {
        // 4. 使用 Tauri v2 的 writeFile API 将正确的二进制数据写入文件
        await writeFile(filePath, midiDataBytes);
        alert(`MIDI 文件已成功保存到: ${filePath}`);
      }
    } catch (error) {
      console.error("导出 MIDI 失败:", error);
      alert(`导出 MIDI 失败: ${error}`);
    }
  };

  // 当没有音轨时显示的占位符
  if (tracks.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Music preview will appear here once tracks are generated.
        </Typography>
      </Box>
    );
  }

  // 渲染两个独立的容器
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 音频控件和导出按钮容器 */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexShrink: 0 }}>
        <Box ref={audioRef} sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={handleExportMidi}
          sx={{ ml: 2 }}
        >
          导出 MIDI
        </Button>
      </Box>
      {/* 五线谱容器，允许垂直滚动 */}
      <Box ref={paperRef} sx={{ flex: 1, overflowY: "auto" }} />
    </Box>
  );
};

export default AbcViewer;