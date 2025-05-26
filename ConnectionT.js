import mongoose, { mongo } from 'mongoose';

class ConnectionT {
    constructor(uri) {
        this.uri = uri;
        this.connection = null
    }

    async connect() {
        try {
            if (!this.connection) {
                this.connection = await mongoose.createConnection(this.uri);
            }
            console.log(`Connected: ${this.uri}`);
            return this.connection;
        } catch (error) {
            console.log(`Error connecting: ${this.uri}`)
            throw error;
        }
    }

    async getConnection() {
        if (mongoose.connection.readyState === 0) {
            return await this.connect();
        }
    }

    getModel(nombreModelo, nombreColeccionReal) {
        const schema = new mongoose.Schema({}, { strict: false });
        schema.set('versionKey', false);

        return this.connection.model(nombreModelo, schema, nombreColeccionReal);
    }
}

export default ConnectionT;
