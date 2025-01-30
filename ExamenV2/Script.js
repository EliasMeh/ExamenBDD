const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(express.json());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'Exam',
    multipleStatements: true
};

const executeSQLFile = async (connection, filePath) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    await connection.query(sql);
    console.log(`${filePath} exécuté avec succès`);
};

const initDB = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connexion à MySQL réussie');

        await executeSQLFile(connection, 'db.sql');
        await executeSQLFile(connection, 'data.sql');

        console.log('Base de données initialisée avec succès');
        return connection;
    } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base de données :', err);
        process.exit(1);
    }
};

initDB().then((connection) => {
    // CRUD FOURNISSEURS
    app.get('/fournisseurs', async (req, res) => {
        const [fournisseurs] = await connection.query('CALL getFournisseurs()');
        res.json(fournisseurs);
    });
    app.post('/fournisseurs', async (req, res) => {
        const { nom, codepostal } = req.body;
        if (!nom || !codepostal) {
            return res.status(400).json({ error: 'Missing required parameters "nom" and/or "codepostal"' });
        }
        await connection.query('INSERT INTO Fournisseurs (nom, codepostal) VALUES (?, ?)', [nom, codepostal]);
        res.status(201).end();
    });
    app.put('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        const { nom, codepostal } = req.body;
        if (!nom || !codepostal) {
            return res.status(400).json({ error: 'Missing required parameters "nom" and/or "codepostal"' });
        }
        await connection.query('UPDATE Fournisseurs SET nom = ?, codepostal = ? WHERE id = ?', [nom, codepostal, id]);
        res.status(200).end();
    });
    app.delete('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Fournisseurs WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD PRODUITS
    app.get('/produits', async (req, res) => {
        const [produits] = await connection.query('SELECT * FROM Produits');
        res.json(produits);
    });
    app.post('/produits', async (req, res) => {
        const { nomreference, quantitestock, prixunitaire, idcategorie } = req.body;
        if (!nomreference || !quantitestock || !prixunitaire || !idcategorie) {
            return res.status(400).json({ error: 'Missing required parameters "nomreference", "quantitestock", "prixunitaire" and/or "idcategorie"' });
        }
        await connection.query('INSERT INTO Produits (nomreference, quantitestock, prixunitaire, idcategorie) VALUES (?, ?, ?, ?)', [nomreference, quantitestock, prixunitaire, idcategorie]);
        res.status(201).end();
    });
    app.put('/produits/:id', async (req, res) => {
        const id = req.params.id;
        const { nomreference, quantitestock, prixunitaire, idcategorie } = req.body;
        if (!nomreference || !quantitestock || !prixunitaire || !idcategorie) {
            return res.status(400).json({ error: 'Missing required parameters "nomreference", "quantitestock", "prixunitaire" and/or "idcategorie"' });
        }
        await connection.query('UPDATE Produits SET nomreference = ?, quantitestock = ?, prixunitaire = ?, idcategorie = ? WHERE id = ?', [nomreference, quantitestock, prixunitaire, idcategorie, id]);
        res.status(200).end();
    });
    app.delete('/produits/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Produits WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD CATEGORIES
    app.get('/categories', async (req, res) => {
        const [categories] = await connection.query('SELECT * FROM Categories');
        res.json(categories);
    });
    app.post('/categories', async (req, res) => {
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        await connection.query('INSERT INTO Categories (nom) VALUES (?)', [nom]);
        res.status(201).end();
    });
    app.put('/categories/:id', async (req, res) => {
        const id = req.params.id;
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        await connection.query('UPDATE Categories SET nom = ? WHERE id = ?', [nom, id]);
        res.status(200).end();
    });
    app.delete('/categories/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Categories WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD FOURNIR
    app.get('/fournir', async (req, res) => {
        const [fournir] = await connection.query('SELECT * FROM Fournir');
        res.json(fournir);
    });
    app.post('/fournir', async (req, res) => {
        const { idproduit, idfournisseur } = req.body;
        if (!idproduit || !idfournisseur) {
            return res.status(400).json({ error: 'Missing required parameters "idproduit" and/or "idfournisseur"' });
        }
        await connection.query('INSERT INTO Fournir (idproduit, idfournisseur) VALUES (?, ?)', [idproduit, idfournisseur]);
        res.status(201).end();
    });
    app.put('/fournir/:idproduit/:idfournisseur', async (req, res) => {
        const { idproduit, idfournisseur } = req.params;
        const { newIdproduit, newIdfournisseur } = req.body;
        if (!newIdproduit || !newIdfournisseur) {
            return res.status(400).json({ error: 'Missing required parameters "newIdproduit" and/or "newIdfournisseur"' });
        }
        await connection.query('UPDATE Fournir SET idproduit = ?, idfournisseur = ? WHERE idproduit = ? AND idfournisseur = ?', [newIdproduit, newIdfournisseur, idproduit, idfournisseur]);
        res.status(200).end();
    });
    app.delete('/fournir/:idproduit/:idfournisseur', async (req, res) => {
        const { idproduit, idfournisseur } = req.params;
        await connection.query('DELETE FROM Fournir WHERE idproduit = ? AND idfournisseur = ?', [idproduit, idfournisseur]);
        res.status(200).end();
    });

    // CRUD CLIENTS
    app.get('/clients', async (req, res) => {
        const [clients] = await connection.query('SELECT * FROM Clients');
        res.json(clients);
    });
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
    app.put('/clients/:id', async (req, res) => {
        const id = req.params.id;
        const { nomclient, prenomclient, emailclient, adresseclient, codepostalclient } = req.body;
        if (!nomclient || !prenomclient || !emailclient || !adresseclient || !codepostalclient) {
            return res.status(400).json({ error: 'Missing required parameters "nomclient", "prenomclient", "emailclient", "adresseclient" and/or "codepostalclient"' });
        }
        await connection.query('UPDATE Clients SET nomclient = ?, prenomclient = ?, emailclient = ?, adresseclient = ?, codepostalclient = ? WHERE id = ?', [nomclient, prenomclient, emailclient, adresseclient, codepostalclient, id]);
        res.status(200).end();
    });
    app.delete('/clients/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Clients WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD COMMANDES
    app.get('/commandes', async (req, res) => {
        const [commandes] = await connection.query('SELECT * FROM Commandes');
        res.json(commandes);
    });
    app.post('/commandes', async (req, res) => {
        const { datecommande, idclient } = req.body;
        if (!datecommande || !idclient) {
            return res.status(400).json({ error: 'Missing required parameters "datecommande" and/or "idclient"' });
        }
        await connection.query('INSERT INTO Commandes (datecommande, idclient) VALUES (?, ?)', [datecommande, idclient]);
        res.status(201).end();
    });
    app.put('/commandes/:id', async (req, res) => {
        const id = req.params.id;
        const { datecommande, idclient } = req.body;
        if (!datecommande || !idclient) {
            return res.status(400).json({ error: 'Missing required parameters "datecommande" and/or "idclient"' });
        }
        await connection.query('UPDATE Commandes SET datecommande = ?, idclient = ? WHERE id = ?', [datecommande, idclient, id]);
        res.status(200).end();
    });
    app.delete('/commandes/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM Commandes WHERE id = ?', [id]);
        res.status(200).end();
    });

    // CRUD LIGNESCOMMANDES
    app.get('/lignescommandes', async (req, res) => {
        const [lignescommandes] = await connection.query('SELECT * FROM LignesCommandes');
        res.json(lignescommandes);
    });
    app.post('/lignescommandes', async (req, res) => {
        const { idcommande, idproduit, quantitecommande, prixunitaire } = req.body;
        if (!idcommande || !idproduit || !quantitecommande || !prixunitaire) {
            return res.status(400).json({ error: 'Missing required parameters "idcommande", "idproduit", "quantitecommande" and/or "prixunitaire"' });
        }
        await connection.query('INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) VALUES (?, ?, ?, ?)', [idcommande, idproduit, quantitecommande, prixunitaire]);
        res.status(201).end();
    });
    app.put('/lignescommandes/:id', async (req, res) => {
        const id = req.params.id;
        const { idcommande, idproduit, quantitecommande, prixunitaire } = req.body;
        if (!idcommande || !idproduit || !quantitecommande || !prixunitaire) {
            return res.status(400).json({ error: 'Missing required parameters "idcommande", "idproduit", "quantitecommande" and/or "prixunitaire"' });
        }
        await connection.query('UPDATE LignesCommandes SET idcommande = ?, idproduit = ?, quantitecommande = ?, prixunitaire = ? WHERE id = ?', [idcommande, idproduit, quantitecommande, prixunitaire, id]);
        res.status(200).end();
    });
    app.delete('/lignescommandes/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query('DELETE FROM LignesCommandes WHERE id = ?', [id]);
        res.status(200).end();
    });

    //Amélioration de la logique
    app.post('/commandeauto', async (req, res) => {
        const { date_commande, idClient, lignescommandes } = req.body;
    
        if (!date_commande || !idClient || !Array.isArray(lignescommandes) || lignescommandes.length === 0) {
            return res.status(400).json({ error: 'Missing required parameters "date_commande", "idClient" and/or "lignescommandes"' });
        }
    
        await connection.beginTransaction();
    
        try {
            // Insert the new commande
            const [result] = await connection.query('INSERT INTO Commandes (datecommande, idclient) VALUES (?, ?)', [date_commande, idClient]);
            const idCommande = result.insertId;
    
            for (const ligne of lignescommandes) {
                const { idproduit, quantitecommande, prixunitaire } = ligne;
    
                if (!idproduit || !quantitecommande || !prixunitaire) {
                    throw new Error('Missing required parameters in one of the lignescommandes');
                }
    
                // Check the stock quantity
                const [produit] = await connection.query('SELECT quantitestock FROM Produits WHERE id = ?', [idproduit]);
                if (produit.length === 0) {
                    throw new Error(`Product with id ${idproduit} not found`);
                }
    
                const newQuantiteStock = produit[0].quantitestock - quantitecommande;
                if (newQuantiteStock < 0) {
                    throw new Error(`Not enough stock for product with id ${idproduit}`);
                }
    
                // Update the stock quantity
                await connection.query('UPDATE Produits SET quantitestock = ? WHERE id = ?', [newQuantiteStock, idproduit]);
    
                // Insert the lignecommande
                await connection.query('INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) VALUES (?, ?, ?, ?)', [idCommande, idproduit, quantitecommande, prixunitaire]);
            }
    
            await connection.commit();
            res.status(201).json({ message: 'Commande and lignescommandes created successfully' });
        } catch (error) {
            await connection.rollback();
            res.status(400).json({ error: error.message });
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