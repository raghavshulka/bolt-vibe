"use client";
import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useRef, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer | undefined;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const devServerStarted = useRef(false);

  async function main() {
    if (!webContainer) return; // <-- Fix: wait for webContainer to be ready
    if (devServerStarted.current) return;
    devServerStarted.current = true;

    const installProcess = await webContainer.spawn('npm', ['install']);
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    await webContainer.spawn('npm', ['run', 'dev']);

    webContainer.on('server-ready', (port, url) => {
      console.log(url)
      console.log(port)
      setUrl(url);
    });
  }

  useEffect(() => {
    main();
    // Optionally, add webContainer as a dependency if it can change
  }, []);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}