const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    try {
        const endpoint = process.env['ACCOUNT_URI'];
        const key = process.env['ACCOUNT_KEY'];

        const client = new CosmosClient({ endpoint: endpoint, key: key });
        const { database } = await client.databases.createIfNotExists({ id: 'ToDoDB' });
        const { container } = await database.containers.createIfNotExists({ id: 'Actions' });

        const querySpec = {
            query: 'SELECT * FROM Actions',
            parameters: []
        };

        const { resources: results } = await container.items.query(querySpec).fetchAll();
        const items = results;
        const response = [];

        items.forEach(el => {
            response.push({
                id: el.id,
                title: el.title,
                complete: el.complete
            })
        });

        context.res = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: response
        };

    } catch (error) {
        context.res = {
            status: 500, /* Defaults to 200 */
            body: error
        };
    }
}