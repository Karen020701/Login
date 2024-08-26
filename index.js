const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { clientPool, veterinaryPool } = require('./Config/db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); 
const JWT_SECRET = process.env.JWT_SECRET; 

app.post('/client/register', async (req, res) => {
    const { fullName, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await clientPool.query('INSERT INTO users_inf (full_name, email, password, role) VALUES ($1, $2, $3, $4)', [fullName, email, hashedPassword, role]);
        res.status(201).json({ message: 'Cliente registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar cliente', error);
        res.status(500).json({ error: 'Error al registrar cliente' });
    }
});



app.post('/veterinarian/register', async (req, res) => {
    const { fullName, email, password, specialty, phoneNumber } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await veterinaryPool.query('INSERT INTO veterinary (full_name, email, password, specialty, phone_number) VALUES ($1, $2, $3, $4, $5)', [fullName, email, hashedPassword, specialty, phoneNumber]);
        res.status(201).json({ message: 'Veterinario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar veterinario', error);
        res.status(500).json({ error: 'Error al registrar veterinario' });
    }
});

app.post('/client/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await clientPool.query('SELECT * FROM users_inf WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error al iniciar sesión', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});


app.post('/veterinarian/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Received email:', email);
        const result = await veterinaryPool.query('SELECT * FROM veterinary WHERE email = $1', [email]);
        console.log('Query result:', result.rows);

        const veterinarian = result.rows[0];
        if (!veterinarian) {
            console.log('No veterinarian found');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Stored hashed password:', veterinarian.password);
        const isPasswordValid = await bcrypt.compare(password, veterinarian.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: veterinarian.id, role: 'veterinarian' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error al iniciar sesión', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
