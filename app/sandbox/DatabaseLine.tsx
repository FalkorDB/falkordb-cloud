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
        <div>{props.label}: <Button className="bg-transparent text-blue-600 p-2 hover:text-slate-50" onClick={copyToClipboard}>
            {props.value}&ensp; 
            <svg
                className=" h-4 w-4"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
        </Button></div>
    );
}
