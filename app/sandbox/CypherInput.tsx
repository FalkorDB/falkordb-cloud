import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from '../components/table/DataTable';
import { Category, DirectedGraph, GraphData, GraphLink } from '../components/DirectedGraph';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraphsList } from './GraphsList';
import { toast } from '@/components/ui/use-toast';

// A function that checks if a string is a valid Cypher query
// This is a very basic and incomplete validation, you may want to use a more robust parser
function isValidCypher(query: string) {
    // Check if the query starts with a valid clause (e.g. MATCH, CREATE, RETURN, etc.)
    const clauses = ['MATCH', 'CREATE', 'MERGE', 'DELETE', 'DETACH DELETE', 'SET', 'REMOVE', 'WITH', 'UNWIND', 'RETURN', 'ORDER BY', 'SKIP', 'LIMIT', 'UNION', 'CALL', 'LOAD CSV', 'FOREACH', 'PROFILE', 'EXPLAIN'];
    const firstWord = query.split(' ')[0].toUpperCase();
    if (!clauses.includes(firstWord)) {
        return false;
    }
    // Check if the query has balanced parentheses and brackets
    const stack = [];
    for (let char of query) {
        if (char === '(' || char === '[') {
            stack.push(char);
        } else if (char === ')' || char === ']') {
            if (stack.length === 0) {
                return false;
            }
            const top = stack.pop();
            if ((char === ')' && top !== '(') || (char === ']' && top !== '[')) {
                return false;
            }
        }
    }
    if (stack.length !== 0) {
        return false;
    }
    // You can add more validation rules here
    return true;
}

interface GraphResult {
    data: any[],
    metadata: any
}

interface ExtractedData {
    data: any[][],
    columns: string[],
    categories: Map<String, Category>,
    nodes: Map<number, GraphData>,
    edges: Map<string, GraphLink>,
}
    

function extractData(results: GraphResult | null) : ExtractedData {
    let columns: string[] = []
    let data: any[][] = []
    if (results?.data?.length) {
        if (results.data[0] instanceof Object) {
            columns = Object.keys(results.data[0])
        }
        data = results.data
    }

    let nodes = new Map<number, GraphData>()
    let categories = new Map<String, Category>()
    categories.set("default", { name: "default", index: 0})

    let edges = new Map<string, GraphLink>()

    data.forEach((row: any[]) => {
        Object.values(row).forEach((cell: any) => {
            if (cell instanceof Object) {
                if (cell.relationshipType) {

                    let sourceId = cell.sourceId.toString();
                    let destinationId = cell.destinationId.toString()
                    let edge = new GraphLink(sourceId, destinationId, cell.relationshipType)
                    let key = edge.toString()
                    let existing = edges.get(key)
                    if(!existing) {
                        edges.set(key, edge)
                    }
                    
                    // creates a fakeS node for the source and target
                    let source = nodes.get(cell.sourceId)
                    if(!source) {
                        source = { id: cell.sourceId.toString(), name: cell.sourceId.toString(), value: "", category: 0 }
                        nodes.set(cell.sourceId, source)
                    }

                    let destination = nodes.get(cell.destinationId)
                    if(!destination) {
                        destination = { id: cell.destinationId.toString(), name: cell.destinationId.toString(), value: "", category: 0 }
                        nodes.set(cell.destinationId, destination)
                    }
                } else if (cell.labels) {

                    // check if category already exists in categories
                    let category = categories.get(cell.labels[0])
                    if (!category) {
                        category = { name: cell.labels[0], index: categories.size }
                        categories.set(category.name, category)
                    }

                    // check if node already exists in nodes or fake node was created
                    let node = nodes.get(cell.id)
                    if (!node || node.value === "") {
                        node = { id: cell.id.toString(), name: cell.id.toString(), value: JSON.stringify(cell), category: category.index }
                        nodes.set(cell.id, node)
                    }
                }
            }
        })
    })

    return { data, columns, categories, nodes, edges}
}

const QUERY_PLACE_HOLDER = "MATCH (s)-[e]-(t) return s,e,t limit 100"

// A component that renders an input box for Cypher queries
export function CypherInput(props: { onSubmit: (graph: string, query: string) => Promise<any>, onGraphClick: (graph: string, id: number) => Promise<any> }) {

    const [results, setResults] = useState<GraphResult | null>(null);

    // A state variable that stores the user input
    const [query, setQuery] = useState('');

    // A state variable that stores the validation result
    const [valid, setValid] = useState(true);

    // Selected Graph
    const [selectedGraph, setSelectedGraph] = useState("");

    // A function that handles the change event of the input box
    async function handleChange(event: any) {

        if (event.key === "Enter") {
            await handleSubmit(event);
        }

        // Get the new value of the input box
        const value = event.target.value;

        // Update the query state
        setQuery(value);

        // Validate the query and update the valid state
        setValid(isValidCypher(value));
    }

    // A function that handles the submit event of the form
    async function handleSubmit(event: any) {
        // Prevent the default browser behavior of reloading the page
        event.preventDefault();


        if(!selectedGraph) {
            toast({
                title: "No graph selected",
                description: "Please select a graph from the list",
            })
            return
        }

        if(!valid) {
            toast({
                title: "Invalid query",
                description: "Please check the query syntax",
            })
            return
        }

        // If the query is valid, pass it to the parent component as a prop
        let q = query.length ? query : QUERY_PLACE_HOLDER
        let newResults: GraphResult = await props.onSubmit(selectedGraph, q);
        if (!newResults || !newResults.data?.length) {
            toast({
                title: "No results",
                description: "The query returned no results",
            })
        }
        setResults(newResults)
    }

    // A function that handles the click event of the Graph
    async function handleGraphClick(id: number) : Promise<[Map<String,Category>, Map<number, GraphData>, Map<string, GraphLink>]>{
        
        let results = await props.onGraphClick(selectedGraph, id)
        let extracted = extractData(results)
        return [extracted.categories, extracted.nodes, extracted.edges]
    }

    let extracted = extractData(results)

    // If the result holds data to present in the graph tab, set it as the default tab
    const defaultTab =  (extracted.nodes.size > 0 || extracted.edges.size > 0) ? "graph" : "table"

    return (
        <div className="flex flex-col">
            <div className="flex flex-wrap space-x-2">
                <GraphsList onSelectedGraph={setSelectedGraph} />
                <form className="grow flex flex-row items-center space-x-2" onSubmit={handleSubmit}>
                    <Label htmlFor="cypher">Query:</Label>
                    <Input className="grow" placeholder={QUERY_PLACE_HOLDER} type="text" id="cypher" name="cypher" value={query} onChange={handleChange} />
                    <Button className=" bg-blue-600 p-2 text-slate-50" type="submit">Send</Button>
                </form>
            </div>
            {/* Show an error message if the query is invalid */}
            {!valid && <p className="text-red-600">Invalid Cypher query. Please check the syntax.</p>}
            {extracted.data.length > 0 && (
                <>
                    <Tabs defaultValue={defaultTab} className="w-full grow py-2 min-h-900">
                        <TabsList>
                            <TabsTrigger value="table">Data</TabsTrigger>
                            <TabsTrigger value="graph">Graph</TabsTrigger>
                        </TabsList>
                        <TabsContent value="table">
                            <DataTable rows={extracted.data} columnNames={extracted.columns} />
                        </TabsContent>
                        <TabsContent value="graph">
                            <DirectedGraph nodes={extracted.nodes} edges={extracted.edges} categories={extracted.categories} onChartClick={handleGraphClick} />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}
