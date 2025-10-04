import type React from 'react';
import type { Plan } from '../../../types';
import { Card, CardContent, Typography, Divider, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

interface PlanCardProps {
  plan: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const { songInfo, instrumentation, songStructure } = plan;

  return (
    <Card sx={{ mt: 2, maxWidth: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {songInfo.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={`Genre: ${songInfo.genre}`} />
          <Chip label={`BPM: ${songInfo.bpm}`} />
          <Chip label={`Key: ${songInfo.key}`} />
          <Chip label={`Time: ${songInfo.timeSignature}`} />
          <Chip label={`Duration: ${songInfo.durationSeconds}s`} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {songInfo.mood.map(m => <Chip key={m} label={m} color="secondary" />)}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Instrumentation
        </Typography>
        <List dense>
          {instrumentation.map((instrument) => (
            <ListItem key={`${instrument.instrumentName}-${instrument.role}`} disablePadding>
              <ListItemText
                primary={instrument.instrumentName}
                secondary={`Role: ${instrument.role} | MIDI Program: ${instrument.midiProgram}`}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Song Structure
        </Typography>
        <List dense>
          {songStructure.map((section,) => (
            <ListItem key={`${section.section}-${section.description}`} disablePadding>
              <ListItemText
                primary={`${section.section} (${section.bars} bars)`}
                secondary={section.description}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
