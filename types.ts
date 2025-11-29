import React from 'react';

export interface Project {
  name: string;
  description: string;
  tech: string[];
  link?: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  details: string[];
}

export interface PortfolioData {
  name: string;
  asciiArt: string;
  about: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
}

export type FileSystemNode = 
  | { type: 'file'; content: React.ReactNode; name: string }
  | { type: 'directory'; children: Record<string, FileSystemNode>; name: string };

export interface TerminalLine {
  id: string;
  type: 'command' | 'output';
  content: React.ReactNode;
  path?: string;
}

export enum CommandType {
  CD = 'cd',
  LS = 'ls',
  CAT = 'cat',
  CLEAR = 'clear',
  HELP = 'help',
  UNKNOWN = 'unknown',
  EXEC = 'exec', // For ./intro
  AI = 'ai',
}