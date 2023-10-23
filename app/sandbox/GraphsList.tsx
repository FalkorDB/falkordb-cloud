import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Combobox } from '../components/combobox';
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button';

// A component that renders an input box for Cypher queries
export function GraphsList(props: { onSelectedGraph: Dispatch<SetStateAction<string>> }) {

    const [graphs, setGraphs] = useState<string[]>([]);
    const [examples, setExamples] = useState<string[]>([]);
    const [selectedGraph, setSelectedGraph] = useState("");
    const { toast } = useToast()

    useEffect(() => {
        fetch('/api/graph', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                toast({
                    title: "Error",
                    description: result.text(),
                })
                return { result: [] }
            }).then((result) => {
                setGraphs(result.result.graphs ?? [])
            })
    }, [toast])

    // Fetch at build time
    useEffect(() => {
        fetch('/api/examples', {
            cache: 'force-cache',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                return { result: [] }
            }).then((result) => {
                setExamples(result.result.examples ?? [])
            })
    }, [])

    function addOption(newGraphs: SetStateAction<string[]>) {
        setGraphs(newGraphs)
        setSelectedValue(graphs[graphs.length - 1])
    }

    function setSelectedValue(graph: SetStateAction<string>) {
        setSelectedGraph(graph)
        props.onSelectedGraph(graph)
    }

    function addSampleDatabase(sample: string) {

        if (graphs.includes(sample)) {
            setSelectedValue(sample)
            toast({
                title: "Error",
                description: `Graph ${sample} already exists`
            })
            return
        }

        fetch('/api/examples', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: sample })
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                toast({
                    title: "Error",
                    description: result.text(),
                })
                return { result: [] }
            }).then((result) => {
                graphs.push(sample)
                setGraphs(graphs)
                setSelectedValue(sample)
            })
    }

    let samples_list = examples.map((sample) => {
        return (
            <Button className="bg-blue-600 p-2 text-slate-50" key={sample} onClick={ev => addSampleDatabase(sample)}>{sample}</Button>
        )
    })

    return (
        <>
            {samples_list.length > 0 &&
                <div className='flex flex-wrap space-x-2'>
                    <div className="py-2">Examples:</div>
                    {samples_list}
                </div>
            }
            <Combobox type={"Graph"} options={graphs} addOption={addOption} selectedValue={selectedGraph} setSelectedValue={setSelectedValue} />
        </>
    )
}
