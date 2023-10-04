import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Sandbox } from "@/app/api/db/sandbox";

export function DatabaseLine(props: { label: string, value: string }) {

    const { toast } = useToast()

    function copyToClipboard(event: any) {
        navigator.clipboard.writeText(event.target.innerText)
        toast({
            title: "Copied to clipboard",
            description: "The value has been copied to your clipboard.",
        })
    }

    return (
        <div>{props.label}: <Button className="bg-transparent text-blue-600 p-2 hover:text-slate-50" onClick={copyToClipboard}>{props.value}</Button></div>
    );
}
