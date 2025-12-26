import React from 'react';
import Section from '../components/Section';
import Toggle from '../components/Toggle';

const ProductivityTools = ({ expanded, onToggle, toggles, onToggleChange }) => {
  return (
    <Section title="Productivity Tools" expanded={expanded} onToggle={onToggle}>
      <Toggle
        label="Focus Mode"
        description="Hide distractions, dim page"
        enabled={toggles.focusMode || false}
        onChange={(val) => onToggleChange('focusMode', val)}
      />
      
      <Toggle
        label="Passive Watching Detector"
        description="Detect inactivity and suggest actions"
        enabled={toggles.passiveWatching || false}
        onChange={(val) => onToggleChange('passiveWatching', val)}
      />
      
      <Toggle
        label="Energy-Aware Scheduling"
        description="Match tasks to energy levels"
        enabled={toggles.energyScheduling || false}
        onChange={(val) => onToggleChange('energyScheduling', val)}
      />
    </Section>
  );
};

export default ProductivityTools;
