"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./generated/prisma");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3000;
const app = (0, express_1.default)();
const prisma = new prisma_1.PrismaClient();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: { title: "asc" },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});
app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive",
                },
            },
        });
        if (movieWithSameTitle) {
            return res
                .status(409)
                .send({ message: "Já existe um filme cadastradocom esse título" });
        }
        await prisma.movie.create({
            data: {
                title: title,
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar o filme" });
    }
    res.status(201).send();
});
app.put("/movies/:id", async (req, res) => {
    // pegar o id do registro a ser atualizado
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;
        // pegar os dados do filme que será atualizado e atualiza-los no prisma
        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o registro do filme" });
    }
    // retornar o status correto, informando que o filme foi atualizado
    res.status(200).send();
});
app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
        await prisma.movie.delete({
            where: {
                id,
            },
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao remover o registro do filme" });
    }
    res.status(200).send();
});
app.get("/movies/:genreName", async (req, res) => {
    const genreName = req.params.genreName;
    try {
        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genreName,
                        mode: "insensitive",
                    },
                },
            },
        });
        if (moviesFilteredByGenreName.length == 0) {
            return res.status(404).send({ message: "Gênero não existente" });
        }
        res.status(200).send(moviesFilteredByGenreName);
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao buscar filmes por gênero" });
    }
});
app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});
