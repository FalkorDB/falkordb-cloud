import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sandbox } from "@/app/api/db/sandbox";
import { DatabaseLine } from "./DatabaseLine";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { BASH_EXAMPLE, JS_EXAMPLE, PYTHON_EXAMPLE, MORE_EXAMPLE } from "./GettingStrartedExamples";

export function DatabaseDetails(props: { sandbox: Sandbox, onDelete: () => void }) {

    let sandbox = props.sandbox
    let caURL = null;
    let protocol = 'redis'
    if (sandbox.tls) {
        const blob = new Blob([sandbox.cacert], { type: 'text/plain' });
        caURL = URL.createObjectURL(blob);
        protocol = 'rediss'
    }

    let redisURL = `${protocol}://${sandbox.username}:${sandbox.password}@${sandbox.host}:${sandbox.port}`
    let redisURLMasked = `${protocol}://${sandbox.username}:********@${sandbox.host}:${sandbox.port}`

    return (
        <div className="flex flex-wrap">
            <div className="flex flex-col space-y-2 m-2">
                <DatabaseLine label="Host" value={sandbox.host} />
                <DatabaseLine label="Port" value={sandbox.port.toString()} />
                <DatabaseLine label="Username" value={sandbox.username} />
                <DatabaseLine label="Password" value={sandbox.password} masked="********" />
                <DatabaseLine label="Connection URL" value={redisURL} masked={redisURLMasked} />
                {caURL &&
                    <div className="flex items-center">
                        <a download="ca.crt" href={caURL}><u>Download CA certificate</u></a>
                    </div>
                }
                <div className="">
                    <AlertDialog>
                        <AlertDialogTrigger className="bg-blue-600 p-2 text-slate-50 rounded-md hover:bg-primary/90">Delete Sandbox</AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your sandbox
                                    and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-blue-600 p-4 text-slate-50">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-blue-600 p-4 text-slate-50" onClick={props.onDelete}>Delete Sandbox</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <div className="max-w-xs lg:max-w-4xl lg:grow md:bg-gray-300 md:rounded-lg dark:bg-zinc-850 p-1 m-2">
                <Tabs defaultValue="javascript">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="cli">CLI</TabsTrigger>
                        <TabsTrigger value="more">More</TabsTrigger>
                    </TabsList>
                    <TabsContent value="javascript">
                        {JS_EXAMPLE}
                    </TabsContent>
                    <TabsContent value="python">
                        {PYTHON_EXAMPLE}
                    </TabsContent>
                    <TabsContent value="cli">
                        {BASH_EXAMPLE}
                    </TabsContent>
                    <TabsContent value="more">
                        {MORE_EXAMPLE}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
