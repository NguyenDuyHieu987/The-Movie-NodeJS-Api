import dotenv from 'dotenv';
import { Client } from '@elastic/elasticsearch';
dotenv.config();

const elasticsearch_node: string =
  process.env.NODE_ENV == 'production'
    ? process.env.ELASTICSEARCH_NODE!
    : process.env.ELASTICSEARCH_NODE_DEV!;

const esClient = new Client({
  node: elasticsearch_node
});

esClient
  .ping()
  .then(() => {
    console.log(`✅ Elasticsearch connected: ${elasticsearch_node}`);
  })
  .catch((err) => {
    console.error(`❌ Elasticsearch connection failed: ${elasticsearch_node}`);
    console.error(err.message);
  });

export default esClient;
