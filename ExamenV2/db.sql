-- Création de la bdd et de la structure
DROP DATABASE IF EXISTS Exam;
CREATE DATABASE Exam;

USE Exam;


CREATE TABLE Fournisseurs(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomfournisseur VARCHAR(255) NOT NULL,
    codepostal VARCHAR(5) NOT NULL
);

CREATE TABLE Categories(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomcategorie VARCHAR(255) NOT NULL
);

CREATE TABLE Produits(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomreference VARCHAR(255) NOT NULL,
    quantitestock INT NOT NULL CHECK(quantitestock >= 0),
    prixunitaire DECIMAL(10,2) NOT NULL,
    idcategorie INT NOT NULL,
    FOREIGN KEY (idcategorie) REFERENCES Categories(id)
);

CREATE TABLE Fournir(
    idproduit INT NOT NULL,
    idfournisseur INT NOT NULL,
    PRIMARY KEY (idproduit, idfournisseur),
    FOREIGN KEY (idproduit) REFERENCES Produits(id),
    FOREIGN KEY (idfournisseur) REFERENCES Fournisseurs(id)
);

CREATE TABLE Clients(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomclient VARCHAR(255) NOT NULL,
    prenomclient VARCHAR(255) NOT NULL,
    emailclient VARCHAR(255) NOT NULL,
    adresseclient VARCHAR(255) NOT NULL,
    codepostalclient VARCHAR(5) NOT NULL
);

CREATE TABLE Commandes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    datecommande DATE NOT NULL,
    idclient INT NOT NULL,
    FOREIGN KEY (idclient) REFERENCES Clients(id)
);

CREATE TABLE LignesCommandes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    idcommande INT NOT NULL,
    idproduit INT NOT NULL,
    quantitecommande INT NOT NULL,
    prixunitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idcommande) REFERENCES Commandes(id),
    FOREIGN KEY (idproduit) REFERENCES Produits(id)
);
