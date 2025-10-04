import type React from "react";
import { useState } from "react";
import { Box, Paper, Alert, Snackbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ChatInput from "./Chat/ChatInput";
import ChatMessages from "./Chat/ChatMessages";
import ProgressTracker from "./ProgressTracker/ProgressTracker";
import AbcViewer from "./MusicPreview/AbcViewer";
import type { Message, Plan, Track } from "../../types"; // Assuming types are defined
import { pyInvoke } from "tauri-plugin-pytauri-api";
import "abcjs/abcjs-audio.css";

const Main: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [plan, setPlan] = useState<Plan | null>(null);
	const [tracks, setTracks] = useState<Track[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error_msg, setError] = useState<String | null>(null);

	const handleSendMessage = async (text: string) => {
		// 1. 更新聊天记录，立即显示用户发送的消息
		const userMessage: Message = {
			id: `user-${Date.now()}`,
			role: "user",
			content: text,
		};
		setMessages((prevMessages) => [...prevMessages, userMessage]);

		// 2. 设置为加载状态
		setIsLoading(true);

		try {
			// 3. 在这里调用 Tauri 后端，与 LLM 交互
			// const response = await invoke('generate_plan', { prompt: text });
			// ... 处理后端返回的数据 (plan 或 track)
			// const aiMessage: Message = { role: 'assistant', content: JSON.stringify(response) };
			// setMessages(prev => [...prev, aiMessage]);
			if (!plan) {
				const plan: Plan = await pyInvoke("generate_plan", {
					content: text,
				});
				console.log("Generated plan:", plan);
				const msg: Message = {
					id: `system-${Date.now()}`,
					role: "assistant",
					plan: plan,
				};
				setMessages((prevMessages) => [...prevMessages, msg]);
				setPlan(plan);
			} else {
				console.log("Generated tracks so far:", tracks);
				const plan_new: Plan = await pyInvoke("generate_plan", {
					content: text,
					plan: plan,
					tracks: tracks,
				});
				console.log("Generated plan_new:", plan_new);
				const msg: Message = {
					id: `system-${Date.now()}`,
					role: "assistant",
					plan: plan_new,
				};
				setMessages((prevMessages) => [...prevMessages, msg]);
				setPlan(plan_new);
			}
		} catch (error) {
			console.error("Error communicating with backend:", error);
			setError(`Error communicating with backend: ${error}`);
			// 可以添加一条错误消息到聊天记录中
		} finally {
			// 4. 无论成功还是失败，都要取消加载状态
			setIsLoading(false);
		}
	};

	const handleGenerateNextTrack = async () => {
		if (!plan || isLoading || tracks.length >= plan.instrumentation.length) {
			return; // 防止在不应该生成的时候被调用
		}

		setIsLoading(true);

		const nextTrackIndex = tracks.length;
		const instrumentToGenerate = plan.instrumentation[nextTrackIndex];

		// 可以在聊天窗口给出提示
		const systemMessage: Message = {
			id: `system-${Date.now()}`,
			role: "assistant",
			content: `Generating track for **${instrumentToGenerate.instrumentName}**...`,
		};
		setMessages((prev) => [...prev, systemMessage]);

		try {
			const newTrack: Track = await pyInvoke("generate_track", {
				plan: plan,
				existingTracks: tracks,
				instrumentToGenerate: instrumentToGenerate,
			});

			// 			const newTrack: Track = {
			// 				instrumentName: instrumentToGenerate.instrumentName,
			// 				abcString: `
			// W: Intro
			// "C" C,2 E, G, C E G c |
			// "G" G,2 B, D G B d g |
			// "Am" A,2 C E A c e a |
			// "F" F,2 A, C F A c f |
			//         `,
			// 				midiProgram: 1,
			// 				clef: "treble",
			// 			};

			// 更新音轨列表，乐器状态和聊天记录
			setTracks((prev) => [...prev, newTrack]);
			setPlan((prevPlan) => {
				if (!prevPlan) return prevPlan;
				const updatedInstrumentation = prevPlan.instrumentation.map((inst) =>
					inst.instrumentName === newTrack.instrumentName
						? { ...inst, status: "generated" as const }
						: inst,
				);
				return { ...prevPlan, instrumentation: updatedInstrumentation };
			});
			const successMessage: Message = {
				id: `assistant-${Date.now()}`,
				role: "assistant",
				content: `Successfully generated track for **${newTrack.instrumentName}**.`,
			};
			setMessages((prev) => [...prev, successMessage]);
		} catch (error) {
			console.error("Failed to generate track:", error);
			setError(`Failed to generate track: ${error}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box
			sx={{
				flexGrow: 1,
				p: 2,
				height: "100vh",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Grid
				container
				spacing={2}
				sx={{ flex: 1, minHeight: 0, overflow: "auto" }}
			>
				{/* Left Panel: Chat and Progress */}
				<Grid
					size={{ xs: 12, md: 5 }}
					sx={{
						height: { xs: "auto", md: "100%" },
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Paper
						sx={{
							minHeight: 0,
							flex: 1,
							p: 2,
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						<Typography variant="h6" gutterBottom sx={{ px: 2, pt: 2 }}>
							Plan Generation
						</Typography>
						<ChatMessages messages={messages} />
						<ChatInput
							onSendMessage={handleSendMessage}
							isLoading={isLoading}
						/>
					</Paper>
					<Paper
						sx={{
							flexShrink: 0, // 防止这个 Paper 在空间不足时被压缩
							maxHeight: "50%", // 或者一个固定的像素值，如 '250px'
							overflowY: "auto", // 如果内容超出 maxHeight，则内部滚动
							mt: 2,
							p: 2,
              mb: 0.1,
						}}
					>
						<ProgressTracker
							plan={plan}
							isLoading={isLoading}
							onGenerateNext={handleGenerateNextTrack}
						/>
					</Paper>
				</Grid>

				{/* Right Panel: Music Preview */}
				<Grid size={{ xs: 12, md: 7 }}>
					<Paper sx={{ height: "100%", p: 2 }}>
						{plan ? (
							<AbcViewer tracks={tracks} songInfo={plan.songInfo} />
						) : (
							<></>
						)}
					</Paper>
				</Grid>
			</Grid>
			<Snackbar
				open={!!error_msg}
				autoHideDuration={6000}
				onClose={() => setError("")}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert severity="error" onClose={() => setError("")}>
					{error_msg}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default Main;
