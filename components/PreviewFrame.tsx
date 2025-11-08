"use client";
import { WebContainer, type FileSystemTree } from '@webcontainer/api';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Terminal } from 'lucide-react';
import type { FileItem } from '@/lib/ts';

interface PreviewFrameProps {
  files: FileItem[];
  webContainer: WebContainer | undefined;
}

type ProcessStatus = 'idle' | 'installing' | 'starting' | 'running' | 'error';

interface TerminalLine {
  type: 'stdout' | 'stderr' | 'system';
  content: string;
  timestamp: number;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const devServerProcessRef = useRef<any>(null);
  const installProcessRef = useRef<any>(null);
  const hasStartedRef = useRef(false);
  const mountStructureRef = useRef<FileSystemTree | null>(null);

  // Convert FileItem[] to FileSystemTree format
  const convertFilesToMountStructure = useCallback((fileItems: FileItem[]): FileSystemTree => {
    const mountStructure: FileSystemTree = {};

    const processFile = (file: FileItem): any => {
      if (file.type === 'folder') {
        const directory: Record<string, any> = {};
        if (file.children) {
          file.children.forEach((child) => {
            directory[child.name] = processFile(child);
          });
        }
        return { directory };
      } else {
        return {
          file: {
            contents: file.content || '',
          },
        };
      }
    };

    fileItems.forEach((file) => {
      mountStructure[file.name] = processFile(file);
    });

    return mountStructure;
  }, []);

  const addTerminalLine = useCallback((type: TerminalLine['type'], content: string) => {
    setTerminalOutput((prev) => [
      ...prev,
      { type, content, timestamp: Date.now() },
    ]);
  }, []);

  const scrollToBottom = useCallback(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [terminalOutput, scrollToBottom]);

  const cleanup = useCallback(() => {
    if (devServerProcessRef.current) {
      try {
        devServerProcessRef.current.kill();
      } catch (e) {
        // Ignore cleanup errors
      }
      devServerProcessRef.current = null;
    }
    if (installProcessRef.current) {
      try {
        installProcessRef.current.kill();
      } catch (e) {
        // Ignore cleanup errors
      }
      installProcessRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startDevServer = useCallback(async () => {
    if (!webContainer || hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      setStatus('installing');
      setError(null);
      addTerminalLine('system', '📦 Starting npm install...');

      // Start npm install
      const installProcess = await webContainer.spawn('npm', ['install'], {
        output: true,
      });
      installProcessRef.current = installProcess;

      // Capture install output
      const installOutput: string[] = [];
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk: unknown) {
            try {
              let text: string;
              if (typeof chunk === 'string') {
                text = chunk;
              } else if (chunk && typeof chunk === 'object') {
                if (chunk instanceof Uint8Array) {
                  text = new TextDecoder().decode(chunk);
                } else if (chunk instanceof ArrayBuffer) {
                  text = new TextDecoder().decode(chunk);
                } else {
                  // Fallback: convert to string
                  text = String(chunk);
                }
              } else {
                // Fallback: convert to string
                text = String(chunk);
              }
              installOutput.push(text);
              addTerminalLine('stdout', text);
            } catch (err) {
              console.error('Error processing install output:', err);
              // Continue processing even if one chunk fails
            }
          },
        })
      );

      // Wait for install to complete
      let installExitCode: number;
      try {
        installExitCode = await installProcess.exit;
      } catch (err) {
        console.error('Error waiting for install process:', err);
        installExitCode = 143; // SIGTERM
      }
      installProcessRef.current = null;

      // Handle different exit codes
      if (installExitCode === 143) {
        // SIGTERM - process was killed (might be due to cleanup or timeout)
        const errorMsg = installOutput.join('') || 'Installation process was terminated';
        setError('Installation was interrupted (process killed). This may happen if the process takes too long or was manually stopped.');
        addTerminalLine('stderr', `❌ Installation interrupted (exit code 143): ${errorMsg}`);
        addTerminalLine('system', '💡 Tip: Try again or check if dependencies are already installed');
        setStatus('error');
        hasStartedRef.current = false;
        return;
      } else if (installExitCode !== 0) {
        // Other non-zero exit codes indicate actual errors
        const errorMsg = installOutput.join('') || 'npm install failed';
        setError(`Installation failed with exit code ${installExitCode}`);
        addTerminalLine('stderr', `❌ Installation failed: ${errorMsg}`);
        setStatus('error');
        hasStartedRef.current = false;
        return;
      }

      addTerminalLine('system', '✅ Installation completed successfully');
      setStatus('starting');
      addTerminalLine('system', '🚀 Starting development server...');

      // Start dev server
      const devProcess = await webContainer.spawn('npm', ['run', 'dev'], {
        output: true,
      });
      devServerProcessRef.current = devProcess;

      // Capture dev server output
      devProcess.output.pipeTo(
        new WritableStream({
          write(chunk: unknown) {
            try {
              let text: string;
              if (typeof chunk === 'string') {
                text = chunk;
              } else if (chunk && typeof chunk === 'object') {
                if (chunk instanceof Uint8Array) {
                  text = new TextDecoder().decode(chunk);
                } else if (chunk instanceof ArrayBuffer) {
                  text = new TextDecoder().decode(chunk);
                } else {
                  // Fallback: convert to string
                  text = String(chunk);
                }
              } else {
                // Fallback: convert to string
                text = String(chunk);
              }
              addTerminalLine('stdout', text);
            } catch (err) {
              console.error('Error processing dev server output:', err);
              // Continue processing even if one chunk fails
            }
          },
        })
      );

      // Handle process exit
      devProcess.exit.then((exitCode) => {
        if (exitCode !== 0) {
          setError(`Development server exited with code ${exitCode}`);
          addTerminalLine('stderr', `❌ Server exited with code ${exitCode}`);
          setStatus('error');
          hasStartedRef.current = false;
        }
      });

      // Listen for server-ready event
      webContainer.on('server-ready', (port, url) => {
        addTerminalLine('system', `✅ Server ready on port ${port}`);
        addTerminalLine('system', `🌐 URL: ${url}`);
        setUrl(url);
        setStatus('running');
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addTerminalLine('stderr', `❌ Error: ${errorMessage}`);
      setStatus('error');
      hasStartedRef.current = false;
      console.error('Failed to start dev server:', err);
    }
  }, [webContainer, addTerminalLine]);

  useEffect(() => {
    if (webContainer && files && files.length > 0) {
      // Reset state when files change
      hasStartedRef.current = false;
      setUrl(null);
      setStatus('idle');
      setTerminalOutput([]);
      setError(null);
      cleanup();

      // Convert files to mount structure and mount
      const mountStructure = convertFilesToMountStructure(files);
      mountStructureRef.current = mountStructure;

      webContainer
        .mount(mountStructure)
        .then(() => {
          addTerminalLine('system', '✅ Files mounted successfully');
          // Small delay to ensure mount is complete
          const timer = setTimeout(() => {
            startDevServer();
          }, 500);
          return () => clearTimeout(timer);
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : 'Failed to mount files';
          setError(errorMessage);
          addTerminalLine('stderr', `❌ Mount error: ${errorMessage}`);
          setStatus('error');
          console.error('Failed to mount files:', err);
        });
    }
  }, [webContainer, files, convertFilesToMountStructure, startDevServer, cleanup, addTerminalLine]);

  const getStatusIcon = () => {
    switch (status) {
      case 'installing':
      case 'starting':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'running':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'installing':
        return 'Installing dependencies...';
      case 'starting':
        return 'Starting server...';
      case 'running':
        return 'Server running';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-foreground">{getStatusText()}</span>
        </div>
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Terminal className="w-4 h-4" />
          {showTerminal ? 'Hide' : 'Show'} Terminal
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Terminal output */}
        {showTerminal && (
          <div className="flex-shrink-0 h-48 overflow-auto bg-[#1e1e1e] text-green-400 font-mono text-xs p-4 border-b border-border">
            {terminalOutput.length === 0 ? (
              <div className="text-muted-foreground">Waiting for output...</div>
            ) : (
              <div className="space-y-1">
                {terminalOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.type === 'stderr'
                        ? 'text-red-400'
                        : line.type === 'system'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    } whitespace-pre-wrap break-words`}
                  >
                    {line.content}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Preview iframe */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {!url && status !== 'error' && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                {status === 'idle' && <p>Preparing environment...</p>}
                {status === 'installing' && (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p>Installing dependencies...</p>
                  </>
                )}
                {status === 'starting' && (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p>Starting development server...</p>
                  </>
                )}
              </div>
            </div>
          )}
          {url && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          )}
          {status === 'error' && !url && (
            <div className="h-full flex items-center justify-center text-red-500">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p className="font-medium">Failed to start server</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check the terminal output above for details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
