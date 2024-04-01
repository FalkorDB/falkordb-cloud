
export interface CodeExample {
   code: string,
   language: string,
   docs: string,
}

const BASH_EXAMPLE: CodeExample = {
   code:
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
   2) "Query internal execution time: 0.463691 milliseconds"`,
   language: 'bash',
   docs: 'https://docs.falkordb.com/commands/'
}

const JS_EXAMPLE: CodeExample = {
   code: 
`import { createClient, Graph } from 'falkordb';

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

let result = await graph.query("MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1");`,
   language: 'javascript',
   docs: 'https://github.com/redis/node-redis'
}

const PYTHON_EXAMPLE: CodeExample = {
   code: 
`import redis

r = redis.Redis(host='XYZ.falkordb.io', username='falkordb', password='*****')

# uncomment the following lines if you want to use TLS
# r = redis.Redis(host='XYZ.falkordb.io', username='falkordb', password='*****', ssl=True, ssl_ca_path='ca.crt')

graph = r.graph('movies')
graph.query("MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1")`,
   language: 'python',
   docs: 'https://github.com/redis/redis-py'
}


export const EXAMPLES = [
   JS_EXAMPLE, PYTHON_EXAMPLE, BASH_EXAMPLE
]

export const MORE_EXAMPLES = (
   <div>
      You can find a list of more ways to connect FalkorDB in different <a target="_blank" className="underline text-blue-600" href="https://docs.falkordb.com/clients.html">programming languages</a>.
      Including Java, .NET, PHP, Rust and more...
   </div>
)
