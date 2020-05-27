// import Third Party Module
import { Application, Router } from 'https://deno.land/x/oak/mod.ts';

// import module from Pika CDN
import { buildSchema, graphql } from 'https://cdn.pika.dev/graphql@^15.0.0';


const schema = buildSchema(`
  type Book {
    id: Int
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`);

const books = [
  {
    id: 1,
    title: 'Dune',
    author: 'Frank Herbert'
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell'
  }
];

const resolvers = {
  books: () => {
    return books;
  }
}

const app = new Application();
const port = 7777;

// Use the Deno runtime to read the static GraphiQL HTML File
const decoder = new TextDecoder();
const data = await Deno.readFile('./graphiql.html');
const graphiqlHTML = decoder.decode(data);

const router = new Router();

router
  .get('/graphql', context => {
    // return GraphiQL IDE
    context.response.body = graphiqlHTML;
  })
  .post('/graphql', async context => {
    const requestBody = await context.request.body();
    const query = requestBody.value?.query ?? {};
    
    // run the query and return the response
    graphql(schema, query, resolvers).then((response => {
      context.response.body = response;
    }))
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`GraphQL Server running on http://localhost:${port}/graphql`);
app.listen({ port });
