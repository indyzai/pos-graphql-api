import { gqlServer } from './graphql/server';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = gqlServer;
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer(); 