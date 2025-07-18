"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { StepsList } from "../../components/StepsList"
import { FileExplorer } from "../../components/FileExplorer"
import { TabView } from "../../components/TabView"
import { CodeEditor } from "../../components/CodeEditor"
import { PreviewFrame } from "../../components/PreviewFrame"
import { type Step, type FileItem, StepType } from "../../lib/ts"
import { parseXml } from "../../lib/steps"
import { useWebContainer } from "../../hooks/usewebContainerHook"
import { Loader } from "../../components/Loader"
import { Send, Sparkles, Code2, FolderOpen } from "lucide-react"
import axios from "axios"
import "../../app/globals.css"

 const Builder = () => {
    const searchParams = useSearchParams();
    const prompt = searchParams.get('prompt') || '';
    const [userPrompt, setPrompt] = useState("");
    const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", message: string; }[]>([]);
    const [loading, setLoading] = useState(false);
    const [templateSet, setTemplateSet] = useState(false);
    const webcontainer = useWebContainer();

    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

    const [steps, setSteps] = useState<Step[]>([]);

    const [files, setFiles] = useState<FileItem[]>([]);


    async function init() {
        console.log("prompt", prompt);
        const response = await axios.post(`/api/stacktemplate`, {
            message: prompt
        });
        console.log("response", response.data);
        setTemplateSet(true);

        const { prompts, uiPrompts } = response.data;

        setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
            ...x,
            status: "pending"
        })));
     

        setLoading(true);
        const stepsResponse = await axios.post(`/api/chats`, {
            messages: [...prompts, prompt].map(content => ({
                role: "user",
                message: content
            }))
        })

        setLoading(false);

        setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
            ...x,
            status: "pending" as "pending"
        }))]);

        setLlmMessages([...prompts, prompt].map(content => ({
            role: "user",
            message: content
        })));

        setLlmMessages(x => [...x, { role: "assistant", message: stepsResponse.data.response }])
    }

    useEffect(() => {
        let originalFiles = [...files];
        let updateHappened = false;
        steps.filter(({ status }) => status === "pending").map(step => {
            updateHappened = true;
            if (step?.type === StepType.CreateFile) {
                let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
                let currentFileStructure = [...originalFiles]; // {}
                let finalAnswerRef = currentFileStructure;

                let currentFolder = ""
                while (parsedPath.length) {
                    currentFolder = `${currentFolder}/${parsedPath[0]}`;
                    let currentFolderName = parsedPath[0];
                    parsedPath = parsedPath.slice(1);

                    if (!parsedPath.length) {
                        // final file
                        let file = currentFileStructure.find(x => x.path === currentFolder)
                        if (!file) {
                            currentFileStructure.push({
                                name: currentFolderName,
                                type: 'file',
                                path: currentFolder,
                                content: step.code
                            })
                        } else {
                            file.content = step.code;
                        }
                    } else {
                        /// in a folder
                        let folder = currentFileStructure.find(x => x.path === currentFolder)
                        if (!folder) {
                            // create the folder
                            currentFileStructure.push({
                                name: currentFolderName,
                                type: 'folder',
                                path: currentFolder,
                                children: []
                            })
                        }

                        currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
                    }
                }
                originalFiles = finalAnswerRef;
            }

        })

        if (updateHappened) {

            setFiles(originalFiles)
            setSteps(steps => steps.map((s: Step) => {
                return {
                    key: s.id,
                    ...s,
                    status: "completed"
                }

            }))
        }
        console.log(files);
    }, [steps, files]);

    useEffect(() => {
        const createMountStructure = (files: FileItem[]): Record<string, any> => {
            const mountStructure: Record<string, any> = {};

            const processFile = (file: FileItem, isRootFolder: boolean) => {
                if (file.type === 'folder') {
                    // For folders, create a directory entry
                    mountStructure[file.name] = {
                        directory: file.children ?
                            Object.fromEntries(
                                file.children.map(child => [child.name, processFile(child, false)])
                            )
                            : {}
                    };
                } else if (file.type === 'file') {
                    if (isRootFolder) {
                        mountStructure[file.name] = {
                            file: {
                                contents: file.content || ''
                            }
                        };
                    } else {
                        // For files, create a file entry with contents
                        return {
                            file: {
                                contents: file.content || ''
                            }
                        };
                    }
                }

                return mountStructure[file.name];
            };

            // Process each top-level file/folder
            files.forEach(file => processFile(file, true));

            return mountStructure;
        };

        const mountStructure = createMountStructure(files);

        // Mount the structure if WebContainer is available
        console.log(mountStructure);
        webcontainer?.mount(mountStructure);
    }, [files, webcontainer]);

   

    useEffect(() => {
        init();
    }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Sophisticated Header */}
      <header className="bg-card border-b border-border shadow-sm backdrop-blur-sm">
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm" />
              </div>
              <div className="">
                <h1 className="text-2xl font-bold text-foreground">bolt-vibe</h1>
                <p className="text-sm text-muted-foreground max-w-2xl truncate">
                  Building: <span className="text-foreground font-medium">{prompt}</span>
                </p>
              </div>
            </div>
           
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className=" bg-background">
        <div className=" grid grid-cols-12 gap-8 p-4">
          {/* Left Panel - Steps & Chat */}
          <div className="col-span-3 space-y-4">
            {/* Build Steps Section */}
            <div className="bg-card border border-border rounded-xl shadow-lg ">
              <div className="px-6 py-4 border-b border-border bg-accent/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <h2 className="text-lg font-semibold text-foreground">Build Steps</h2>
                  <div className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {steps.filter((s) => s.status === "completed").length}/{steps.length}
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-[50vh] overflow-auto">
                <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-accent/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-chart-1 rounded-full" />
                  <h3 className="text-lg font-semibold text-foreground">Continue Building</h3>
                </div>
              </div>
              <div className="p-6">
                {loading || !templateSet ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe additional features or modifications..."
                        className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 resize-none text-foreground placeholder:text-muted-foreground min-h-[120px]"
                        rows={4}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {userPrompt.length}/500
                      </div>
                    </div>
                    <button onClick={async () => {
                                            const newMessage = {
                                                role: "user" as "user",
                                                message: userPrompt
                                            };

                                            setLoading(true);
                                            const stepsResponse = await axios.post(`/api/chats`, {
                                                messages: [...llmMessages, newMessage]
                                            });
                                            setLoading(false);

                                            setLlmMessages(x => [...x, newMessage]);
                                            setLlmMessages(x => [...x, {
                                                role: "assistant",
                                                message: stepsResponse.data.response
                                            }]);

                                            setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                                                ...x,
                                                status: "pending" as "pending"
                                            }))]);

                                        }} >Send</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Panel - File Explorer */}
          <div className="col-span-3">
            <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-border bg-accent/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-chart-2 rounded-full" />
                  <h2 className="text-lg font-semibold text-foreground">Project Files</h2>
                  <div className="ml-auto">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
                <FileExplorer files={files} onFileSelect={setSelectedFile} />
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor & Preview */}
          <div className="col-span-6">
            <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden h-full">
              <div className="border-b border-border bg-accent/20">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-chart-3 rounded-full" />
                      <h2 className="text-lg font-semibold text-foreground">Code Workspace</h2>
                    </div>
                    {selectedFile && (
                      <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
                <TabView activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
              <div className="h-[calc(100%-8rem)]">
                {activeTab === "code" ? (
                  <CodeEditor file={selectedFile} />
                ) : (
                  <PreviewFrame webContainer={webcontainer!} files={files} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Builder />
    </Suspense>
  );
}
