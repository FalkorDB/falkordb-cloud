import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from '../components/combobox';

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

// A component that renders an input box for Cypher queries
export function CypherInput(props: { graphs: string[], onSubmit: (query: string) => Promise<any> }) {

    const [results, setResults] = useState<any[]>([]);

    // A state variable that stores the user input
    const [query, setQuery] = useState('');

    // A state variable that stores the validation result
    const [valid, setValid] = useState(true);

    const options = props.graphs.map((graph) => {
        return {label: graph, value: graph}
    }) 

    // A function that handles the change event of the input box
    function handleChange(event: any) {
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

        // If the query is valid, pass it to the parent component as a prop
        if (valid) {
            let newResults = await props.onSubmit(query);
            setResults(newResults.data?? [])
        }
    }

    // Return the JSX element that renders the input box and a submit button
    return (
        <>
            <Combobox options={options} title={"Select Graph..."}/>
            <form className="flex items-center py-4 space-x-4" onSubmit={handleSubmit}>
                <Label htmlFor="cypher">Query:</Label>
                <Input type="text" id="cypher" name="cypher" value={query} onChange={handleChange} />
                <Button className="rounded-full bg-blue-600 p-2 text-slate-50" type="submit">Submit</Button>
            </form>
            {/* Show an error message if the query is invalid */}
            {!valid && <p className="text-red-600">Invalid Cypher query. Please check the syntax.</p>}
            <ul>
                {/* Render the lines as list items */}
                {results.map((line, index) => (
                    <li key={index}>{JSON.stringify(line)}</li>
                ))}
            </ul>
        </>
    );
}
