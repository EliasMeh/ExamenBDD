-- FOURNISSEUR PROCEDURES

DROP PROCEDURE IF EXISTS insertFournisseur;
CREATE PROCEDURE insertFournisseur(
    IN nomfournisseur VARCHAR(255),
    IN codepostal VARCHAR(5)
)
BEGIN
    INSERT INTO Fournisseurs (nomfournisseur, codepostal) VALUES (nomfournisseur, codepostal);
END;

DROP PROCEDURE IF EXISTS updateFournisseur;
CREATE PROCEDURE updateFournisseur(
    IN fournisseurId INT,
    IN nomfournisseur VARCHAR(255),
    IN codepostal VARCHAR(5)
)
BEGIN
    UPDATE Fournisseurs SET nomfournisseur = nomfournisseur, codepostal = codepostal WHERE id = fournisseurId;
END;

DROP PROCEDURE IF EXISTS deleteFournisseur;
CREATE PROCEDURE deleteFournisseur(
    IN fournisseurId INT
)
BEGIN
    DELETE FROM Fournisseurs WHERE id = fournisseurId;
END;

DROP PROCEDURE IF EXISTS getFournisseurs;
CREATE PROCEDURE getFournisseurs()
BEGIN
    SELECT * FROM Fournisseurs;
END;

-- CATEGORIES PROCEDURES

DROP PROCEDURE IF EXISTS insertCategorie;
CREATE PROCEDURE insertCategorie(
    IN nomcategorie VARCHAR(255)
)
BEGIN
    INSERT INTO Categories (nomcategorie) VALUES (nomcategorie);
END;

DROP PROCEDURE IF EXISTS updateCategorie;
CREATE PROCEDURE updateCategorie(
    IN categorieId INT,
    IN nomcategorie VARCHAR(255)
)
BEGIN
    UPDATE Categories SET nomcategorie = nomcategorie WHERE id = categorieId;
END;

DROP PROCEDURE IF EXISTS deleteCategorie;
CREATE PROCEDURE deleteCategorie(
    IN categorieId INT
)
BEGIN
    DELETE FROM Categories WHERE id = categorieId;
END;

DROP PROCEDURE IF EXISTS getCategories;
CREATE PROCEDURE getCategories()
BEGIN
    SELECT * FROM Categories;
END;

-- PRODUITS PROCEDURES

DROP PROCEDURE IF EXISTS insertProduit;
CREATE PROCEDURE insertProduit(
    IN nomreference VARCHAR(255),
    IN quantitestock INT,
    IN prixunitaire DECIMAL(10,2),
    IN idcategorie INT
)
BEGIN
    INSERT INTO Produits (nomreference, quantitestock, prixunitaire, idcategorie) VALUES (nomreference, quantitestock, prixunitaire, idcategorie);
END;

DROP PROCEDURE IF EXISTS updateProduit;
CREATE PROCEDURE updateProduit(
    IN produitId INT,
    IN nomreference VARCHAR(255),
    IN quantitestock INT,
    IN prixunitaire DECIMAL(10,2),
    IN idcategorie INT
)
BEGIN
    UPDATE Produits SET nomreference = nomreference, quantitestock = quantitestock, prixunitaire = prixunitaire, idcategorie = idcategorie WHERE id = produitId;
END;

DROP PROCEDURE IF EXISTS deleteProduit;
CREATE PROCEDURE deleteProduit(
    IN produitId INT
)
BEGIN
    DELETE FROM Produits WHERE id = produitId;
END;

DROP PROCEDURE IF EXISTS getProduits;
CREATE PROCEDURE getProduits()
BEGIN
    SELECT * FROM Produits;
END;

-- FOURNIR PROCEDURES

DROP PROCEDURE IF EXISTS insertFournir;
CREATE PROCEDURE insertFournir(
    IN idproduit INT,
    IN idfournisseur INT
)
BEGIN
    INSERT INTO Fournir (idproduit, idfournisseur) VALUES (idproduit, idfournisseur);
END;

DROP PROCEDURE IF EXISTS updateFournir;
CREATE PROCEDURE updateFournir(
    IN oldIdproduit INT,
    IN oldIdfournisseur INT,
    IN newIdproduit INT,
    IN newIdfournisseur INT
)
BEGIN
    UPDATE Fournir SET idproduit = newIdproduit, idfournisseur = newIdfournisseur WHERE idproduit = oldIdproduit AND idfournisseur = oldIdfournisseur;
END;

DROP PROCEDURE IF EXISTS deleteFournir;
CREATE PROCEDURE deleteFournir(
    IN idproduit INT,
    IN idfournisseur INT
)
BEGIN
    DELETE FROM Fournir WHERE idproduit = idproduit AND idfournisseur = idfournisseur;
END;

DROP PROCEDURE IF EXISTS getFournir;
CREATE PROCEDURE getFournir()
BEGIN
    SELECT * FROM Fournir;
END;

-- CLIENTS PROCEDURES

DROP PROCEDURE IF EXISTS insertClient;
CREATE PROCEDURE insertClient(
    IN nomclient VARCHAR(255),
    IN prenomclient VARCHAR(255),
    IN emailclient VARCHAR(255),
    IN adresseclient VARCHAR(255),
    IN codepostalclient VARCHAR(5)
)
BEGIN
    INSERT INTO Clients (nomclient, prenomclient, emailclient, adresseclient, codepostalclient) VALUES (nomclient, prenomclient, emailclient, adresseclient, codepostalclient);
END;

DROP PROCEDURE IF EXISTS updateClient;
CREATE PROCEDURE updateClient(
    IN clientId INT,
    IN nomclient VARCHAR(255),
    IN prenomclient VARCHAR(255),
    IN emailclient VARCHAR(255),
    IN adresseclient VARCHAR(255),
    IN codepostalclient VARCHAR(5)
)
BEGIN
    UPDATE Clients SET nomclient = nomclient, prenomclient = prenomclient, emailclient = emailclient, adresseclient = adresseclient, codepostalclient = codepostalclient WHERE id = clientId;
END;

DROP PROCEDURE IF EXISTS deleteClient;
CREATE PROCEDURE deleteClient(
    IN clientId INT
)
BEGIN
    DELETE FROM Clients WHERE id = clientId;
END;

DROP PROCEDURE IF EXISTS getClients;
CREATE PROCEDURE getClients()
BEGIN
    SELECT * FROM Clients;
END;

-- COMMANDES PROCEDURES

DROP PROCEDURE IF EXISTS insertCommande;
CREATE PROCEDURE insertCommande(
    IN datecommande DATE,
    IN idclient INT
)
BEGIN
    INSERT INTO Commandes (datecommande, idclient) VALUES (datecommande, idclient);
END;

DROP PROCEDURE IF EXISTS updateCommande;
CREATE PROCEDURE updateCommande(
    IN commandeId INT,
    IN datecommande DATE,
    IN idclient INT
)
BEGIN
    UPDATE Commandes SET datecommande = datecommande, idclient = idclient WHERE id = commandeId;
END;

DROP PROCEDURE IF EXISTS deleteCommande;
CREATE PROCEDURE deleteCommande(
    IN commandeId INT
)
BEGIN
    DELETE FROM Commandes WHERE id = commandeId;
END;

DROP PROCEDURE IF EXISTS getCommandes;
CREATE PROCEDURE getCommandes()
BEGIN
    SELECT * FROM Commandes;
END;

-- LIGNESCOMMANDES PROCEDURES

DROP PROCEDURE IF EXISTS insertLigneCommande;
CREATE PROCEDURE insertLigneCommande(
    IN idcommande INT,
    IN idproduit INT,
    IN quantitecommande INT,
    IN prixunitaire DECIMAL(10,2)
)
BEGIN
    DECLARE current_stock INT;
    START TRANSACTION;
    SELECT quantitestock INTO current_stock FROM Produits WHERE id = idproduit FOR UPDATE;
    IF current_stock >= quantitecommande THEN
        INSERT INTO LignesCommandes (idcommande, idproduit, quantitecommande, prixunitaire) 
        VALUES (idcommande, idproduit, quantitecommande, prixunitaire);
        UPDATE Produits SET quantitestock = quantitestock - quantitecommande WHERE id = idproduit;
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for product';
    END IF;
END;

DROP PROCEDURE IF EXISTS updateLigneCommande;
CREATE PROCEDURE updateLigneCommande(
    IN ligneCommandeId INT,
    IN idcommande INT,
    IN idproduit INT,
    IN quantitecommande INT,
    IN prixunitaire DECIMAL(10,2)
)
BEGIN
    UPDATE LignesCommandes SET idcommande = idcommande, idproduit = idproduit, quantitecommande = quantitecommande, prixunitaire = prixunitaire WHERE id = ligneCommandeId;
END;

DROP PROCEDURE IF EXISTS deleteLigneCommande;
CREATE PROCEDURE deleteLigneCommande(
    IN ligneCommandeId INT
)
BEGIN
    DELETE FROM LignesCommandes WHERE id = ligneCommandeId;
END;

DROP PROCEDURE IF EXISTS getLignesCommandes;
CREATE PROCEDURE getLignesCommandes()
BEGIN
    SELECT * FROM LignesCommandes;
END;
