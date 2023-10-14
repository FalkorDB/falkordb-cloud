import { CheckCircle } from "lucide-react";

export default function FeatureItem(props: { text: string }) {
    return (<li className="flex items-center">
        <CheckCircle className="text-green-500" />
        {props.text}
    </li>)
}