import React from 'react';
import Section from '../components/Section';
import AWSCostPrediction from './AWSTools/AWSCostPrediction';

const AWSTools = ({ expanded, onToggle, toggles, onToggleChange }) => {
  const isAWSCostPredictionEnabled = toggles.awsCostPrediction || false;

  return (
    <Section title="AWS Tools" expanded={expanded} onToggle={onToggle}>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
          <div>
            <h3 className="text-white font-medium">AWS Cost Prediction</h3>
            <p className="text-xs text-gray-400">Get service recommendations with cost estimates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAWSCostPredictionEnabled}
              onChange={(e) => onToggleChange('awsCostPrediction', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isAWSCostPredictionEnabled && (
          <AWSCostPrediction />
        )}
      </div>
    </Section>
  );
};

export default AWSTools;
