import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
import { buildSchema, graphql } from 'https://cdn.pika.dev/graphql@^15.0.0';

const schema = buildSchema(`
  type Book {
    id: Int
    title: String
    author: String
  }

  type Query {
    books: [Book]
    hello: String
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
  },
  hello: () => 'World'
}

const app = new Application();
const port = 7777;

const graphiqlHTML = `<html>
<head>
  <title>Simple GraphiQL Example</title>
  <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
</head>

<body style="margin: 0;">
  <div id="graphiql" style="height: 100vh;"></div>

  <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>

  <script>
    const graphQLFetcher = graphQLParams =>
      fetch('http://localhost:${port}/graphql', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphQLParams),
      })
        .then(response => response.json())
        .catch(() => response.text());
    ReactDOM.render(
      React.createElement(GraphiQL, { fetcher: graphQLFetcher }),
      document.getElementById('graphiql'),
    );
  </script>
</body>
</html>`

const router = new Router();

router
  .get('/graphql', context => {
    context.response.body = graphiqlHTML;
  })
  .post('/graphql', async context => {
    const requestBody = await context.request.body();
    const query = requestBody.value?.query ?? {};

    graphql(schema, query, resolvers).then((response => {
      context.response.body = response;
    }))
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`GraphQL Server running on http://localhost:${port}/graphql`);
app.listen({ port });
