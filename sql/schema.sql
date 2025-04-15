
DROP TABLE IF EXISTS _user;



/*
THESE ARE THE CORE TABLES 
*/



-- Table: _user
-- This table stores user information including contact details, credentials, and status flags.
-- add any extra fields to this table to extend the table
-- TODO add a copy of this to tmp, move this file across and replace it with the default on and then do the commit

CREATE TABLE "_user" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each user
	"name" TEXT, -- Full name of the user
	"email" TEXT, -- Email address of the user
	"phone" TEXT, -- Phone number of the user
	"cryptoAddress" TEXT, -- Cryptocurrency address associated with the user
	"username" TEXT, -- Username for user login
	"password" TEXT, -- Encrypted password for user login
	"apiSecret" TEXT, -- API secret key for user access
	"confirmed" TEXT DEFAULT 0, -- Confirmation status of the user
	"verifyCode" TEXT, -- Code used for verifying the user's email
	"isVerified" INTEGER DEFAULT 0, -- Flag indicating if the user is verified
	"isBlocked" INTEGER DEFAULT 0, -- Flag indicating if the user is blocked
	"resetPassword" INTEGER DEFAULT 0, -- Flag indicating if the user has requested a password reset
	"isAdmin" INTEGER DEFAULT 0, -- Flag indicating if the user has admin privileges
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the user is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the user was created
	"updatedAt" TEXT, -- Timestamp when the user was last updated
	"deletedAt" TEXT -- Timestamp when the user was deleted
);

INSERT INTO "_user" ("id","name","email","phone","cryptoAddress","username","password","apiSecret","confirmed","isBlocked","isAdmin","isDeleted")
VALUES (1,'cryptoskillz', 'test@orbitlabs.xyz', '123456789', '0x1521a6B56fFF63c9e97b9adA59716efF9D3A60eB', 'cryptoskillz', '$2b$10$xxNOWWE4B7p3QkLMRoMBhOGA7VGOMndeZBgmY7gLkuNoQKPu8.u16', 'a7fd098f-79cf-4c37-a527-2c9079a6e6a1', 1, 0, 1, 0);




/*
START OF CUSTOM TABLES
*/

/*
START OF PROPERTY TABLES
*/


DROP TABLE IF EXISTS property;


CREATE TABLE "property" (
	"id"	INTEGER,
	"userId"	INTEGER,
	"name"	VARCHAR(255) NOT NULL,
	"paymentAddress" TEXT,
	"address_1"	TEXT,
	"address_2"	TEXT,
	"address_3"	TEXT,
	"address_4"	TEXT,
	"address_5"	TEXT,
	"address_6"	TEXT,
	"description" TEXT NOT NULL,
	"bathrooms" INTEGER NOT NULL,
	"bedrooms" INTEGER NOT NULL,
	"garage" INTEGER DEFAULT 0,
	"area" INTEGER DEFAULT 0,
	"propertyType" INTEGER DEFAULT 1,
	"location" TEXT,
	"localCurrency" TEXT DEFAULT '$',
	"internationalCurrency" TEXT DEFAULT '$',
	"cryptoCurrency" REAL,
	"imageUrl" TEXT,
	"LocalTaxesCost" REAL,
	"internationalTaxesCost" REAL,
	"localSuggestedRentalPrice" REAL,
	"internationalSuggestedRentalPrice" REAL,
	"internationalCost" REAL,
	"localCost" REAL,
	"currentlyRented" INTEGER,
	"state" INTEGER DEFAULT 0,
	"tranchePrice" REAL NOT NULL,
	"tranches" INTEGER DEFAULT 0,
	"tranchesSold" INTEGER DEFAULT 0,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES "_user"("id")
);


INSERT INTO "property" (
  "name",
  "paymentAddress",
  "address_1",
  "bathrooms",
  "bedrooms",
  "localCurrency",
  "internationalCurrency",
  "localCost",
  "internationalCost",
  "LocalTaxesCost",
  "internationalTaxesCost",
  "userId",
  "localSuggestedRentalPrice",
  "internationalSuggestedRentalPrice",
  "currentlyRented",
  "description",
  "area",
  "location",
  "tranchePrice",
  "tranches"
) 
VALUES (
  'DCONDO',
  '0x960f470cE20Bfb519facA30b770474BBCdF78ef8',
  'Fa Ham, Thailand',
  1,
  2,
  '฿',
  '$',
  1800000,
  52087,
  40000,
  1157,
  1,
  8000,
  231,
  1,
  'Situated on the first floor is this well laid out 30 square metre studio apartment at Dcondo Sign, Chiang Mai. Rent: 9,000 THB/Month.<br>Property description:30 square metres of living space set on the first floor<br>Studio apartment with sliding doors to separate living space from sleeping if desired<br>Separate kitchen with fridge and microwave<br>Modern bathroom with screened walk-in shower<br>Fully furnished and equipped<br>Air-con (1 unit)<br>Dcondo Sign residents have the full use of the amazing swimming pool, fitness room, gardens, etc., and only a few minutes walk to Central Festival Shopping Mall.',
  33040,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.764847935789!2d99.01166282449663!3d18.8086301464348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a61db5fb68b%3A0xbd73456383721335!2sdcondo%20sign!5e0!3m2!1sen!2sth!4v1673361006602!5m2!1sen!2sth',
  1000,
  10
);


DROP TABLE IF EXISTS property_amenities;

CREATE TABLE "property_amenities" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"name" TEXT,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")

);

INSERT INTO "property_amenities" ("propertyId","name") VALUES(1, 'Balcony');
INSERT INTO "property_amenities" ("propertyId","name") VALUES(1, 'Deck');

DROP TABLE IF EXISTS property_images;

CREATE TABLE "property_images" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"cfId"	INTEGER,
	"image"	TEXT,
	"cfImageUrl" TEXT,
	"isCfImageDraft" INTEGER DEFAULT 1,
	"isDeleted" INTEGER DEFAULT 0,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")
);

INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, '99ad01ac-062d-44f1-3c9d-69e1bf815700','Dcondo-Sign-Chiang-Mai-rental-condos-1.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/99ad01ac-062d-44f1-3c9d-69e1bf815700/public');
INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, '5533613e-0a07-49eb-3473-620816344100','Dcondo-Sign-Chiang-Mai-rental-condos-2.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/5533613e-0a07-49eb-3473-620816344100/public');
INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, 'abcb400b-4251-446e-5620-0f3116b61900','Dcondo-Sign-Chiang-Mai-rental-condos-3.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/abcb400b-4251-446e-5620-0f3116b61900/public');
INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, '12f4701b-5405-4bf6-8229-85014d90d900','Dcondo-Sign-Chiang-Mai-rental-condos-4.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/12f4701b-5405-4bf6-8229-85014d90d900/public');
INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, 'f85925a6-a125-4a2b-d06a-2d5190e64100','Dcondo-Sign-Chiang-Mai-rental-condos-5.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/f85925a6-a125-4a2b-d06a-2d5190e64100/public');
INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, '3715cd29-2f97-4a67-d13b-a23e19b1fe00','Dcondo-Sign-Chiang-Mai-rental-condos-6.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/3715cd29-2f97-4a67-d13b-a23e19b1fe00/public');
INSERT INTO "property_images" ("propertyId","cfId","image","cfImageUrl") VALUES(1, '4841458b-8665-4ca9-1c50-4089c47ee300','Dcondo-Sign-Chiang-Mai-rental-condos-7.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/4841458b-8665-4ca9-1c50-4089c47ee300/public');




DROP TABLE IF EXISTS property_leads;

CREATE TABLE "property_leads" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"orderId" TEXT, 
	"email" TEXT,
	"tranchesRequested" INTEGER DEFAULT 0,
	"state" INTEGER DEFAULT 0,
	"orderUrl" TEXT,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")
);

INSERT INTO "property_leads" ("propertyId","email","tranchesRequested") VALUES(1, 'info@cjmtrading.xyz','3');


DROP TABLE IF EXISTS property_token;

CREATE TABLE "property_token" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"name"	TEXT,
	"contractAddress" TEXT,
	"blockExplorerUrl" TEXT,
	"mintedAddress" TEXT,
	"mintedUserId" TEXT,
	"contractSymbol" TEXT,
	"totalSupply" REAL,
	"isDeployed" INTEGER DEFAULT 0,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_userId" FOREIGN KEY ("mintedUserId") REFERENCES "_user"("id")
);



INSERT INTO "property_token" ("name","contractAddress","blockExplorerUrl","mintedAddress","mintedUserId","contractSymbol","totalSupply","propertyId") VALUES ('dcondo001Token','0x97690a5c72122A6Ae11e5e702368774cf636E0d3','https://testnet.bscscan.com/token/0x97690a5c72122A6Ae11e5e702368774cf636E0d3','0x960f470cE20Bfb519facA30b770474BBCdF78ef8','1','DC1',1800000.00,1);

DROP TABLE IF EXISTS property_owner;

CREATE TABLE "property_owner" (
	"id"	INTEGER,
	"userId" INTEGER,
	"propertyId" INTEGER,
	"propertyTokenId" INTEGER,
	"name"	TEXT,
	"tokenAmount" REAL,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES "_user"("id"),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_propertyTokenId" FOREIGN KEY ("propertyTokenId") REFERENCES "property_token"("id")
);


INSERT INTO "property_owner" ("userId","name","tokenAmount","propertyTokenId","propertyId") VALUES (1,"Jonesy",1000000,1,1);


DROP TABLE IF EXISTS property_distribution;

CREATE TABLE "property_distribution" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"propertyOwnerId" INTEGER,
	"name"	TEXT,
	"description" TEXT,
	"amountLocal" REAL,
	"amountInternational" REAL,
	"amountCrypto" REAL,
	"hash" TEXT,
	"paidBy" TEXT DEFAULT 1,
	"BTCExchangeRate" REAL DEFAULT 0,
	"ETHExchangeRate" REAL DEFAULT 0,
	"BNBExchnageRate" REAL DEFAULT 0,
	"datePaid" TEXT,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_propertyOwnerId" FOREIGN KEY ("propertyOwnerId") REFERENCES "property_owner"("id")

);

INSERT INTO "property_distribution" ("name","description","amountLocal","amountInternational","paidBy","datePaid","propertyId","propertyOwnerId") VALUES ('cryptoskillz','',10000,289,6,'2021-05-05',1,1);



DROP TABLE IF EXISTS rental_agreement;

CREATE TABLE "rental_agreement" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"agentId" INTEGER,
	"tenantId" INTEGER,
	"name"	TEXT,
	"amount" REAL,
	"deposit" REAL, 
	"contract" TEXT,
	"startDate" TEXT,
	"endDate" TEXT,
	"active" INTEGER,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")

);

INSERT INTO "rental_agreement" ("name","amount","deposit","contract","startDate","endDate","active","agentId","propertyId","tenantId") VALUES ('dcondo1',6700,194,'','2021-04-04','2022-04-04',0,1,1,1);
INSERT INTO "rental_agreement" ("name","amount","deposit","contract","startDate","endDate","active","agentId","propertyId","tenantId") VALUES ('dcondo2',8000,16000,'','2022-08-01','2023-08-01',1,1,1,1);

DROP TABLE IF EXISTS rental_cost;


CREATE TABLE "rental_cost" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"type"	TEXT,
	"name" TEXT,
	"amountLocal" REAL,
	"amountInternational" REAL,	"datePaid" TEXT,
	"paidBy" TEXT DEFAULT 1,
	"BTCExchangeRate" REAL DEFAULT 0,
	"ETHExchangeRate" REAL DEFAULT 0,
	"BNBExchnageRate" REAL DEFAULT 0,
	"rentalId" INTEGER,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")

);

INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-06-06',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Maintenance','New keycard',200,20,'2021-06-06',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Maintenance','Service Charge 10%',20,1,'2021-06-06',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-07-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Maintenance','A circuit board digital door lock',3000,87,'2021-07-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Maintenance','Tile foolr repair',1000,29,'2021-07-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 10%',400,11,'2021-07-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-08-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Common Area Jul-Sep 2021',4091,118,'2021-08-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 5%',205,6,'2021-08-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-09-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-10-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-11-05',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-12-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Common Area Oct-Dec 2021',4091,118,'2021-12-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 5%',205,6,'2021-1210',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Misc','The waffles and drinks',985,26,'2021-12-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-01-11',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','New Water heater',3500,101,'2022-01-11',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 10%',350,10,'2022-01-11',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-02-14',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Common Area Jan - Mar 2022',4091,118,'2022-02-14',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 5%',205,6,'2022-02-14',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-03-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-04-11',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-05-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Finders Fee for renew 12 months',3350,97,'2022-05-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Common Area Apr - Jun 2022',4091,118,'2022-05-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Building insurance 2022',335,9,'2022-05-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Lift Mantenance 2022',543,16,'2022-05-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 5%',249,7,'2022-05-10',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-06-13',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-07-08',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-08-08',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Common Area Jul - Sep 2022',500,14,'2022-08-08',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 5%',500,14,'2022-08-08',1,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Finders Fee',8000,231,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Immigration',500,14,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','360 Tour and 1st Year Hosting',1000,29,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Cleaning Room ',700,20,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Cleaning Bedsheet',350,10,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Repairs',1760,51,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Dining set',395,11,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Electric Bill Jun - Jul 2022',472,13,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Water Bill Apr, Jun - Jul 2022',125,3,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 10% ',275,8,'2022-08-31',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Quick Cleaning Room',300,9,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Aircon clean 1 Unit',700,20,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','New bedsheet set+Delivery to tenant',1781,52,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Matress protector',480,14,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Repair shower',450,13,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Repair shower',1600,46,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Electric Bill Aug 2022',97,3,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 10% ',441,13,'2022-09-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2022-10-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Common Area Oct - Dec 2022',3192,92,'2022-10-20',2,1);
INSERT INTO "rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Service','Service Charge 5%',160,5,'2022-10-20',2,1);

DROP TABLE IF EXISTS rental_payment;

CREATE TABLE "rental_payment" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"rentalId" INTEGER,
	"type"	TEXT,
	"name" TEXT,
	"amountLocal" REAL,
	"amountInternational" REAL,
	"datePaid" TEXT,
	"paidBy" TEXT DEFAULT 1,
	"BTCExchangeRate" REAL DEFAULT 0,
	"ETHExchangeRate" REAL DEFAULT 0,
	"BNBExchnageRate" REAL DEFAULT 0,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-04-02',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-05-05',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-06-06',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-07-05',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-08-05',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-09-02',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-10-05',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-11-05',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-12-10',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-01-11',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-02-14',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-03-10',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-04-11',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-06-13',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-07-08',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-07-08',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2022-07-09',1,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',8000,231,'2022-08-31',2,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',8000,231,'2022-09-20',2,1);
INSERT INTO "rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',8000,231,'2022-10-22',2,1);

/*
END OF PROPERTY TABLES
*/ 
/*
END OF CUSTOM TABLES
*/