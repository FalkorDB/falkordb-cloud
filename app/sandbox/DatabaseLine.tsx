import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function DatabaseLine(props: { label: string, value: string, masked?: string }) {

    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false);

    function copyToClipboard(value: string) {
        navigator.clipboard.writeText(value)
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
            <Button className="bg-transparent text-blue-600 px-2 hover:text-slate-50" onClick={() => copyToClipboard(props.value)}>
                <div>{(showPassword || !props.masked) ? props.value : props.masked}</div>
                <Copy className="ml-2 px-0" />
            </Button>
            {props.masked &&
                <Button className="bg-transparent text-blue-600 px-2 hover:text-slate-50" onClick={showMasked}>
                    {showPassword ? <EyeOff className="m-0 p-0" /> : <Eye className="m-0 p-0" />}
                </Button>
            }
        </div>
    );
}
