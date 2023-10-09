import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react";

export function DatabaseLine(props: { label: string, value: string, masked?: string }) {

    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false);

    function copyToClipboard(event: any) {
        navigator.clipboard.writeText(event.target.getAttribute("aria-label"))
        toast({
            title: "Copied to clipboard",
            description: "The value has been copied to your clipboard.",
        })
    }

    function showMasked() {
        setShowPassword(!showPassword)
    }

    return (
        <div>{props.label}: <Button className="bg-transparent text-blue-600 p-2 hover:text-slate-50" onClick={copyToClipboard} aria-label={props.value.toString()}>
            {(showPassword || !props.masked) ? props.value : props.masked}&ensp;
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
            </Button>
            {props.masked &&
                <Button className="bg-transparent text-blue-600 p-2 hover:text-slate-50" onClick={showMasked}> 
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
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </Button>
            }
        </div>
    );
}
