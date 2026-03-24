import React from 'react';
import AIChatInterface from '../components/AIChatInterface';

const CodeGenerator = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
    <AIChatInterface toolType="code" />
  </div>
);
export default CodeGenerator;
