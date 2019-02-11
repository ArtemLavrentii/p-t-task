import Hapi from 'hapi';
import worldMaker from 'methods/worldMaker';
import routes from 'routes';

const server = Hapi.server({
    host: 'localhost',
    port: 8080
});

server.method({
    name: 'world.fromID',
    method: worldMaker,
    options: {
        cache: {
            expiresIn: 5 * 60 * 1000,
            generateTimeout: 5000,
        },
    },
});

server.route(routes);

const start = async function () {
    await server.start();
    console.log('Server running at:', server.info.uri);
};

start()
    .catch((e) => {
        console.error('Something really bad happened while starting server', e);
        process.exit(1);
    });