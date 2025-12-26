import React from 'react';
import Section from '../components/Section';
import Toggle from '../components/Toggle';

const DeveloperTools = ({ expanded, onToggle, toggles, onToggleChange }) => {
  return (
    <Section title="Developer Tools" expanded={expanded} onToggle={onToggle}>
      <Toggle
        label="GitHub Agent"
        description="Integration hook (logic by teammate)"
        enabled={toggles.githubAgent || false}
        onChange={(val) => onToggleChange('githubAgent', val)}
      />
      
      <Toggle
        label="AWS Agent"
        description="Integration hook (logic by teammate)"
        enabled={toggles.awsAgent || false}
        onChange={(val) => onToggleChange('awsAgent', val)}
      />
      
      <Toggle
        label="Auto Clear Cache"
        description="Automatically clear cache on page refresh"
        enabled={toggles.autoClearCache || false}
        onChange={(val) => onToggleChange('autoClearCache', val)}
      />
      
      <Toggle
        label="Edit Cookie"
        description="View and edit cookies on page"
        enabled={toggles.editCookie || false}
        onChange={(val) => onToggleChange('editCookie', val)}
      />
      
      <Toggle
        label="Check SEO"
        description="Analyze page SEO metrics"
        enabled={toggles.checkSEO || false}
        onChange={(val) => onToggleChange('checkSEO', val)}
      />
      
      <Toggle
        label="Font Finder"
        description="Hover to see font details"
        enabled={toggles.fontFinder || false}
        onChange={(val) => onToggleChange('fontFinder', val)}
      />
      
      <Toggle
        label="Color Finder"
        description="Pick colors from page"
        enabled={toggles.colorFinder || false}
        onChange={(val) => onToggleChange('colorFinder', val)}
      />
    </Section>
  );
};

export default DeveloperTools;
