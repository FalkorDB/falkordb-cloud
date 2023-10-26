import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

export const BASH_EXAMPLE  = 
(
<div>
   <a target="_blank" className="underline text-blue-600" href="https://docs.falkordb.com/commands/">Read more</a>
   <SyntaxHighlighter language="bash" style={dracula}>  
{
`$ redis-cli -u redis://falkordb:*******@XYZ.falkordb.io:6379

# if you want to use TLS, use the following command instead
$ redis-cli -u rediss://falkordb:*******@XYZ.falkordb.io:6379 --tls --cacert ca.crt

XYZ.falkordb.io:6379>GRAPH.QUERY movies "MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1"
1) 1) "n"
2) 1) 1) 1) 1) "id"
            2) (integer) 2
         2) 1) "labels"
            2) 1) "Person"
         3) 1) "properties"
            2) 1) 1) "name"
                  2) "Tom Cruise"
               2) 1) "birthDate"
                  2) "1962-07-3"
3) 1) "Cached execution: 0"
   2) "Query internal execution time: 0.463691 milliseconds"`
}
   </SyntaxHighlighter>
</div>
)

export const JS_EXAMPLE  = 
(
<div>
   <a target="_blank" className="underline text-blue-600" href="https://github.com/redis/node-redis">Read more</a>
   <SyntaxHighlighter language="javascript" style={dracula}>
{
`import { createClient, Graph } from 'redis';

const client = createClient({
   username: 'falkordb',
   password: '*****', 
   socket: {
      host: 'XYZ.falkordb.io',
    
      // uncomment the following lines if you want to use TLS
      // tls: true,
      // ca: fs.readFileSync('ca.crt'),
}});
await client.connect();
const graph = new Graph(client, 'movies');

let result = await graph.query("MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1");`
}
   </SyntaxHighlighter>
</div>
)

export const PYTHON_EXAMPLE  = 
(
<div>
   <a target="_blank" className="underline text-blue-600" href="https://github.com/redis/redis-py">Read more</a>
   <SyntaxHighlighter language="python" style={dracula}>
{
`import redis

r = redis.Redis(host='XYZ.falkordb.io', username='falkorbd', password='*****')

# uncomment the following lines if you want to use TLS
# r = redis.Redis(host='XYZ.falkordb.io', username='falkorbd', password='*****', ssl=True, ssl_ca_path='ca.crt')

graph = r.graph('movies')
graph.query("MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1")`
}
   </SyntaxHighlighter>
</div>
)

export const MORE_EXAMPLE  = (
   <div> 
      You can find a list of more ways to connect FalkorDB in different <a target="_blank" className="underline text-blue-600" href="https://docs.falkordb.com/clients.html">programming languages</a>.
      Including Java, .NET, PHP, Rust and more...
   </div>
)
