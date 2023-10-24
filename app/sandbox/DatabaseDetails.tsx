import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sandbox } from "@/app/api/db/sandbox";
import { DatabaseLine } from "./DatabaseLine";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { BASH_EXAMPLE, JS_EXAMPLE, PYTHON_EXAMPLE } from "./GettingStrartedExamples";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

export function DatabaseDetails(props: { sandbox: Sandbox, onDelete: () => void }) {

    let sandbox = props.sandbox
    let redisURL = `rediss://${sandbox.password}@${sandbox.host}:${sandbox.port}`
    let redisURLMasked = `rediss://********@${sandbox.host}:${sandbox.port}`


    let caURL = null;
    if (sandbox.tls) {
        const blob = new Blob([sandbox.cacert], { type: 'text/plain' });
        caURL = URL.createObjectURL(blob);
    }

    return (
        <div className="flex flex-wrap">
            <div className="flex flex-col space-y-2 m-2">
                <div className="flex flex-col lg:flex-row lg:space-x-2">
                    <DatabaseLine label="Host" value={sandbox.host} />
                    <DatabaseLine label="Port" value={sandbox.port.toString()} />
                    <DatabaseLine label="Password" value={sandbox.password} masked="********" />
                </div>
                <div className="flex flex-col lg:flex-row lg:space-x-2">
                    <DatabaseLine label="Connection URL" value={redisURL} masked={redisURLMasked} />
                    {caURL &&
                        <div className="flex items-center">
                            <a download="ca.crt" href={caURL}><u>CA certificate</u></a>
                        </div>
                    }
                </div>
                <div className="">
                    <Dialog>
                        <DialogTrigger className="bg-blue-600 p-2 text-slate-50 rounded-md hover:bg-primary/90">
                            Delete Sandbox
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your sandbox
                                    and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <Button className="bg-blue-600 p-4 text-slate-50" onClick={props.onDelete}>Delete Sandbox</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="max-w-xs lg:max-w-6xl md:max-w-2xl lg:grow md:bg-gray-300 md:rounded-lg dark:bg-zinc-850 p-1 m-2">
                <Tabs defaultValue="javascript">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="cli">CLI</TabsTrigger>
                    </TabsList>
                    <TabsContent value="javascript">
                        <SyntaxHighlighter language="javascript" style={dracula}>
                            {JS_EXAMPLE}
                        </SyntaxHighlighter>
                    </TabsContent>
                    <TabsContent value="python">
                        <SyntaxHighlighter language="python" style={dracula}>
                            {PYTHON_EXAMPLE}
                        </SyntaxHighlighter>
                    </TabsContent>
                    <TabsContent value="cli">
                        <SyntaxHighlighter language="bash" style={dracula}>
                            {BASH_EXAMPLE}
                        </SyntaxHighlighter>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
