import React from 'react';
import AIChatInterface from '../components/AIChatInterface';

const TextGenerator = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
    <AIChatInterface toolType="text" />
  </div>
);
export default TextGenerator;
