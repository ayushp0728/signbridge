// PartitionedProgressBar.tsx
import React from 'react';
import './PartitionedProgressBar.css';

interface TopicProgress {
  label: string;
  percentage: number; // Percentage of progress within the topic (0–100%)
}

interface PartitionedProgressBarProps {
  topics: TopicProgress[]; // Array of topics with progress
}

const PartitionedProgressBar: React.FC<PartitionedProgressBarProps> = ({ topics }) => {
  const partitionHeight = 100 / topics.length; // Divide bar equally among topics

  return (
    <div className="partitioned-progress-bar">
      {topics.map((topic, index) => (
        <div key={index} className="partition" style={{ height: `${partitionHeight}%` }}>
          <div
            className="partition-fill"
            style={{ height: `${topic.percentage}%` }}
          ></div>
          <span className="partition-label">{topic.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PartitionedProgressBar;
