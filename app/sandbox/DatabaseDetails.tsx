import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Sandbox } from "@/app/api/db/sandbox";
import { DatabaseLine } from "./DatabaseLine";

export function DatabaseDetails(props: { sandbox: Sandbox, onDelete: () => void }) {

    let sandbox = props.sandbox
    let redisURL = `rediss://${sandbox.password}@${sandbox.host}:${sandbox.port}`
    let redisURLMasked = `rediss://********@${sandbox.host}:${sandbox.port}`
    return (
        <>
            <div className="flex flex-wrap">
                <DatabaseLine label="Host" value={sandbox.host} />
                <DatabaseLine label="Port" value={sandbox.port.toString()} />
                <DatabaseLine label="Password" value={sandbox.password} masked="********" />
                <DatabaseLine label="Redis URL" value={redisURL} masked={redisURLMasked} />
                {sandbox.tls &&
                    <DatabaseLine label="CaCert" value={sandbox.cacert} masked="***" />
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
