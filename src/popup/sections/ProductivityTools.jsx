import React from "react";
import Section from "../components/Section";
import Toggle from "../components/Toggle";

const ProductivityTools = ({ expanded, onToggle, toggles, onToggleChange }) => {
  const openStayFocused = () => {
    chrome.runtime.openOptionsPage();
    window.open(chrome.runtime.getURL("src/pages/StayFocused.html"), "_blank");
  };

  return (
    <Section title="Productivity Tools" expanded={expanded} onToggle={onToggle}>
      <Toggle
        label="Focus Mode"
        description="Hide distractions, dim page"
        enabled={toggles.focusMode || false}
        onChange={(val) => onToggleChange("focusMode", val)}
      />

      <Toggle
        label="StayFocused"
        description="Block distracting websites"
        enabled={toggles.stayFocused || false}
        onChange={(val) => onToggleChange("stayFocused", val)}
        actionText="Configure"
        onAction={openStayFocused}
      />

      <Toggle
        label="Passive Watching Detector"
        description="Detect inactivity and suggest actions"
        enabled={toggles.passiveWatching || false}
        onChange={(val) => onToggleChange("passiveWatching", val)}
      />

      <Toggle
        label="Energy-Aware Scheduling"
        description="Match tasks to energy levels"
        enabled={toggles.energyScheduling || false}
        onChange={(val) => onToggleChange("energyScheduling", val)}
      />
    </Section>
  );
};

export default ProductivityTools;
