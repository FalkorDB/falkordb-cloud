# falkordb-cloud

This is a FalkorDB sandbox Dashboard project and it's [Next.js](https://nextjs.org/) project .

## Getting Started

First, get the ``.env.local`` file with credentials to the development environment.

Second run the postgres database:

```bash
docker run --rm -it --network host --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword postgres
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

