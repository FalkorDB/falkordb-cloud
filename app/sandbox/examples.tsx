export const BASH_EXAMPLE  = 
`$ redis-cli -h XYZ.falkordb.io -a XXXXXX

# if you want to use TLS, use the following command instead
$ redis-cli -h XYZ.falkordb.io -a XXXXXX --tls --cacert ca.crt

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

export const JS_EXAMPLE  = 
`import { createClient, Graph } from 'redis';

const client = createClient({password: 'XXXXXX', socket: {
    host: 'XYZ.falkordb.io',
    
    // uncomment the following lines if you want to use TLS
    // tls: true,
    // ca: fs.readFileSync('ca.crt'),
}});
await client.connect();
const graph = new Graph(client, 'movies');

let result = await graph.query("MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1");`


export const PYTHON_EXAMPLE  = 
`import redis

r = redis.Redis(host='XYZ.falkordb.io', password='XXXXXX')

# uncomment the following lines if you want to use TLS
# r = redis.Redis(host='XYZ.falkordb.io', password='XXXXXX', ssl=True, ssl_ca_path='ca.crt')

graph = r.graph('movies')
graph.query("MATCH (n)-[:ACTED_IN]->(m:Movie {title:'Top Gun'}) RETURN n LIMIT 1")`