import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PORTFOLIO_DATA } from '../constants';
import { TerminalLine } from '../types';
import { generateAIResponse } from '../services/geminiService';

// --- Icons ---
const MaximizeIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H9V9H1V1Z" stroke="#4b5563" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </svg>
);
const MinimizeIcon = () => (
  <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H9" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 transition-opacity"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L9 9M9 1L1 9" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 transition-opacity"/>
  </svg>
);

// --- Helpers ---
// Use .md extension for all generated files
const toFilename = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '') + '.md';

// --- Sub-components ---

const Prompt: React.FC<{ path: string }> = ({ path }) => {
  const displayPath = path.replace('~/Portfolio', '').replace(/^\//, '') || '~';
  return (
    <span className="whitespace-nowrap mr-2">
      <span className="text-green-500 font-bold">➜</span>
      <span className="text-cyan-400 font-bold ml-2">{displayPath}</span>
    </span>
  );
};

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('~/Portfolio');
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Use a Ref to track currentPath to avoid stale closures in history items
  const pathRef = useRef(currentPath);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasBooted = useRef(false);

  // Sync Ref with State
  useEffect(() => {
    pathRef.current = currentPath;
  }, [currentPath]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  // Focus
  const handleContainerClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      if (!isTyping) {
        inputRef.current?.focus();
      }
    }
  };

  // Safe addToHistory that always reads the latest path if not overridden
  const addToHistory = useCallback((type: 'command' | 'output', content: React.ReactNode, pathOverride?: string) => {
    setHistory(prev => {
        const path = pathOverride !== undefined ? pathOverride : pathRef.current;
        return [...prev, { id: Math.random().toString(36).substr(2, 9), type, content, path }];
    });
  }, []);

  const typeCommand = async (command: string, delay = 30) => {
    setIsTyping(true);
    setInput('');
    for (let i = 0; i < command.length; i++) {
      setInput(prev => prev + command[i]);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsTyping(false);
    return command;
  };

  // executeCommand logic
  const executeCommand = async (rawCommand: string, isManual = false, pathOverride?: string) => {
    const command = rawCommand.trim();
    // Always fallback to pathRef.current to ensure we have the latest state even in closures
    const effectivePath = pathOverride !== undefined ? pathOverride : pathRef.current;

    if (!command && isManual) {
      addToHistory('command', '', effectivePath);
      return;
    }

    if (isManual) {
      addToHistory('command', command, effectivePath);
    }

    const args = command.split(' ');
    const cmd = args[0].toLowerCase();
    
    switch (cmd) {
      case 'help':
        addToHistory('output', (
          <div className="text-slate-400 grid grid-cols-[100px_1fr] gap-2">
            <span>ls</span>       <span>List directory contents</span>
            <span>cd [dir]</span> <span>Change directory</span>
            <span>cat [file]</span> <span>Read file content</span>
            <span>clear</span>    <span>Clear terminal</span>
            <span>ai [msg]</span> <span>Ask AI Assistant</span>
          </div>
        ), effectivePath);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'ls':
        let content: React.ReactNode;
        if (effectivePath === '~/Portfolio') {
          content = (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 cursor-default text-sm">
               <div onClick={() => handleItemClick("Experience", "dir")} className="text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors font-bold">Experience/</div>
               <div onClick={() => handleItemClick("Projects", "dir")} className="text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors font-bold">Projects/</div>
               <div onClick={() => handleItemClick("AI_Chat.md", "file")} className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors font-bold">AI_Chat.md</div>
               
               <div onClick={() => handleItemClick("AboutMe.md", "file")} className="text-slate-200 hover:text-white cursor-pointer transition-colors">AboutMe.md</div>
               <div onClick={() => handleItemClick("Education.md", "file")} className="text-slate-200 hover:text-white cursor-pointer transition-colors">Education.md</div>
               <div onClick={() => handleItemClick("Skills.md", "file")} className="text-slate-200 hover:text-white cursor-pointer transition-colors">Skills.md</div>
               <div onClick={() => handleItemClick("resume.pdf", "file")} className="text-slate-200 hover:text-white cursor-pointer transition-colors">resume.pdf</div>
               <div onClick={() => handleItemClick("./intro", "exec")} className="text-green-400 font-bold opacity-80 cursor-pointer hover:text-green-300 transition-colors">intro.sh*</div>
            </div>
          );
        } else if (effectivePath === '~/Portfolio/Projects') {
           content = (
             <div className="flex flex-col gap-1 text-slate-200">
               {PORTFOLIO_DATA.projects.map(p => {
                 const fname = toFilename(p.name);
                 return (
                   <div key={p.name} onClick={() => handleItemClick(fname, 'file')} className="hover:text-white cursor-pointer w-max transition-colors">
                     {fname}
                   </div>
                 );
               })}
             </div>
           );
        } else if (effectivePath === '~/Portfolio/Experience') {
           content = (
            <div className="flex flex-col gap-1 text-slate-200">
              {PORTFOLIO_DATA.experience.map(e => {
                 const fname = toFilename(e.company);
                 return (
                   <div key={e.company} onClick={() => handleItemClick(fname, 'file')} className="hover:text-white cursor-pointer w-max transition-colors">
                     {fname}
                   </div>
                 );
              })}
            </div>
           )
        } else {
           content = <div className="text-slate-400">Total 0</div>;
        }
        addToHistory('output', content, effectivePath);
        break;

      case 'cd':
        const target = args.slice(1).join(' ');
        if (!target || target === '..') {
          if (effectivePath !== '~/Portfolio') {
            const parts = effectivePath.split('/');
            parts.pop();
            setCurrentPath(parts.join('/'));
          }
        } else if (target === 'Portfolio') {
           setCurrentPath('~/Portfolio');
        } else if (target === '~') {
          setCurrentPath('~/Portfolio');
        } else {
           const cleanTarget = target.replace(/"/g, '').replace('/', '');
           if (effectivePath === '~/Portfolio' && (cleanTarget === 'Projects' || cleanTarget === 'Experience')) {
             setCurrentPath(`${effectivePath}/${cleanTarget}`);
           } else {
             addToHistory('output', <span className="text-red-400">cd: no such file or directory: {target}</span>, effectivePath);
           }
        }
        break;

      case 'cat':
        const file = args.slice(1).join(' ');
        if (!file) {
          addToHistory('output', "Usage: cat [filename]", effectivePath);
          break;
        }
        
        const cleanFile = file.replace(/"/g, '');
        let output: React.ReactNode = null;

        // Check root files first if we are in root
        if (effectivePath === '~/Portfolio') {
            if (cleanFile === 'AboutMe.md') {
            output = (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                  <img 
                    src="/ENG_Ivan_Kisselev.jpg" 
                    alt="Ivan Kisselev" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500/20 shadow-xl"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-2">{PORTFOLIO_DATA.name}</h2>
                    <div className="text-slate-300 text-sm leading-relaxed mb-4">
                        {PORTFOLIO_DATA.about.split('\n').map((line, i) => (
                            <div key={i} className="min-h-[1.2em]">
                                {line.split(' ').map((word, j) => {
                                    if (word.includes('github.com') || word.includes('linkedin.com')) {
                                        const url = word.startsWith('http') ? word : `https://${word}`;
                                        return <a key={j} href={url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline cursor-pointer">{word} </a>
                                    }
                                    if (word.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                                        return <a key={j} href={`mailto:${word}`} className="text-cyan-400 hover:underline cursor-pointer">{word} </a>
                                    }
                                    return <span key={j}>{word} </span>
                                })}
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            } else if (cleanFile === 'Education.md') {
            output = (
                <div className="space-y-6">
                {PORTFOLIO_DATA.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-purple-500 pl-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                          <div className="text-purple-300 font-bold text-lg">{edu.degree}</div>
                          <div className="text-slate-500 text-xs italic">{edu.year}</div>
                        </div>
                        <div className="text-slate-200 font-semibold mb-2">{edu.school}</div>
                        <div className="text-slate-400 text-sm mb-1">GPA: 4.0</div>
                        <div className="text-slate-300 text-sm leading-relaxed">
                           <span className="text-slate-500">Relevant Coursework:</span> Software Engineering, Data Structures/Algorithms, Machine Learning, Cloud Computing, Scale Applications, Computer Systems, Databases, Discrete Math, Linear Algebra, Probability
                        </div>
                    </div>
                ))}
                </div>
            );
            } else if (cleanFile === 'Skills.md') {
            output = (
                <div className="flex flex-wrap gap-2 max-w-2xl">
                {PORTFOLIO_DATA.skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-slate-800 text-slate-200 rounded text-sm">{s}</span>
                ))}
                </div>
            );
            } else if (cleanFile === 'resume.pdf') {
            window.open('/resume.pdf', '_blank');
            output = (
                <div className="text-green-400 flex items-center gap-2">
                    <span>✓</span> 
                    <span>Opening resume.pdf in new tab...</span>
                </div>
            );
            } else if (cleanFile === 'AI_Chat.md') {
                output = (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded text-purple-200 mt-2">
                        <div className="font-bold mb-1">✨ AI Assistant Active</div>
                        <div className="text-sm opacity-80">Type <code className="bg-black/30 px-1 rounded">ai "your question"</code> to ask about my resume, skills, or projects.</div>
                    </div>
                );
            }
        }
        
        // Check subdirectories
        if (!output) {
            if (effectivePath.includes('Projects')) {
                const foundProject = PORTFOLIO_DATA.projects.find(p => toFilename(p.name) === cleanFile);
                if (foundProject) {
                    output = (
                    <div className="border-l-2 border-yellow-400 pl-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                            <span className="text-yellow-400 font-bold text-lg">{foundProject.name}</span>
                            {foundProject.link && (
                                <a href={`https://${foundProject.link}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                    {foundProject.link} 
                                    <span className="text-[10px]">↗</span>
                                </a>
                            )}
                        </div>
                        <div className="text-slate-300 text-sm mb-3 leading-relaxed">{foundProject.description}</div>
                        <div className="flex flex-wrap gap-2">
                            {foundProject.tech.map(t => (
                                <span key={t} className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded select-none">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    );
                }
            }
            if (effectivePath.includes('Experience')) {
                const foundExp = PORTFOLIO_DATA.experience.find(e => toFilename(e.company) === cleanFile);
                if (foundExp) {
                    output = (
                        <div className="border-l-2 border-cyan-500 pl-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-cyan-300 font-bold text-lg">{foundExp.role}</span>
                                    <span className="text-slate-500">@</span>
                                    <span className="text-green-400 font-semibold">{foundExp.company}</span>
                                </div>
                                <div className="text-slate-500 text-xs italic">{foundExp.period}</div>
                            </div>
                            <ul className="list-none space-y-2 text-slate-300 text-sm mt-3">
                                {foundExp.details.map((d, j) => (
                                    <li key={j} className="flex gap-2 leading-relaxed">
                                        <span className="text-slate-600 select-none mt-0.5">➜</span> 
                                        <span>{d}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                }
            }
        }
        
        if (output) {
            addToHistory('output', output, effectivePath);
        } else {
            addToHistory('output', <span className="text-red-400">cat: {file}: No such file or directory</span>, effectivePath);
        }
        break;

      case 'ai':
        const prompt = args.slice(1).join(' ');
        if (!prompt) {
          addToHistory('output', "Usage: ai [your question here]", effectivePath);
        } else {
          addToHistory('output', <span className="animate-pulse text-slate-400">Thinking...</span>, effectivePath);
          const response = await generateAIResponse(prompt);
          setHistory(h => {
             const newH = [...h];
             newH.pop();
             return newH;
          });
          addToHistory('output', <div className="text-purple-200 whitespace-pre-wrap leading-relaxed">{response}</div>, effectivePath);
        }
        break;

      case './intro':
        addToHistory('output', <div className="text-slate-500">Initializing environment...</div>, effectivePath);
        await new Promise(r => setTimeout(r, 600));
        setHistory(h => {
             const newH = [...h];
             newH.pop(); 
             return newH;
        });

        addToHistory('output', (
          <div className="mb-4 animate-in fade-in duration-700">
             <pre className="text-cyan-400 text-[8px] sm:text-[10px] md:text-xs leading-none font-bold select-none mb-3">
              {PORTFOLIO_DATA.asciiArt}
            </pre>
            <div className="text-slate-300">Welcome to My Interactive Portfolio.</div>
            <div className="text-slate-500 text-xs mt-1">Type 'ls' to view files, 'cd' to change directories, or click on items to navigate.</div>
          </div>
        ), effectivePath);
        break;

      default:
         addToHistory('output', <span className="text-red-400">zsh: command not found: {cmd}</span>, effectivePath);
    }

    setInput('');
  };

  const handleItemClick = async (name: string, type: 'file' | 'dir' | 'exec') => {
    // CRITICAL FIX: Read current path from Ref to avoid stale closures in onClick handlers
    const current = pathRef.current;
    
    if (isTyping) return;
    
    if (type === 'dir') {
       const rootSubdirs = ['Experience', 'Projects'];
       let command = `cd ${name}`;
       let targetPath = `${current}/${name}`;

       // Smart Navigation logic
       if (rootSubdirs.includes(name)) {
          if (current === '~/Portfolio') {
             command = `cd ${name}`;
             targetPath = `~/Portfolio/${name}`;
          } else if (current.startsWith('~/Portfolio/')) {
             command = `cd ../${name}`;
             targetPath = `~/Portfolio/${name}`;
          }
       }

       await typeCommand(command);
       addToHistory('command', command, current); 
       setInput(''); // Clear input after typing command
       
       setCurrentPath(targetPath);
       
       // Explicitly show 'ls' command in history, then execute it
       addToHistory('command', 'ls', targetPath);
       await executeCommand('ls', false, targetPath);

    } else if (type === 'exec') {
       const cmd = name;
       await typeCommand(cmd);
       addToHistory('command', cmd, current);
       executeCommand(cmd, false, current);
    } else {
       const cmd = `cat ${name}`;
       await typeCommand(cmd);
       // Pass 'current' explicitly so even if this function is stale, it uses the Ref value
       addToHistory('command', cmd, current); 
       executeCommand(cmd, false, current); 
    }
  };

  const handleBack = async () => {
    if (isTyping) return;
    
    // Simulate navigation back
    const cmd = "cd ~"; 
    await typeCommand(cmd);
    
    // Hard reset of history
    setHistory([]);
    setCurrentPath('~/Portfolio');
    
    const rootPath = '~/Portfolio';
    const homePath = '~';

    // Rerun boot sequence
    setHistory([{
        id: 'boot',
        type: 'output',
        content: `Last login: ${new Date().toLocaleString()} on ttys000`,
        path: '' 
    }]);

    await new Promise(r => setTimeout(r, 600));

    // Fake the startup commands
    addToHistory('command', 'cd Portfolio', homePath);
    
    addToHistory('command', './intro', rootPath);
    await executeCommand('./intro', false, rootPath);
    
    addToHistory('command', 'ls', rootPath);
    await executeCommand('ls', false, rootPath);
  };

  // Initial Boot Sequence
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    const boot = async () => {
      setHistory([{
        id: 'boot',
        type: 'output',
        content: `Last login: ${new Date().toLocaleString()} on ttys000`,
        path: '' 
      }]);

      await new Promise(r => setTimeout(r, 600));
      
      const rootPath = '~/Portfolio';

      // cd Portfolio
      await typeCommand('cd Portfolio');
      addToHistory('command', 'cd Portfolio', '~'); 
      setCurrentPath(rootPath);

      // ./intro
      await typeCommand('./intro');
      addToHistory('command', './intro', rootPath);
      await executeCommand('./intro', false, rootPath);

      // ls
      await typeCommand('ls');
      addToHistory('command', 'ls', rootPath);
      await executeCommand('ls', false, rootPath);
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input, true);
    }
  };

  return (
    <div 
      className="w-full max-w-4xl h-[85vh] md:h-[650px] bg-slate-950/90 backdrop-blur-md rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 ring-1 ring-black"
      onClick={handleContainerClick}
    >
      {/* Title Bar */}
      <div className="h-8 bg-[#1f2329] flex items-center px-4 select-none sticky top-0 z-10 border-b border-black/50 justify-between">
        <div className="flex space-x-2 group w-20">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center">
            <CloseIcon/>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center">
            <MinimizeIcon/>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center">
             <MaximizeIcon/>
          </div>
        </div>
        <div className="flex items-center justify-center text-slate-500 text-xs font-semibold font-mono flex-1 opacity-70">
           <span className="mr-1">📁</span> ivan — -zsh
        </div>
        <div className="w-20"></div>
      </div>

      {/* Content Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-3 md:p-4 overflow-y-auto font-mono text-[13px] md:text-[15px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {history.map((line) => (
          <div key={line.id} className="mb-1 break-words">
            {line.type === 'command' ? (
              <div className="flex items-center flex-wrap">
                {line.path && <Prompt path={line.path} />}
                <span className="text-slate-100">{line.content}</span>
              </div>
            ) : (
              <div className="text-slate-300">
                {line.content}
              </div>
            )}
          </div>
        ))}

        {/* Current Input Line */}
        <div className="flex items-center">
          <Prompt path={currentPath} />
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none text-slate-100 w-full font-normal"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              disabled={isTyping}
            />
            {/* Blinking Block Cursor */}
            {!isTyping && (
               <div 
                 className="absolute top-[2px] h-[1.2em] w-2.5 bg-slate-500 opacity-50 animate-pulse pointer-events-none"
                 style={{ left: `${input.length}ch` }}
               />
            )}
          </div>
        </div>
      </div>
      
      {/* Footer / Back Button Area */}
      {/* Always visible footer for reset functionality */}
       <div className="h-10 bg-[#1f2329]/50 border-t border-slate-800 flex items-center px-4 text-xs text-slate-500 gap-4 transition-all">
         <button 
           onClick={handleBack}
           disabled={isTyping}
           className={`hover:text-cyan-400 hover:bg-slate-800 px-2 py-1 rounded transition-all flex items-center gap-1 ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
         >
           <span>⬅</span> Back to Home
         </button>
       </div>
    </div>
  );
};