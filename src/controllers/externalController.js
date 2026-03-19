const pool = require('../config/db');

const poblarProductos = async (request, response) => {
    try {
        // Fetch FakeStoreApi
        const apiFetch = await fetch('http://fakestoreapi.com/products');
        const products = await apiFetch.json();

        let inserciones = 0;
        // Destructurar el objeto
        for(const product of products){
            const { title, price, description, image,category,youtube_id} = product;

            const stock = Math.floor(Math.random() * 50) + 1;
            const categoriaQuery = 'SELECT id FROM categoria WHERE nombre = $1';
            const categoriaResult = await pool.query(categoriaQuery, [category]);
            const categoria_id = categoriaResult.rows[0]?.id;
            const query = `
                INSERT INTO productos
                (nombre, precio, stock, descripcion, imagen_url,categoria_id,youtube_id)
                VALUES ($1, $2, $3, $4, $5,$6)
            `

            await pool.query(query, [title, price, stock, description, image,categoria_id,youtube_id]);

            inserciones++;
        }
        response.status(200).json(
            {
                mensaje: "Carga masiva exitosa", 
                cantidad: inserciones
            }
        );
    } catch (error) {
        console.log(`Error: ${error}`);
        response.status(500).json({error: error.message})
    }
};
const poblarCategoria = async (request, response) => {
    try {
        const apiFetch = await fetch('http://fakestoreapi.com/products');
        const products = await apiFetch.json();

        const categoriasSet = new Set();
        for (const product of products) {
            categoriasSet.add(product.category);
        }

        let inserciones = 0;

        for (const nombreCategoria of categoriasSet) {
            const query = `
                INSERT INTO categoria (nombre)
                VALUES ($1)
                ON CONFLICT (nombre) DO NOTHING
            `;

            const result = await pool.query(query, [nombreCategoria]);
            if (result.rowCount > 0) inserciones++; // solo cuenta si realmente insertó
        }

        response.status(200).json({
            mensaje: "Carga de categorías masiva exitosa",
            cantidad: inserciones
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        response.status(500).json({ error: error.message });
    }
};
 const buscarNombre = async (request, response) => {
    try {
        const { nombre } = request.params;
        const query = `
            SELECT * FROM productos
            WHERE lower(nombre) ILIKE LOWER($1)
        `;
        const result = await pool.query(query, [`%${nombre}%`]);
        response.status(200).json(result.rows);
    }
    catch(error){
            response.status(500).json({ error: error.message });
    }
 }
 const buscarCategoria = async (request, response) => {
    try {
        const { nombre } = request.params;
        const query = `
            SELECT * FROM categoria
            WHERE lower(nombre) ILIKE LOWER($1)
        `;
        const result = await pool.query(query, [`%${nombre}%`]);
        response.status(200).json(result.rows);
    }
    catch(error){
            response.status(500).json({ error: error.message });
    }
 }
const cargarProductos = async(request, response) => {
    // extraer categoria_id si se envía, sino null
    const {nombre, precio, stock, descripcion, imagen_url, categoria_id} = request.body;
    try{
        // nombre, precio y stock siguen siendo obligatorios
        if(!nombre || !precio || !stock){
            return response.status(400).json({ error: "Faltan campos obligatorios" });
        }
        const query = `
            INSERT INTO productos (nombre, precio, stock, descripcion, imagen_url, categoria_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await pool.query(query, [nombre, precio, stock, descripcion, imagen_url, categoria_id || null]);
        response.status(200).json({ message: "Producto cargado exitosamente" });
    }
    catch(error){
        console.error("Error cargarProductos:", error);
        response.status(500).json({ error: "Error al cargar productos" });
    }
}
const listarProductos = async (request, response) => {
    try {
        const query = `
            SELECT p.*, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categoria c ON p.categoria_id = c.id
            ORDER BY p.id
        `;
        const result = await pool.query(query);
        response.status(200).json(result.rows);
    } catch (error) {
        console.log(`Error listarProductos: ${error}`);
        response.status(500).json({ error: error.message });
    }
};

module.exports = { poblarProductos, poblarCategoria, buscarNombre, buscarCategoria, listarProductos, cargarProductos };