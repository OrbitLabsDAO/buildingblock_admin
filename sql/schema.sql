DROP TABLE IF EXISTS property;
DROP TABLE IF EXISTS property_amenities;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS userAccess;
DROP TABLE IF EXISTS adminuser;

CREATE TABLE "property" (
	"id"	INTEGER,
	"name"	VARCHAR(255),
	"paymentAddress" TEXT,
	"address_1"	TEXT,
	"address_2"	TEXT,
	"address_3"	TEXT,
	"address_4"	TEXT,
	"address_5"	TEXT,
	"address_6"	TEXT,
	"description" TEXT,
	"bathrooms" INTEGER,
	"bedrooms" INTEGER,
	"garage" INTEGER DEFAULT 0,
	"area" INTEGER DEFAULT 0,
	"propertyType" INTEGER DEFAULT 0,
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
	"adminId" INTEGER,
	"state" INTEGER DEFAULT 0,
	"tranchePrice" REAL,
	"tranches" INTEGER,
	"tranchesSold" INTEGER DEFAULT 0,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "property" ("name","paymentAddress","address_1", "address_2","address_3", "address_4", "address_5", "address_6","bathrooms","bedrooms","localCurrency","internationalCurrency","localCost","internationalCost","LocalTaxesCost","internationalTaxesCost","adminId","localSuggestedRentalPrice","internationalSuggestedRentalPrice","currentlyRented","description","area","location","tranchePrice","tranches") VALUES ('DCONDO', '0x960f470cE20Bfb519facA30b770474BBCdF78ef8','address 1', 'address 2', 'address 3', 'address 4', 'address 5', 'address 6',1,2,'฿','$',1800000,52087,40000,1157,1,8000,231,1,'Situated on the first floor is this well laid out 30 square metre studio apartment at Dcondo Sign, Chiang Mai. Rent: 9,000 THB/Month.<br>Property description:30 square metres of living space set on the first floor<br>Studio apartment with sliding doors to separate living space from sleeping if desired<br>Separate kitchen with fridge and microwave<br>Modern bathroom with screened walk-in shower<br>Fully furnished and equipped<br>Air-con (1 unit)<br>Dcondo Sign residents have the full use of the amazing swimming pool, fitness room, gardens, etc., and only a few minutes walk to Central Festival Shopping Mall.
',340,'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.764847935789!2d99.01166282449663!3d18.8086301464348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a61db5fb68b%3A0xbd73456383721335!2sdcondo%20sign!5e0!3m2!1sen!2sth!4v1673361006602!5m2!1sen!2sth
',1000,10);
INSERT INTO "property" ("name","paymentAddress","address_1", "address_2","address_3", "address_4", "address_5", "address_6","bathrooms","bedrooms","localCurrency","internationalCurrency","localCost","internationalCost","LocalTaxesCost","internationalTaxesCost","adminId","localSuggestedRentalPrice","internationalSuggestedRentalPrice","currentlyRented","description","area","location","tranchePrice","tranches") VALUES ('DCONDO 2', '0x960f470cE20Bfb519facA30b770474BBCdF78ef8','address 1', 'address 2', 'address 3', 'address 4','address 5','address 6',1,2,'฿','$',1800000,52087,40000,1157,1,8000,231,1,'Situated on the first floor is this well laid out 30 square metre studio apartment at Dcondo Sign, Chiang Mai. Rent: 9,000 THB/Month.<br>Property description:30 square metres of living space set on the first floor<br>Studio apartment with sliding doors to separate living space from sleeping if desired<br>Separate kitchen with fridge and microwave<br>Modern bathroom with screened walk-in shower<br>Fully furnished and equipped<br>Air-con (1 unit)<br>Dcondo Sign residents have the full use of the amazing swimming pool, fitness room, gardens, etc., and only a few minutes walk to Central Festival Shopping Mall.
',340,'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.764847935789!2d99.01166282449663!3d18.8086301464348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a61db5fb68b%3A0xbd73456383721335!2sdcondo%20sign!5e0!3m2!1sen!2sth!4v1673361006602!5m2!1sen!2sth
',1000,10);




CREATE TABLE "property_amenities" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"name" TEXT,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "property_amenities" ("propertyId","name") VALUES(1, 'Balcony');
INSERT INTO "property_amenities" ("propertyId","name") VALUES(1, 'Deck');


CREATE TABLE "property_images" (
	"id"	INTEGER,
	"propertyId" INTEGER,
	"cfid"	INTEGER,
	"filename"	TEXT,
	"url" TEXT,
	"draft" INTEGER DEFAULT 1,
	"isDeleted" INTEGER DEFAULT 0,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);


INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, '99ad01ac-062d-44f1-3c9d-69e1bf815700','Dcondo-Sign-Chiang-Mai-rental-condos-1.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/99ad01ac-062d-44f1-3c9d-69e1bf815700/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, '5533613e-0a07-49eb-3473-620816344100','Dcondo-Sign-Chiang-Mai-rental-condos-2.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/5533613e-0a07-49eb-3473-620816344100/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, 'abcb400b-4251-446e-5620-0f3116b61900','Dcondo-Sign-Chiang-Mai-rental-condos-3.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/abcb400b-4251-446e-5620-0f3116b61900/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, '12f4701b-5405-4bf6-8229-85014d90d900','Dcondo-Sign-Chiang-Mai-rental-condos-4.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/12f4701b-5405-4bf6-8229-85014d90d900/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, 'f85925a6-a125-4a2b-d06a-2d5190e64100','Dcondo-Sign-Chiang-Mai-rental-condos-5.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/f85925a6-a125-4a2b-d06a-2d5190e64100/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, '3715cd29-2f97-4a67-d13b-a23e19b1fe00','Dcondo-Sign-Chiang-Mai-rental-condos-6.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/3715cd29-2f97-4a67-d13b-a23e19b1fe00/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES(1, '4841458b-8665-4ca9-1c50-4089c47ee300','Dcondo-Sign-Chiang-Mai-rental-condos-7.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/4841458b-8665-4ca9-1c50-4089c47ee300/public');



CREATE TABLE "adminuser" (
	"id"	INTEGER,
	"name"	TEXT,
	"email" TEXT,
	"phone" TEXT,
	"cryptoAddress" TEXT,
	"username" TEXT,
	"password" TEXT,
	"apiSecret" TEXT,
	"confirmed" TEXT DEFAULT 0,
	"verifyCode" TEXT,
	"isVerified" INTEGER DEFAULT 0,
	"isBlocked" INTEGER DEFAULT 0,
	"isAdmin" INTEGER DEFAULT 0,
	"resetPassword" INTEGER DEFAULT 0,
	"adminId" INTEGER,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "adminuser" ("name","email","phone","cryptoAddress","username","password","apiSecret","confirmed","isBlocked","isAdmin","isDeleted","adminId") VALUES ('cryptoskillz','test@orbitlabs.xyz','123456789','0x1521a6B56fFF63c9e97b9adA59716efF9D3A60eB','cryptoskillz','test','a7fd098f-79cf-4c37-a527-2c9079a6e6a1',1,0,1,0,0);
INSERT INTO "adminuser" ("name","email","phone","cryptoAddress","username","password","apiSecret","confirmed","isBlocked","isAdmin","isDeleted","adminId") VALUES ('seller 2','test@test.com','123456789','0x060A17B831BFB09Fe95B244aaf4982ae7E8662B7','test','test','a7fd098f-79cf-4c37-a527-2c9079a6e6a1',1,0,0,0,1);


CREATE TABLE "userAccess" (
	"id"	INTEGER,
	"userId"	INTEGER,
	"foreignId" INTEGER,
	"isDeleted" INTEGER DEFAULT 0,
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TEXT,
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "userAccess" ("userId","foreignId") VALUES (1,1);
INSERT INTO "userAccess" ("userId","foreignId") VALUES (2,1);
