import express from 'express';
import cors from 'cors';
import notifier from "node-notifier";
import ConnectionT from './ConnectionT.js';
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

let mongoLOCAL = new ConnectionT(process.env.URI_MONGO_LOCAL);
await mongoLOCAL.connect();
const logMongoLocal = mongoLOCAL.getModel("logsModel", 'logs');

let mongoLibeleDEV = new ConnectionT(process.env.URI_MONGO_DEV_LIBELE);
await mongoLibeleDEV.connect();

/* creating connections at the beginning is better for our purpouse */

const dataSources = {
    "bdLibrosElectronicos": { "DEV": mongoLOCAL, "PROD": mongoLibeleDEV }
    /* add keys */
};

const mongolitoPath = '/mongolito';
app.post(mongolitoPath, async (req, res) => await executeProcess(req, res, handlePost));

async function executeProcess(req, res, handlerFunction) {
    res.send("Received");

    setImmediate(async () => {
        try {
            await handlerFunction(req.body);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    });
};

/* modify logic here */
async function handlePost(body) {

    console.log("\n", body, "\n");

    logMongoLocal.insertOne(body);

    let { asunto, mensaje, fecha, trabajador } = body;
    /* received custom message */

    notify(trabajador, asunto);

    for (let line of mensaje.split("\n")) {
        if (line.trim() === "") continue;
        const textLine = line.trim().match(/<p[^>]*>(.*?)<\/p>/)[1];
        const [bd, ruc, periodo] = textLine.split("|");
        const comb = `${bd} - ${ruc} - ${periodo}`;
        console.log(comb);
        try {
            await migrate(dataSources[bd].PROD, dataSources[bd].DEV, { numRuc: ruc }, periodo);
        } catch (error) {
            notify(`ERROR: ${comb}`, error);
        }
    }

}

async function migrate(source, destination, cleanFilter, collectionsParam) {

    const collections = getCollections(collectionsParam);

    for (const collection of collections) {

        const sourceCollection = source.getModel(collection, collection);
        const destinationModel = destination.getModel(collection, collection);

        const cursor = sourceCollection.find(cleanFilter).lean().cursor();

        let documents = [];
        for await (const doc of cursor) {
            documents.push(doc);
        }

        console.log(`${collection}: ${documents.length}`);
        if (documents.length > 0) {
            await destinationModel.deleteMany(cleanFilter);
            await destinationModel.insertMany(documents);
        }
    }

    console.log("\n");

}

function getCollections(periodo) {
    return [
        "actividadesEconomicas",
        "ajustesPosterioresCompras",
        "ajustesPosterioresVentas",
        "calendarioVctoEspecialesLibros",
        "calendarioVctoRegistrosLibros",
        "casillasComprobantes",
        "casillasPropuestas",
        "cdpAutorizados",
        "comparacionEnviosMasivos",
        "comprobantes",
        "comprobantesAjustesPostCompras",
        "comprobantesAjustesPostVentas",
        "comprobantesLibrosCompras",
        "comprobantesSinReferencia",
        "contadoresReemplazo",
        "contribuyentes",
        "contribuyentesSuspendidos",
        "controlGeneradorDocs",
        "controlModComprobantes",
        "controlNotificaciones",
        "controlPersonalizados",
        "controlProcesos",
        "controlReingesta",
        "convenio",
        "conveniosTributarios",
        "copiaactividadeconomicas",
        "correlativos",
        "correlativosFragmentos",
        "datosFormularioVirtual621",
        "detCalendarioVctoEspecLibros",
        "erroresSire",
        "ingresosContribuyentes",
        "intranetCorrelativos",
        "legadosOmisos",
        "libros",
        "movimientosEstados",
        "noDomiciliados",
        "noIncluidos",
        "noIncluidosObligados",
        "obligados",
        "omisos",
        "padronSujetosSsco",
        "parametros",
        "paramTransformadorComprobantes",
        "presentacionesLibros",
        "procesosMasivos",
        "procesosMasivosIntranet",
        "registrosLibros",
        "registrosTrazabilidad",
        "resumenesComprobantes",
        "resumenesEstadisticos",
        "resumenesFechaSinTipCamb",
        "resumenesInconsistencias",
        "tiposDeCambio",
        "usuarios",
        "validacionesComprobantes",
        "vectoresFiscalesPar",
        "comprobantesLibrosCompras" + periodo,
        "comprobantesLibrosVentas" + periodo,
        "controlCargaComprobantes" + periodo,
        "inconsistenciasLibros" + periodo,
        "periodoInconsistencias" + periodo,
        "propuestasCompras" + periodo,
        "propuestasVentas" + periodo
    ];
}

function notify(employee, subject) {
    notifier.notify({
        title: employee,
        message: subject,
        sound: true,
        wait: false,
        timeout: 3
    });
}

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

//await handlePost({ "asunto": "P-4421210", "mensaje": `<p style="margin-left: 0px;">bdLibrosElectronicos|10239991071|202504</p>`, "trabajador": "Mecca Paredes Franco Samuel", "fecha": new Date() });