const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Conexion a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Comprobar conexion
pool.connect()
    .then(client => {
        console.log('PostgreSQL conectado');
        client.release();
    })
    .catch(error => {
        console.error('Error de conexion:', error.message);
    });

// Ruta GET: consultar productos
app.get('/productos', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM productos ORDER BY id'
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al consultar productos'
        });
    }
});

// Ruta POST: registrar producto
app.post('/productos', async (req, res) => {
    try {
        const { nombre, categoria, precio, stock } = req.body;

        if (!nombre || !categoria || precio <= 0 ||
            !Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                mensaje: 'Datos invalidos'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO productos (nombre, categoria, precio, stock)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre, categoria, precio, stock]
        );

        res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            producto: resultado.rows[0]
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al registrar producto'
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
