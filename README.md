# falkordb-cloud

This is a FalkorDB sandbox Dashboard project and it's [Next.js](https://nextjs.org/) project .

![image](https://github.com/FalkorDB/falkordb-cloud/assets/753206/4f9afa42-dd58-4ddc-91dc-3c863b8f2a87)



## Getting Started

* First, get the ``.env.local`` file with credentials to the development environment, you can copy ``.env.local.template``.

The ``.env.local`` should include the following variables

```yaml
# GITHUB Auth credentials
GITHUB_ID=[ID]
GITHUB_SECRET=[SECRET]

# Google Auth credentials
GOOGLE_CLIENT_ID=[CLIENT_ID]
GOOGLE_CLIENT_SECRET=[CLIENT_SECRET]

# AWS credentials
AWS_SECRET_ACCESS_KEY=[SECRET_ACCESS_KEY]
AWS_ACCESS_KEY_ID=[ACCESS_KEY_ID]

# Next secrets
NEXTAUTH_URL=[URL]
NEXTAUTH_SECRET=[SECRET]
NEXT_PUBLIC_GOOGLE_ANALYTICS=[ANALYTICS]

# Postgres connection details
POSTGRES_PASSWORD=[PASSWORD]
POSTGRES_USER=[USER]
POSTGRES_DATABASE=[DATABASE]
POSTGRES_HOST=[HOST]
POSTGRES_PORT=[PORT]

# Sentry credentials
SENTRY_AUTH_TOKEN=[TOKEN]
```

* Second run the postgres database:

```bash
docker run --rm -it --network host --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword postgres
```

Conenct to the Postgres server and create a database called `falkordb`

* Then, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

* [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
* [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
