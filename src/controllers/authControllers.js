const pool=require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const login = async (req, res) => {
    // read credentials from request body
    const { email, password } = req.body;
    try {
        // fetch user by email using parameterized query
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ msg: "credenciales invalidas (Email)" });
        }
        const usuario = result.rows[0];
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "credenciales invalidas (Password)" });
        }
        const payload = {
            id: usuario.id,
            rol: usuario.rol,
            email: usuario.email,
        };
        // make sure we have a secret configured
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET no está definido en las variables de entorno');
            return res.status(500).json({ msg: 'Error en el servidor', error: 'JWT_SECRET no configurado' });
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        return res.json({ token });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};
const register = async(req,res)=>{
    const{email,password}=req.body;
    try{
const userExist=await pool.query('select * from usuarios where email=$1',[email]);
if(userExist.rows.length>0){
    return res.status(400).json({message:'El usuario ya existe'});
}
const salt = bcrypt.genSaltSync(10);
const passwordHash = await bcrypt.hash(password, salt);
const newUser= await pool.query('insert into usuarios(email,password) values($1,$2) returning *',[email,passwordHash]);
res.status(201).json({message:'Usuario registrado exitosamente',user:newUser.rows[0]});
    }
    catch(error){
        res.status(500).json({message:'Error al registrar el usuario', error:error.message});
    }
};

module.exports = { register,login };