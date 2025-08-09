import { createServer } from './graphql/server';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = await createServer();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer(); 