import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';
import factory from './factory';


const addToContainer = ({ container }: { container: AwilixContainer }) => {
    container.register({
        postgresDatabaseFactory: asFunction(factory),
    });
};

export { addToContainer };
