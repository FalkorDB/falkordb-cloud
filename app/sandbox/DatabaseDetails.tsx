import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Sandbox } from "@/app/api/db/sandbox";


export function DatabaseDetails(props: { sandbox: Sandbox, onDelete: () => void }) {

    const { toast } = useToast()

    function copyToClipboard(event: any) {
        navigator.clipboard.writeText(event.target.innerText)
        toast({
            title: "Copied to clipboard",
            description: "The value has been copied to your clipboard.",
        })
    }

    let sandbox = props.sandbox
    let redisURL = `redis://${sandbox.password}@${sandbox.host}:${sandbox.port}`
    // Return the JSX element that renders the input box and a submit button
    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <Button className="rounded-full bg-blue-600 p-2 text-slate-50">Delete Sandbox</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your sandbox
                            and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <Button className="rounded-full bg-blue-600 p-4 text-slate-50" onClick={props.onDelete}>Delete Sandbox</Button>
                </DialogContent>
            </Dialog>
            <div>Host: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{sandbox.host}</Button></div>
            <div>Port: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{sandbox.port}</Button></div>
            <div>Password: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{sandbox.password}</Button></div>
            <div>Redis URL: <Button className="bg-transparent text-blue-600 p-2" onClick={copyToClipboard}>{redisURL}</Button></div>
        </>
    );
}
