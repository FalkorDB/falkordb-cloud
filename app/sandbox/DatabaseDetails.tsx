import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sandbox } from "@/app/api/db/sandbox";
import { DatabaseLine } from "./DatabaseLine";
import Link from "next/link";

export function DatabaseDetails(props: { sandbox: Sandbox, onDelete: () => void }) {

    let sandbox = props.sandbox
    let redisURL = `rediss://${sandbox.password}@${sandbox.host}:${sandbox.port}`
    let redisURLMasked = `rediss://********@${sandbox.host}:${sandbox.port}`

    
    let caURL = null;
    if(sandbox.tls) {
        const blob = new Blob([sandbox.cacert], {type: 'text/plain'});
        caURL = URL.createObjectURL(blob);
    }

    
    return (
        <>
            <div className="flex flex-wrap items-center space-x-2">
                <DatabaseLine label="Host" value={sandbox.host} />
                <DatabaseLine label="Port" value={sandbox.port.toString()} />
                <DatabaseLine label="Password" value={sandbox.password} masked="********" />
                <DatabaseLine label="Redis URL" value={redisURL} masked={redisURLMasked} />
                {caURL &&
                    <a download="ca.crt" href={caURL}><u>CA certificate</u></a>
                }
                <Dialog>
                    <DialogTrigger>
                        <Button className="bg-blue-600 p-2 text-slate-50">
                            Delete Sandbox
                        </Button>
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
        </>
    );
}
