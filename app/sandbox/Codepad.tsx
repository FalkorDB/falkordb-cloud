import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from '@/components/ui/use-toast';

import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('python', python);

function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value)
    toast({
        title: "Copied to clipboard",
        description: "The value has been copied to your clipboard.",
    })
}

export function CodePad(props: { code: string, language: string, docs: string }) {
    return (
        <div>
            <a className="underline text-blue-600" href={props.docs} target="_blank" rel="noopener noreferrer">Read more</a>
            <Button className="bg-transparent text-blue-600 px-2 hover:text-slate-50" onClick={() => copyToClipboard(props.code)}>
                <Copy className="ml-2 px-0" />
            </Button>
            <SyntaxHighlighter language={props.language} style={dracula}>{props.code}</SyntaxHighlighter>
        </div>
    )
}