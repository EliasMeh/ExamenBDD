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
    multipleStatements: true
};

const executeSQLFile = async (connection, filePath) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    await connection.query(sql);
    console.log(`${filePath} exécuté avec succès`);
};

const initDB = async () => {
    try {
        const connection = await mysql.createConnection({ ...dbConfig, database: undefined });
        console.log('Connexion à MySQL réussie');

        await executeSQLFile(connection, 'db.sql');

        await connection.changeUser({ database: 'Exam' });

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
        const [fournisseurs] = await connection.query('SELECT * FROM Fournisseurs');
        res.json(fournisseurs);
    });
    app.post('/fournisseurs', async (req, res) => {
        const { nom, codepostal } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        if (!codepostal) {
            return res.status(400).json({ error: 'Missing required parameter "codepostal"' });
        }
        await connection.query(`INSERT INTO Fournisseurs (nom, codepostal) VALUES ('${nom}', '${codepostal}')`);
        res.status(201).end();
    });
    app.put('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        const { nom, codepostal } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        if (!codepostal) {
            return res.status(400).json({ error: 'Missing required parameter "codepostal"' });
        }
        await connection.query(`UPDATE Fournisseurs SET nom = '${nom}', codepostal = '${codepostal}' WHERE id = ${id}`);
        res.status(200).end();
    });
    app.delete('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query(`DELETE FROM Fournisseurs WHERE id = ${id}`);
        res.status(200).end();
    });
    app.get('/fournisseurs/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const resultat = await connection.query(`SELECT * FROM Fournisseurs WHERE id = ${id}`);
            if (resultat.length === 0) {
                return res.status(404).json({ error: 'Fournisseur not found' });
            }
            res.json(resultat);
        } catch (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    //CRUD PRODUITS
    app.get('/produits', async (req, res) => {
        const [produits] = await connection.query('SELECT * FROM Produits');
        res.json(produits);
    });
    app.post('/produits', async (req, res) => {
        const { nomreference, quantitestock, prixunitaire, idcategorie} = req.body;
        if (!nomreference) {
            return res.status(400).json({ error: 'Missing required parameter "nomreference"' });
        }
        if (!quantitestock) {
            return res.status(400).json({ error: 'Missing required parameter "quantitestock"' });
        }
        if (!prixunitaire) {
            return res.status(400).json({ error: 'Missing required parameter "prixunitaire"' });
        }
        if (!idcategorie) {
            return res.status(400).json({ error: 'Missing required parameter "idcategorie"' });
        }
        await connection.query(`INSERT INTO Produits (nomreference, quantitestock, prixunitaire, idcategorie) VALUES ('${nomreference}', '${quantitestock}', '${prixunitaire}', '${idcategorie}')`);
        res.status(201).end();
    });
    app.put('/produits/:id', async (req, res) => {
        const id = req.params.id;
        const { nomreference, quantitestock, prixunitaire, idcategorie } = req.body;
        if (!nomreference) {
            return res.status(400).json({ error: 'Missing required parameter "nomreference"' });
        }
        if (!quantitestock) {
            return res.status(400).json({ error: 'Missing required parameter "quantitestock"' });
        }
        if (!prixunitaire) {
            return res.status(400).json({ error: 'Missing required parameter "prixunitaire"' });
        }
        if (!idcategorie) {
            return res.status(400).json({ error: 'Missing required parameter "idcategorie"' });
        }
        await connection.query(`UPDATE Produits SET nomreference = '${nomreference}', quantitestock = '${quantitestock}', prixunitaire = '${prixunitaire}', idcategorie = '${idcategorie}' WHERE id = ${id}`);
        res.status(200).end();
    });
    app.delete('/produits/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query(`DELETE FROM Produits WHERE id = ${id}`);
        res.status(200).end();
    });

    //CRUD CATEGORIES
    app.get('/categories', async (req, res) => {
        const [categories] = await connection.query('SELECT * FROM Categories');
        res.json(categories);
    });
    app.post('/categories', async (req, res) => {
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        await connection.query(`INSERT INTO Categories (nom) VALUES ('${nom}')`);
        res.status(201).end();
    });
    app.put('/categories/:id', async (req, res) => {
        const id = req.params.id;
        const { nom } = req.body;
        if (!nom) {
            return res.status(400).json({ error: 'Missing required parameter "nom"' });
        }
        await connection.query(`UPDATE Categories SET nom = '${nom}' WHERE id = ${id}`);
        res.status(200).end();
    });
    app.delete('/categories/:id', async (req, res) => {
        const id = req.params.id;
        await connection.query(`DELETE FROM Categories WHERE id = ${id}`);
        res.status(200).end();
    });

        // CRUD FOURNIR
        app.get('/fournir', async (req, res) => {
            const [fournir] = await connection.query('SELECT * FROM Fournir');
            res.json(fournir);
        });
        app.post('/fournir', async (req, res) => {
            const { idproduit, idfournisseur } = req.body;
            if (!idproduit) {
                return res.status(400).json({ error: 'Missing required parameter "idproduit"' });
            }
            if (!idfournisseur) {
                return res.status(400).json({ error: 'Missing required parameter "idfournisseur"' });
            }
            await connection.query(`INSERT INTO Fournir (idproduit, idfournisseur) VALUES ('${idproduit}', '${idfournisseur}')`);
            res.status(201).end();
        });
        app.put('/fournir/:idproduit/:idfournisseur', async (req, res) => {
            const { idproduit, idfournisseur } = req.params;
            const { newIdproduit, newIdfournisseur } = req.body;
            if (!newIdproduit) {
                return res.status(400).json({ error: 'Missing required parameter "newIdproduit"' });
            }
            if (!newIdfournisseur) {
                return res.status(400).json({ error: 'Missing required parameter "newIdfournisseur"' });
            }
            await connection.query(`UPDATE Fournir SET idproduit = '${newIdproduit}', idfournisseur = '${newIdfournisseur}' WHERE idproduit = ${idproduit} AND idfournisseur = ${idfournisseur}`);
            res.status(200).end();
        });
        app.delete('/fournir/:idproduit/:idfournisseur', async (req, res) => {
            const { idproduit, idfournisseur } = req.params;
            await connection.query(`DELETE FROM Fournir WHERE idproduit = ${idproduit} AND idfournisseur = ${idfournisseur}`);
            res.status(200).end();
        });


        // CRUD CLIENTS
        app.get('/clients', async (req, res) => {
            const [clients] = await connection.query('SELECT * FROM Clients');
            res.json(clients);
        });
        app.post('/clients', async (req, res) => {
            const { nomclient, prenomclient, emailclient, adresseclient, codepostalclient } = req.body;
            if (!nomclient | !prenomclient | !emailclient | !adresseclient | !codepostalclient) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            await connection.query(`INSERT INTO Clients (nomclient, prenomclient, emailclient, adresseclient, codepostalclient) VALUES ('${nomclient}', '${prenomclient}', '${emailclient}', '${adresseclient}', '${codepostalclient}')`);
            res.status(201).end();
        });
        app.put('/clients/:id', async (req, res) => {
            const id = req.params.id;
            const { nomclient, prenomclient, emailclient, adresseclient, codepostalclient } = req.body;
            if (!nomclient | !prenomclient | !emailclient | !adresseclient | !codepostalclient) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            await connection.query(`UPDATE Clients SET nomclient = '${nomclient}', prenomclient = '${prenomclient}', emailclient = '${emailclient}', adresseclient = '${adresseclient}', codepostalclient = '${codepostalclient}' WHERE id = ${id}`);
            res.status(200).end();
        });
        app.delete('/clients/:id', async (req, res) => {
            const id = req.params.id;
            await connection.query(`DELETE FROM Clients WHERE id = ${id}`);
            res.status(200).end();
        });
            
        // CRUD COMMANDES
        app.get('/commandes', async (req, res) => {
            const [commandes] = await connection.query('SELECT * FROM Commandes');
            res.json(commandes);
        });
        app.post('/commandes', async (req, res) => {
            const { datecommande, idclient } = req.body;
            console.log(req.body);
            if (!datecommande) {
                return res.status(400).json({ error: 'Missing required parameter "datecommande"' });
            }
            if (!idclient) {
                return res.status(400).json({ error: 'Missing required parameter "idclient"' });
            }
            await connection.query(`INSERT INTO Commandes (datecommande, idclient) VALUES ('${datecommande}', '${idclient}')`);
            res.status(201).end();
        });
        app.put('/commandes/:id', async (req, res) => {
            const id = req.params.id;
            const { datecommande, idclient } = req.body;
            if (!datecommande) {
                return res.status(400).json({ error: 'Missing required parameter "datecommande"' });
            }
            if (!idclient) {
                return res.status(400).json({ error: 'Missing required parameter "idclient"' });
            }
            await connection.query(`UPDATE Commandes SET datecommande = '${datecommande}', idclient = '${idclient}' WHERE id = ${id}`);
            res.status(200).end();
        });
        app.delete('/commandes/:id', async (req, res) => {
            const id = req.params.id;
            await connection.query(`DELETE FROM Commandes WHERE id = ${id}`);
            res.status(200).end();
        });

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
        
        // CRUD LIGNESCOMMANDES
        app.get('/lignescommandes', async (req, res) => {
            const [lignescommandes] = await connection.query('SELECT * FROM LignesCommandes');
            res.json(lignescommandes);
        });
        app.post('/lignescommandes', async (req, res) => {
            const { idcommande, idproduit, quantitecommande, prixunitaire } = req.body;
            if (!idcommande) {
                return res.status(400).json({ error: 'Missing required parameter "idcommande"' });
            }
            if (!idproduit) {
                return res.status(400).json({ error: 'Missing required parameter "idproduit"' });
            }
            if (!quantitecommande) {
                return res.status(400).json({ error: 'Missing required parameter "quantitecommande"' });
            }
            if (!prixunitaire) {
                return res.status(400).json({ error: 'Missing required parameter "prixunitaire"' });
            }
            await connection.query(`INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) VALUES ('${idcommande}', '${idproduit}', '${quantitecommande}', '${prixunitaire}')`);
            res.status(201).end();
        });
        app.put('/lignescommandes/:id', async (req, res) => {
            const id = req.params.id;
            const { idcommande, idproduit, quantitecommande, prixunitaire } = req.body;
            if (!idcommande) {
                return res.status(400).json({ error: 'Missing required parameter "idcommande"' });
            }
            if (!idproduit) {
                return res.status(400).json({ error: 'Missing required parameter "idproduit"' });
            }
            if (!quantitecommande) {
                return res.status(400).json({ error: 'Missing required parameter "quantitecommande"' });
            }
            if (!prixunitaire) {
                return res.status(400).json({ error: 'Missing required parameter "prixunitaire"' });
            }
            await connection.query(`UPDATE LignesCommandes SET idcommande = '${idcommande}', idproduit = '${idproduit}', quantitecommande = '${quantitecommande}', prixunitaire = '${prixunitaire}' WHERE id = ${id}`);
            res.status(200).end();
        });
        app.delete('/lignescommandes/:id', async (req, res) => {
            const id = req.params.id;
            await connection.query(`DELETE FROM LignesCommandes WHERE id = ${id}`);
            res.status(200).end();
        });

    
    }).catch((err) => {
        console.error('Erreur dans la requête :', err);
        process.exit(1);
});