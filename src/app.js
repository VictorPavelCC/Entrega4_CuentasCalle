const express = require('express')
const app = express()
const PORT = 8080
const path = require('path')
const handlebars = require('express-handlebars')
const Contenedor = require('./public/utils.js')

//Middleware para analizar el cuerpo de las solicitudes.
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Import socket.io
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(app)
const io = new Server(server)

//Config Handlebars
app.engine("handlebars", handlebars.engine())
app.set("views", path.join(__dirname, 'views'))
app.set("view engine", "handlebars")
app.use(express.static(path.join(__dirname, 'public')))

const productsContainer = new Contenedor('products.json')

//Routing
app.get("/", async (req, res) => {
    try {
        const products = await productsContainer.getAll()
        res.render("home", { products })
    } catch (error) {
        console.error("Error al cargar los productos:", error)
        res.status(500).send("Error al cargar los productos")
    }
})

app.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productsContainer.getAll()
        res.render("realTimeProducts", { products })
    } catch (error) {
        console.error("Error al cargar los productos:", error)
        res.status(500).send("Error al cargar los productos")
    }

    
})


//Config socket.io
io.on("connection", (socket) => {
    console.log("Un cliente se ha conectado");

    socket.on("newProduct", async (product) => {
        try {
            const newId = await productsContainer.save(product);
            product.id = newId;

            const products = await productsContainer.getAll();
            
            io.emit("productsList", products);
        } catch (error) {
            console.error("Error al guardar el producto:", error);
        }
    });

    socket.on("deleteProduct", async (id_product) => {
        try {
            await productsContainer.deleteById(id_product);
            const products = await productsContainer.getAll();
            io.emit("productsList", products);
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
    });
});



server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})