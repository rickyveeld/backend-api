const express = require('express');
const { poblarProductos, poblarCategoria, buscarNombre, buscarCategoria, listarProductos,cargarProductos } = require('../controllers/externalController');
const router = express.Router();

router.post('/poblar', poblarProductos);
router.post('/poblar/categorias', poblarCategoria);
router.get('/', listarProductos);
router.get('/buscar/:nombre', buscarNombre);
router.get('/buscar/categoria/:nombre', buscarCategoria);
router.post('/cargar', cargarProductos);
module.exports = router;