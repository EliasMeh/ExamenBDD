INSERT INTO Fournisseurs (nomfournisseur, codepostal) VALUES 
('Fournisseur A', '75001'),
('Fournisseur B', '75002'),
('Fournisseur C', '75003');

INSERT INTO Categories (nomcategorie) VALUES 
('Catégorie 1'),
('Catégorie 2'),
('Catégorie 3');

INSERT INTO Produits (nomreference, quantitestock, prixunitaire, idcategorie) VALUES 
('Produit 1', 100, 10.50, 1),
('Produit 2', 200, 20.00, 2),
('Produit 3', 300, 30.75, 3);

INSERT INTO Fournir (idproduit, idfournisseur) VALUES 
(1, 1),
(2, 2),
(3, 3);

INSERT INTO Clients (nomclient, prenomclient, emailclient, adresseclient, codepostalclient) VALUES 
('Client', 'A', 'clientA@example.com', 'Adresse A', '75001'),
('Client', 'B', 'clientB@example.com', 'Adresse B', '75002'),
('Client', 'C', 'clientC@example.com', 'Adresse C', '75003');

INSERT INTO Commandes (datecommande, idclient) VALUES 
('2023-01-01', 1),
('2023-02-01', 2),
('2023-03-01', 3);

INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) VALUES 
(1, 1, 10, 10.50),
(2, 2, 20, 20.00),
(3, 3, 30, 30.75);