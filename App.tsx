import React from 'react';
import { Terminal } from './components/Terminal';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 to-slate-900 font-mono">
      <Terminal />
    </div>
  );
};

export default App;