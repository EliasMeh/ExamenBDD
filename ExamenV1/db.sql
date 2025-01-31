-- Création de la bdd et de la structure
DROP DATABASE IF EXISTS Exam ;
CREATE DATABASE Exam ;

USE Exam ;


CREATE TABLE Fournisseurs(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomfournisseur VARCHAR(255),
    codepostal VARCHAR(5)  
) ;

CREATE TABLE Categories(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomcategorie VARCHAR(255)
) ;


CREATE TABLE Produits(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomreference VARCHAR(255),
    quantitestock INT,
    prixunitaire DECIMAL(10,2),

    idcategorie INT ,

    FOREIGN KEY (idcategorie) REFERENCES Categories(id)
) ;

CREATE TABLE Fournir(
    idproduit INT,
    idfournisseur INT,
    FOREIGN KEY (idproduit) REFERENCES Produits(id),
    FOREIGN KEY (idfournisseur) REFERENCES Fournisseurs(id)
) ;


CREATE TABLE Clients(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomclient VARCHAR(255),
    prenomclient VARCHAR(255),
    emailclient VARCHAR(255) ,
    adresseclient VARCHAR(255),
    codepostalclient VARCHAR(5) 
) ;

CREATE TABLE Commandes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    datecommande DATE ,
    idclient INT ,
    FOREIGN KEY (idclient) REFERENCES Clients(id)
) ;


CREATE TABLE LignesCommandes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    idcommande INT ,
    idproduit INT ,
    quantitecommande INT,
    prixunitaire DECIMAL(10,2) ,
    FOREIGN KEY (idcommande) REFERENCES Commandes(id),
    FOREIGN KEY (idproduit) REFERENCES Produits(id)
) ;