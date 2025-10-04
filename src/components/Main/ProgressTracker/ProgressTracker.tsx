import type React from "react";
import {
	Box,
	Button,
	CircularProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import type { Plan } from "../../../types";

// 1. 定义组件的 Props
interface ProgressTrackerProps {
	// 完整的创作计划，可能为 null
	plan: Plan | null;
  // 创建计划时是否正在生成中
  isLoading: boolean;
	// 当用户点击“生成”按钮时要执行的回调函数
	onGenerateNext: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
	plan,
  isLoading,
	onGenerateNext,
}) => {
	// 2. 如果还没有计划，显示占位符
	if (!plan) {
		return (
			<Box sx={{ p: 2, textAlign: "center" }}>
				<Typography variant="h6" gutterBottom>
					Song Generation Progress
				</Typography>
				<Typography color="text.secondary">
					Waiting for a generation plan to be created...
				</Typography>
			</Box>
		);
	}

	const instruments = plan.instrumentation;
	const totalTracks = instruments.length;

	// 3. 根据乐器状态计算衍生变量
	const generatedTracksCount = instruments.filter(
		(i) => i.status === "generated",
	).length;
	const isGenerating = instruments.some((i) => i.status === "generating");
	const allTracksGenerated = generatedTracksCount === totalTracks;
	const nextInstrument = instruments.find((i) => i.status === "pending");

	// 4. 渲染主界面
	return (
		<Box>
			<Typography variant="h6" gutterBottom sx={{ px: 2, pt: 2 }}>
				Song Generation Progress
			</Typography>
			<List dense>
				{/* 5. 遍历计划中的所有乐器 */}
				{instruments.map((instrument) => {
					let statusIcon: React.ReactNode;

					// 6. 根据乐器自身的 status 决定其显示状态
					switch (instrument.status) {
						case "generated":
							statusIcon = <CheckCircleIcon color="success" />;
							break;
						case "generating":
							statusIcon = <CircularProgress size={24} />;
							break;
						case "pending":
						default:
							// 第一个 pending 的乐器是 "Next Up"
							if (
								nextInstrument?.instrumentName === instrument.instrumentName &&
								!isGenerating
							) {
								statusIcon = <HourglassTopIcon color="action" />;
							} else {
								statusIcon = <MusicNoteIcon color="disabled" />;
							}
							break;
					}

					return (
						<ListItem key={instrument.instrumentName}>
							<ListItemIcon>{statusIcon}</ListItemIcon>
							<ListItemText
								primary={
									<Typography
										color={
											instrument.status !== "pending"
												? "text.primary"
												: "text.disabled"
										}
									>
										{instrument.instrumentName}
									</Typography>
								}
								secondary={instrument.role}
							/>
						</ListItem>
					);
				})}
			</List>

			{/* 7. “生成”按钮 */}
			<Box sx={{ p: 2 }}>
				<Button
					variant="contained"
					fullWidth
					onClick={onGenerateNext}
					// 当正在生成或所有音轨都已生成时，禁用按钮
					disabled={isGenerating || allTracksGenerated || isLoading}
					sx={{ height: 40 }}
				>
					{allTracksGenerated
						? "Generation Complete"
						: isGenerating
							? "Generating..."
							: `Generate: ${nextInstrument?.instrumentName || ""}`}
				</Button>
			</Box>
		</Box>
	);
};

export default ProgressTracker;
