const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const swaggerSetup = require('./swagger');

dotenv.config();

const app = express();
app.use(express.json());
swaggerSetup(app);

const rootDbConfig = {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'Exam',
    multipleStatements: true
};

const userDbConfig = {
    host: 'localhost',
    user: 'dbuser',
    password: process.env.DB_USER_PASSWORD,
    database: 'Exam',
    multipleStatements: true
};

const executeSQLFile = async (connection, filePath, replacements = {}) => {
    let sql = fs.readFileSync(filePath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
        sql = sql.replace(new RegExp(key, 'g'), value);
    }
    await connection.query(sql);
    console.log(`${filePath} exécuté avec succès`);
};

const initDB = async () => {
    try {
        const rootConnection = await mysql.createConnection(rootDbConfig);
        console.log('Connexion à MySQL réussie avec root');

        await executeSQLFile(rootConnection, 'db.sql');
        await executeSQLFile(rootConnection, 'data.sql');
        await executeSQLFile(rootConnection, 'user.sql', { 'PLACEHOLDER_PASSWORD': process.env.DB_USER_PASSWORD });

        console.log('Base de données initialisée avec succès');
        return rootConnection;
    } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base de données :', err);
        process.exit(1);
    }
};

initDB().then(async (rootConnection) => {
    const connection = await mysql.createConnection(userDbConfig);
    console.log('Connexion à MySQL réussie avec dbuser');

    // CRUD FOURNISSEURS

    /**
 * @swagger
 * /fournisseurs:
 *   get:
 *     summary: Retrieve a list of fournisseurs
 *     responses:
 *       200:
 *         description: A list of fournisseurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   codepostal:
 *                     type: string
 */
    app.get('/fournisseurs', async (req, res) => {
        const [fournisseurs] = await connection.query('CALL getFournisseurs()');
        res.json(fournisseurs);
    });
    /**
 * @swagger
 * /fournisseurs:
 *   post:
 *     summary: Create a new fournisseur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               codepostal:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameters
 */
    app.post('/fournisseurs', async (req, res) => {
        const { nom, codepostal } = req.body;
        if (!nom || !codepostal) {
            return res.status(400).json({ error: 'Missing required parameters "nom" and/or "codepostal"' });
        }
        await connection.query('INSERT INTO Fournisseurs (nom, codepostal) VALUES (?, ?)', [nom, codepostal]);
        res.status(201).end();
    });
    /**
 * @swagger
 * /fournisseurs/{id}:
 *   put:
 *     summary: Update a fournisseur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               codepostal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameters
 */

    app.put('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        const { nom, codepostal } = req.body;
        if (!nom || !codepostal) {
            return res.status(400).json({ error: 'Missing required parameters "nom" and/or "codepostal"' });
        }
        await connection.query('UPDATE Fournisseurs SET nom = ?, codepostal = ? WHERE id = ?', [nom, codepostal, id]);
        res.status(200).end();
    });
    /**
 * @swagger
 * /fournisseurs/{id}:
 *   delete:
 *     summary: Delete a fournisseur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
    app.delete('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Fournisseurs WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD PRODUITS

    /**
 * @swagger
 * /produits:
 *   get:
 *     summary: Retrieve a list of produits
 *     responses:
 *       200:
 *         description: A list of produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nomreference:
 *                     type: string
 *                   quantitestock:
 *                     type: integer
 *                   prixunitaire:
 *                     type: number
 *                   idcategorie:
 *                     type: integer
 */
    app.get('/produits', async (req, res) => {
        const [produits] = await connection.query('SELECT * FROM Produits');
        res.json(produits);
    });

    /**
 * @swagger
 * /produits:
 *   post:
 *     summary: Create a new produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomreference:
 *                 type: string
 *               quantitestock:
 *                 type: integer
 *               prixunitaire:
 *                 type: number
 *               idcategorie:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameters
 */
    app.post('/produits', async (req, res) => {
        const { nomreference, quantitestock, prixunitaire, idcategorie } = req.body;
        if (!nomreference || !quantitestock || !prixunitaire || !idcategorie) {
            return res.status(400).json({ error: 'Missing required parameters "nomreference", "quantitestock", "prixunitaire" and/or "idcategorie"' });
        }
        await connection.query('INSERT INTO Produits (nomreference, quantitestock, prixunitaire, idcategorie) VALUES (?, ?, ?, ?)', [nomreference, quantitestock, prixunitaire, idcategorie]);
        res.status(201).end();
    });
    /**
 * @swagger
 * /produits/{id}:
 *   put:
 *     summary: Update a produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomreference:
 *                 type: string
 *               quantitestock:
 *                 type: integer
 *               prixunitaire:
 *                 type: number
 *               idcategorie:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameters
 */
    app.put('/produits/:id', async (req, res) => {
        const id = req.params.id;
        const { nomreference, quantitestock, prixunitaire, idcategorie } = req.body;
        if (!nomreference || !quantitestock || !prixunitaire || !idcategorie) {
            return res.status(400).json({ error: 'Missing required parameters "nomreference", "quantitestock", "prixunitaire" and/or "idcategorie"' });
        }
        await connection.query('UPDATE Produits SET nomreference = ?, quantitestock = ?, prixunitaire = ?, idcategorie = ? WHERE id = ?', [nomreference, quantitestock, prixunitaire, idcategorie, id]);
        res.status(200).end();
    });
    /**
 * @swagger
 * /produits/{id}:
 *   delete:
 *     summary: Delete a produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
    app.delete('/produits/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Produits WHERE id = ?', [id]);
        res.status(200).end();
    });

    /**
 * @swagger
 * /produits/{id}/commandes:
 *   get:
 *     summary: Retrieve a list of commandes for a specific produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   datecommande:
 *                     type: string
 *                   idclient:
 *                     type: integer
 */
    app.get('/produits/:id/commandes', async (req, res) => {
        const productId = req.params.id;
        const [commandes] = await connection.query(`
            SELECT c.* 
            FROM Commandes c
            JOIN LignesCommandes lc ON c.id = lc.idcommande
            WHERE lc.idproduit = ?
        `, [productId]);
        res.json(commandes);
    });

    // CRUD CATEGORIES
    /**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve a list of categories
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 */
    app.get('/categories', async (req, res) => {
        const [categories] = await connection.query('SELECT * FROM Categories');
        res.json(categories);
    });
    /**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameter
 */
    app.post('/categories', async (req, res) => {
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        await connection.query('INSERT INTO Categories (nom) VALUES (?)', [nom]);
        res.status(201).end();
    });
    /**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameter
 */
    app.put('/categories/:id', async (req, res) => {
        const id = req.params.id;
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        await connection.query('UPDATE Categories SET nom = ? WHERE id = ?', [nom, id]);
        res.status(200).end();
    });
    /**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
    app.delete('/categories/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Categories WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD FOURNIR

    /**
 * @swagger
 * /fournir:
 *   get:
 *     summary: Retrieve a list of fournir
 *     responses:
 *       200:
 *         description: A list of fournir
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idproduit:
 *                     type: integer
 *                   idfournisseur:
 *                     type: integer
 */

    app.get('/fournir', async (req, res) => {
        const [fournir] = await connection.query('SELECT * FROM Fournir');
        res.json(fournir);
    });
    /**
 * @swagger
 * /fournir:
 *   post:
 *     summary: Create a new fournir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idproduit:
 *                 type: integer
 *               idfournisseur:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameters
 */
    app.post('/fournir', async (req, res) => {
        const { idproduit, idfournisseur } = req.body;
        if (!idproduit || !idfournisseur) {
            return res.status(400).json({ error: 'Missing required parameters "idproduit" and/or "idfournisseur"' });
        }
        await connection.query('INSERT INTO Fournir (idproduit, idfournisseur) VALUES (?, ?)', [idproduit, idfournisseur]);
        res.status(201).end();
    });
    /**
 * @swagger
 * /fournir/{idproduit}/{idfournisseur}:
 *   put:
 *     summary: Update a fournir
 *     parameters:
 *       - in: path
 *         name: idproduit
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idfournisseur
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newIdproduit:
 *                 type: integer
 *               newIdfournisseur:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameters
 */
    app.put('/fournir/:idproduit/:idfournisseur', async (req, res) => {
        const { idproduit, idfournisseur } = req.params;
        const { newIdproduit, newIdfournisseur } = req.body;
        if (!newIdproduit || !newIdfournisseur) {
            return res.status(400).json({ error: 'Missing required parameters "newIdproduit" and/or "newIdfournisseur"' });
        }
        await connection.query('UPDATE Fournir SET idproduit = ?, idfournisseur = ? WHERE idproduit = ? AND idfournisseur = ?', [newIdproduit, newIdfournisseur, idproduit, idfournisseur]);
        res.status(200).end();
    });
    /**
 * @swagger
 * /fournir/{idproduit}/{idfournisseur}:
 *   delete:
 *     summary: Delete a fournir
 *     parameters:
 *       - in: path
 *         name: idproduit
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idfournisseur
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
    app.delete('/fournir/:idproduit/:idfournisseur', async (req, res) => {
        const { idproduit, idfournisseur } = req.params;
        await connection.query('DELETE FROM Fournir WHERE idproduit = ? AND idfournisseur = ?', [idproduit, idfournisseur]);
        res.status(200).end();
    });

    // CRUD CLIENTS
    /**
 * @swagger
 * /clients:
 *   get:
 *     summary: Retrieve a list of clients
 *     responses:
 *       200:
 *         description: A list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nomclient:
 *                     type: string
 *                   prenomclient:
 *                     type: string
 *                   emailclient:
 *                     type: string
 *                   adresseclient:
 *                     type: string
 *                   codepostalclient:
 *                     type: string
 */
    app.get('/clients', async (req, res) => {
        const [clients] = await connection.query('SELECT * FROM Clients');
        res.json(clients);
    });
    /**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomclient:
 *                 type: string
 *               prenomclient:
 *                 type: string
 *               emailclient:
 *                 type: string
 *               adresseclient:
 *                 type: string
 *               codepostalclient:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameters or invalid email format
 */
    app.post('/clients', async (req, res) => {
        const { nomclient, prenomclient, emailclient, adresseclient, codepostalclient } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!nomclient || !prenomclient || !emailclient || !adresseclient || !codepostalclient) {
            return res.status(400).json({ error: 'Missing required parameters "nomclient", "prenomclient", "emailclient", "adresseclient" and/or "codepostalclient"' });
        }
    
        if (!emailRegex.test(emailclient)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
    
        await connection.query('INSERT INTO Clients (nomclient, prenomclient, emailclient, adresseclient, codepostalclient) VALUES (?, ?, ?, ?, ?)', [nomclient, prenomclient, emailclient, adresseclient, codepostalclient]);
        res.status(201).end();
    }); 
    /**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update a client
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomclient:
 *                 type: string
 *               prenomclient:
 *                 type: string
 *               emailclient:
 *                 type: string
 *               adresseclient:
 *                 type: string
 *               codepostalclient:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameters
 */
    app.put('/clients/:id', async (req, res) => {
        const id = req.params.id;
        const { nomclient, prenomclient, emailclient, adresseclient, codepostalclient } = req.body;
        if (!nomclient || !prenomclient || !emailclient || !adresseclient || !codepostalclient) {
            return res.status(400).json({ error: 'Missing required parameters "nomclient", "prenomclient", "emailclient", "adresseclient" and/or "codepostalclient"' });
        }
        await connection.query('UPDATE Clients SET nomclient = ?, prenomclient = ?, emailclient = ?, adresseclient = ?, codepostalclient = ? WHERE id = ?', [nomclient, prenomclient, emailclient, adresseclient, codepostalclient, id]);
        res.status(200).end();
    });
    /**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
    app.delete('/clients/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Clients WHERE id = ?', [id]);
        res.status(200).end();
    });
/**
 * @swagger
 * /clients/{id}/commandes:
 *   get:
 *     summary: Retrieve a list of commandes for a specific client
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   datecommande:
 *                     type: string
 *                   idclient:
 *                     type: integer
 */
    app.get('/clients/:id/commandes', async (req, res) => {
        const clientId = req.params.id;
        const [commandes] = await connection.query('SELECT * FROM Commandes WHERE idclient = ?', [clientId]);
        res.json(commandes);
    });


    // CRUD COMMANDES
    /**
 * @swagger
 * /commandes:
 *   get:
 *     summary: Retrieve a list of commandes
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date for filtering commandes
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date for filtering commandes
 *     responses:
 *       200:
 *         description: A list of commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   datecommande:
 *                     type: string
 *                   idclient:
 *                     type: integer
 */
    app.get('/commandes', async (req, res) => {
        const { start, end } = req.query;
        let query = 'SELECT * FROM Commandes';
        const params = [];
    
        if (start && end) {
            query += ' WHERE datecommande BETWEEN ? AND ?';
            params.push(start, end);
        }
    
        const [commandes] = await connection.query(query, params);
        res.json(commandes);
    });
    /**
 * @swagger
 * /commandes:
 *   post:
 *     summary: Create a new commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               datecommande:
 *                 type: string
 *               idclient:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameters
 */
    app.post('/commandes', async (req, res) => {
        const { datecommande, idclient } = req.body;
        if (!datecommande || !idclient) {
            return res.status(400).json({ error: 'Missing required parameters "datecommande" and/or "idclient"' });
        }
        await connection.query('INSERT INTO Commandes (datecommande, idclient) VALUES (?, ?)', [datecommande, idclient]);
        res.status(201).end();
    });
    /**
 * @swagger
 * /commandes/{id}:
 *   put:
 *     summary: Update a commande
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               datecommande:
 *                 type: string
 *               idclient:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameters
 */
    app.put('/commandes/:id', async (req, res) => {
        const id = req.params.id;
        const { datecommande, idclient } = req.body;
        if (!datecommande || !idclient) {
            return res.status(400).json({ error: 'Missing required parameters "datecommande" and/or "idclient"' });
        }
        await connection.query('UPDATE Commandes SET datecommande = ?, idclient = ? WHERE id = ?', [datecommande, idclient, id]);
        res.status(200).end();
    });
    /**
 * @swagger
 * /commandes/{id}:
 *   delete:
 *     summary: Delete a commande
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
    app.delete('/commandes/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Commandes WHERE id = ?', [id]);
        res.status(200).end();
    });

    /**
 * @swagger
 * /commandes/search:
 *   get:
 *     summary: Search for commandes with multiple criteria
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Client ID for filtering commandes
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date for filtering commandes
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date for filtering commandes
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Product ID for filtering commandes
 *     responses:
 *       200:
 *         description: A list of commandes
 *         content:
 *           application/json:
 *              schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   datecommande:
 *                     type: string
 *                   idclient:
 *                     type: integer
 */
    app.get('/commandes/search', async (req, res) => {
        const { clientId, startDate, endDate, productId } = req.query;
        let query = `
            SELECT DISTINCT c.* 
            FROM Commandes c
            LEFT JOIN LignesCommandes lc ON c.id = lc.idcommande
            WHERE 1=1
        `;
        const params = [];
    
        if (clientId) {
            query += ' AND c.idclient = ?';
            params.push(clientId);
        }
        if (startDate && endDate) {
            query += ' AND c.datecommande BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        if (productId) {
            query += ' AND lc.idproduit = ?';
            params.push(productId);
        }
    
        console.log('Constructed Query:', query);
        console.log('Query Parameters:', params);
    
        try {
            const [commandes] = await connection.query(query, params);
            res.json(commandes);
        } catch (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Erreur lors de la recherche des commandes' });
        }
    });

    // CRUD LIGNESCOMMANDES

    /**
 * @swagger
 * /lignescommandes:
 *   get:
 *     summary: Retrieve a list of lignescommandes
 *     responses:
 *       200:
 *         description: A list of lignescommandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   idcommande:
 *                     type: integer
 *                   idproduit:
 *                     type: integer
 *                   quantitecommande:
 *                     type: integer
 *                   prixunitaire:
 *                     type: number
 */

    app.get('/lignescommandes', async (req, res) => {
        const [lignescommandes] = await connection.query('SELECT * FROM LignesCommandes');
        res.json(lignescommandes);
    });
    /**
 * @swagger
 * /lignescommandes:
 *   post:
 *     summary: Create a new lignecommande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idcommande:
 *                 type: integer
 *               idproduit:
 *                 type: integer
 *               quantitecommande:
 *                 type: integer
 *               prixunitaire:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Missing required parameters
 */
    app.post('/lignescommandes', async (req, res) => {
        const { idcommande, idproduit, quantitecommande, prixunitaire } = req.body;
        if (!idcommande || !idproduit || !quantitecommande || !prixunitaire) {
            return res.status(400).json({ error: 'Missing required parameters "idcommande", "idproduit", "quantitecommande" and/or "prixunitaire"' });
        }
        await connection.query('INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) VALUES (?, ?, ?, ?)', [idcommande, idproduit, quantitecommande, prixunitaire]);
        res.status(201).end();
    });
    /**
 * @swagger
 * /lignescommandes/{id}:
 *   put:
 *     summary: Update a lignecommande
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idcommande:
 *                 type: integer
 *               idproduit:
 *                 type: integer
 *               quantitecommande:
 *                 type: integer
 *               prixunitaire:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Missing required parameters
 */
    app.put('/lignescommandes/:id', async (req, res) => {
        const id = req.params.id;
        const { idcommande, idproduit, quantitecommande, prixunitaire } = req.body;
        if (!idcommande || !idproduit || !quantitecommande || !prixunitaire) {
            return res.status(400).json({ error: 'Missing required parameters "idcommande", "idproduit", "quantitecommande" and/or "prixunitaire"' });
        }
        await connection.query('UPDATE LignesCommandes SET idcommande = ?, idproduit = ?, quantitecommande = ?, prixunitaire = ? WHERE id = ?', [idcommande, idproduit, quantitecommande, prixunitaire, id]);
        res.status(200).end();
    });
  /**
 * @swagger
 * /lignescommandes/{id}:
 *   delete:
 *     summary: Delete an order line
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order line ID
 *     responses:
 *       200:
 *         description: Order line deleted successfully
 *       500:
 *         description: Error deleting order line
 */
    app.delete('/lignescommandes/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM LignesCommandes WHERE id = ?', [id]);
        res.status(200).end();
    });

    //Amélioration de la logique

    /**
 * @swagger
 * /commandeauto:
 *   post:
 *     summary: Create an order with automatic stock management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date_commande:
 *                 type: string
 *                 format: date
 *               idClient:
 *                 type: integer
 *               lignescommandes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idproduit:
 *                       type: integer
 *                     quantitecommande:
 *                       type: integer
 *                     prixunitaire:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order and order lines created successfully
 *       400:
 *         description: Missing required parameters or insufficient stock
 *       500:
 *         description: Error creating order
 */
    app.post('/commandeauto', async (req, res) => {
        const { date_commande, idClient, lignescommandes } = req.body;
    
        if (!date_commande || !idClient || !Array.isArray(lignescommandes) || lignescommandes.length === 0) {
            return res.status(400).json({ error: 'Missing required parameters "date_commande", "idClient" and/or "lignescommandes"' });
        }
    
        await connection.beginTransaction();
    
        try {
            const [result] = await connection.query('INSERT INTO Commandes (datecommande, idclient) VALUES (?, ?)', [date_commande, idClient]);
            const idCommande = result.insertId;
    
            for (const ligne of lignescommandes) {
                const { idproduit, quantitecommande, prixunitaire } = ligne;
                if (!idproduit || !quantitecommande || !prixunitaire) {
                    throw new Error('Missing required parameters in one of the lignescommandes');
                }
                const [produit] = await connection.query('SELECT quantitestock FROM Produits WHERE id = ?', [idproduit]);
                if (produit.length === 0) {
                    throw new Error(`Product with id ${idproduit} not found`);
                }
                const newQuantiteStock = produit[0].quantitestock - quantitecommande;
                if (newQuantiteStock < 0) {
                    throw new Error(`Not enough stock for product with id ${idproduit}`);
                }
                await connection.query('UPDATE Produits SET quantitestock = ? WHERE id = ?', [newQuantiteStock, idproduit]);
                await connection.query('INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) VALUES (?, ?, ?, ?)', [idCommande, idproduit, quantitecommande, prixunitaire]);
            }
            await connection.commit();
            res.status(201).json({ message: 'Commande and lignescommandes created successfully' });
        } catch (error) {
            await connection.rollback();
            res.status(400).json({ error: error.message });
        }
    });

    //Produit le plus vendu
    /**
 * @swagger
 * /stats/lesplusvendus:
 *   get:
 *     summary: Get the most sold products
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date for the period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date for the period
 *     responses:
 *       200:
 *         description: A list of the most sold products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nomreference:
 *                     type: string
 *                   total_sold:
 *                     type: integer
 *       500:
 *         description: Error retrieving the most sold products
 */
    app.get('/stats/lesplusvendus', async (req, res) => {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT p.nomreference, SUM(lc.quantitecommande) AS total_sold
            FROM Produits p
            JOIN LignesCommandes lc ON p.id = lc.idproduit
            JOIN Commandes c ON lc.idcommande = c.id
            WHERE 1=1
        `;
        const params = [];
    
        if (startDate && endDate) {
            query += ' AND c.datecommande BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
    
        query += ' GROUP BY p.nomreference ORDER BY total_sold DESC';
    
        try {
            const [results] = await connection.query(query, params);
            res.json(results);
        } catch (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des produits les plus vendus' });
        }
    });

    //Total des produits vendus sur une période
    /**
 * @swagger
 * /stats/totalventes:
 *   get:
 *     summary: Get total sales over a period
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date for the period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date for the period
 *     responses:
 *       200:
 *         description: Total sales amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_sales:
 *                   type: number
 *       500:
 *         description: Error retrieving total sales
 */
    app.get('/stats/totalventes', async (req, res) => {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT SUM(lc.quantitecommande * lc.prixunitaire) AS total_sales
            FROM LignesCommandes lc
            JOIN Commandes c ON lc.idcommande = c.id
            WHERE 1=1
        `;
        const params = [];
    
        if (startDate && endDate) {
            query += ' AND c.datecommande BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
    
        try {
            const [results] = await connection.query(query, params);
            res.json(results[0]);
        } catch (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des ventes totales' });
        }
    });

    //Notification de stock faible

    /**
 * @swagger
 * /produits/stock-faible:
 *   get:
 *     summary: Get products with low stock
 *     parameters:
 *       - in: query
 *         name: seuil
 *         schema:
 *           type: integer
 *         required: true
 *         description: Stock threshold
 *     responses:
 *       200:
 *         description: A list of products with low stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nomreference:
 *                     type: string
 *                   quantitestock:
 *                     type: integer
 *       400:
 *         description: Invalid threshold value
 *       500:
 *         description: Error retrieving products with low stock
 */
    app.get('/produits/stock-faible', async (req, res) => {
        const { seuil } = req.query;
        const threshold = parseInt(seuil, 10);
    
        if (isNaN(threshold)) {
            return res.status(400).json({ error: 'Invalid threshold value' });
        }
    
        try {
            const [products] = await connection.query('SELECT * FROM Produits WHERE quantitestock < ?', [threshold]);
            res.json(products);
        } catch (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des produits avec stock faible' });
        }
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });

}).catch((err) => {
    console.error('Erreur dans la requête :', err);
    process.exit(1);
});