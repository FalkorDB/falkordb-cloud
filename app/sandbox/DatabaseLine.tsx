import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"
import { Copy, Eye } from "lucide-react";
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
        <div className="flex flex-row space-x-0">
            <div className="py-2">{props.label}:</div>            
            <Button className="bg-transparent text-blue-600 px-2 hover:text-slate-50" onClick={copyToClipboard} aria-label={props.value.toString()}>
                <div>{(showPassword || !props.masked) ? props.value : props.masked}</div>
                <Copy className="ml-2 px-0"/>
            </Button>
            {props.masked &&
                <Button className="bg-transparent text-blue-600 px-2 hover:text-slate-50" onClick={showMasked}>
                    <Eye  className="m-0 p-0"/>
                </Button>
            }
        </div>
    );
}
