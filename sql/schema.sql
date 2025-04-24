/*
THESE ARE THE CORE TABLES 
*/


-- Table: _user
-- This table stores user information including contact details, credentials, and status flags.
-- add any extra fields to this table to extend the table
-- TODO add a copy of this to tmp, move this file across and replace it with the default on and then do the commit

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS _user;

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

-- Table: property
-- This table stores information about properties including their location, description, and financial details.
-- This is an example table so you can see how it works, start foreign keys with fk_ add NOT NULL to make it required
DROP TABLE IF EXISTS property;

CREATE TABLE "property" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each property
	"adminId" INTEGER  NOT NULL, -- Reference to the admin managing the property
	"name" VARCHAR(25) NOT NULL, -- Name of the property
	"telephone" VARCHAR(25) , -- tel of the property
	"datePurchased" VARCHAR(10) DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Timestamp when the property was bought
	"paymentAddress" VARCHAR(255), -- Payment address for the property
	"address1" TEXT, -- Address line 1
	"address2" TEXT, -- Address line 2
	"address3" TEXT, -- Address line 3
	"address4" TEXT, -- Address line 4
	"address5" TEXT, -- Address line 5
	"country" VARCHAR(4) NOT NULL, -- Country
	"bedrooms" INTEGER CHECK(bedrooms IN (1, 2,3,4,5,7,8)) DEFAULT 1  NOT NULL, -- Number of bedrooms
	"bathrooms"  INTEGER CHECK(bathrooms IN (1, 2,3,4,5,7,8)) DEFAULT 1  NOT NULL, -- Number of bedrooms
	"size" INTEGER DEFAULT 30, -- Size of the property in SQ
	"priceLocal" REAL,           -- e.g. 150.00 THB
  	"currency" VARCHAR(10) DEFAULT 'THB', -- to support multi-currency in future
  	"exchangeRateToUSD" REAL,    -- e.g. 0.027 (THB to USD)
	"exchangeRateToBTC" REAL,         -- e.g. 0.00000039 (THB to BTC)
	"taxes" REAL,         -- Taxes
  	"priceUSD" REAL,
	"priceBTC" REAL,
	"suggestedRentalPrice" REAL, -- Suggested rental price in local currency
	"description" TEXT NOT NULL, -- Description of the property
	"map" TEXT NOT NULL, -- Google map of the property
	"propertyType" INTEGER  DEFAULT 1 NOT NULL , -- Type of the property could store this in env for easier updating
	"currentlyRented" BOOLEAN DEFAULT 1  NOT NULL, -- Flag indicating if the property is currently rented
	"tranchePrice" REAL NOT NULL, -- Price per tranche
	"tranches" INTEGER DEFAULT 0, -- Number of tranches available
	"tranchesSold" INTEGER DEFAULT 0, -- Number of tranches sold
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the property is deleted
	"createdAt" VARCHAR(10) DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the property was created
	"updatedAt" VARCHAR(10) , -- Timestamp when the property was last updated
	"publishedAt" VARCHAR(10)  DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the property was published
	"deletedAt" VARCHAR(10) , -- Timestamp when the property was deleted
	CONSTRAINT "fk_adminId" FOREIGN KEY ("adminId") REFERENCES "_user"("id") -- Foreign key constraint referencing the _user table
);


/*
START PROPERTY TABLES
*/

INSERT INTO "property" (
  "name",
  "adminId",
  "paymentAddress",
  "address1",
  "country",
  "bathrooms",
  "bedrooms",
  "priceLocal",
  "currency",
  "exchangeRateToUSD",
  "exchangeRateToBTC",
  "taxes",
  "suggestedRentalPrice",
  "currentlyRented",
  "description",
  "map",
  "tranchePrice",
  "tranches"
) 
VALUES (
  'DCONDO',
  1,
  '0x960f470cE20Bfb519facA30b770474BBCdF78ef8',
  'Fa Ham, Thailand',
  'Thailand',
  1,
  2,
  1800000,
  '฿',
  0.027,
  0.01,
  52087,
  8000,
  1,
  'Situated on the first floor is this well laid out 30 square metre studio apartment at Dcondo Sign, Chiang Mai. Rent: 9,000 THB/Month.<br>Property description:30 square metres of living space set on the first floor<br>Studio apartment with sliding doors to separate living space from sleeping if desired<br>Separate kitchen with fridge and microwave<br>Modern bathroom with screened walk-in shower<br>Fully furnished and equipped<br>Air-con (1 unit)<br>Dcondo Sign residents have the full use of the amazing swimming pool, fitness room, gardens, etc., and only a few minutes walk to Central Festival Shopping Mall.',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.764847935789!2d99.01166282449663!3d18.8086301464348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a61db5fb68b%3A0xbd73456383721335!2sdcondo%20sign!5e0!3m2!1sen!2sth!4v1673361006602!5m2!1sen!2sth',
  1000,
  10
);
-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS property_images;

-- Table: property_images
-- This table stores images associated with properties, including their metadata and foreign key reference to the property table.
CREATE TABLE "property_images" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each image
	"propertyId" INTEGER, -- Reference to the property this image belongs to
	"cfid" INTEGER, -- Cloudflare ID for the image
	"filename" TEXT, -- Filename of the image
	"url" TEXT, -- URL where the image is accessible
	"draft" INTEGER DEFAULT 1, -- Flag indicating if the image is a draft
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the image is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the image was created
	"updatedAt" TEXT, -- Timestamp when the image was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the image was published
	"deletedAt" TEXT, -- Timestamp when the image was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id") -- Foreign key constraint referencing the property table
);

-- Insert sample data into the property_images table
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, '99ad01ac-062d-44f1-3c9d-69e1bf815700','Dcondo-Sign-Chiang-Mai-rental-condos-1.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/99ad01ac-062d-44f1-3c9d-69e1bf815700/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, '5533613e-0a07-49eb-3473-620816344100','Dcondo-Sign-Chiang-Mai-rental-condos-2.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/5533613e-0a07-49eb-3473-620816344100/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, 'abcb400b-4251-446e-5620-0f3116b61900','Dcondo-Sign-Chiang-Mai-rental-condos-3.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/abcb400b-4251-446e-5620-0f3116b61900/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, '12f4701b-5405-4bf6-8229-85014d90d900','Dcondo-Sign-Chiang-Mai-rental-condos-4.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/12f4701b-5405-4bf6-8229-85014d90d900/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, 'f85925a6-a125-4a2b-d06a-2d5190e64100','Dcondo-Sign-Chiang-Mai-rental-condos-5.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/f85925a6-a125-4a2b-d06a-2d5190e64100/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, '3715cd29-2f97-4a67-d13b-a23e19b1fe00','Dcondo-Sign-Chiang-Mai-rental-condos-6.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/3715cd29-2f97-4a67-d13b-a23e19b1fe00/public');
INSERT INTO "property_images" ("propertyId","cfid","filename","url") VALUES (1, '4841458b-8665-4ca9-1c50-4089c47ee300','Dcondo-Sign-Chiang-Mai-rental-condos-7.webp','https://imagedelivery.net/9dYZtR12J2uzlEZe4Joa5w/4841458b-8665-4ca9-1c50-4089c47ee300/public');

-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS property_amenities;

-- Table: property_amenities
-- This table stores amenities associated with properties, including their names and foreign key reference to the property table.
CREATE TABLE "property_amenities" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each amenity
	"propertyId" INTEGER, -- Reference to the property this amenity belongs to
	"name" TEXT NOT NULL, -- Name of the amenity
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the amenity is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the amenity was created
	"updatedAt" TEXT, -- Timestamp when the amenity was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the amenity was published
	"deletedAt" TEXT, -- Timestamp when the amenity was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id") -- Foreign key constraint referencing the property table
);

-- Insert sample data into the property_amenities table
INSERT INTO "property_amenities" ("propertyId","name") VALUES (1, 'Balcony');
INSERT INTO "property_amenities" ("propertyId","name") VALUES (1, 'Deck');
/*
DROP TABLES
*/

/* Drop existing property_tenant table to avoid conflicts */
DROP TABLE IF EXISTS property_tenant;

/* Create property_tenant table
   Stores information about tenants associated with properties */
CREATE TABLE "property_tenant" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each tenant
	"propertyId" INTEGER, -- Reference to the property this tenant is associated with
	"name" TEXT  NOT NULL, -- Name of the tenant
	"email" TEXT, -- Email of the tenant
	"phone" TEXT, -- Phone number of the tenant
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the tenant record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the tenant record was created
	"updatedAt" TEXT, -- Timestamp when the tenant record was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the tenant record was published
	"deletedAt" TEXT, -- Timestamp when the tenant record was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id") -- Foreign key constraint referencing the property table
);

/* Insert sample data into the property_tenant table */
INSERT INTO "property_tenant" ("name","email","phone") VALUES ('tenant 1','tenant1@gmail.com','0123456789');

/* Drop existing agent table to avoid conflicts */
DROP TABLE IF EXISTS agent;

/* Create agent table
   Stores information about agents */
CREATE TABLE "agent" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each agent
	"name" TEXT  NOT NULL, -- Name of the agent
	"email" TEXT, -- Email of the agent
	"url" TEXT, -- URL for the agents website or profile
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the agent record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the agent record was created
	"updatedAt" TEXT, -- Timestamp when the agent record was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the agent record was published
	"deletedAt" TEXT -- Timestamp when the agent record was deleted
);

/* Insert sample data into the agent table */
INSERT INTO "agent" ("name","email","url") VALUES ('Perfect Homes','','https://perfecthomes.th');

/* Drop existing property_rental_agreement table to avoid conflicts */
DROP TABLE IF EXISTS property_rental_agreement;

/* Create property_rental_agreement table
   Stores rental agreements between properties, agents, and tenants */
CREATE TABLE "property_rental_agreement" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each rental agreement
	"propertyId" INTEGER, -- Reference to the property this agreement is associated with
	"agentId" INTEGER, -- Reference to the agent involved in the agreement
	"tenantId" INTEGER, -- Reference to the tenant involved in the agreement
	"name" TEXT  NOT NULL, -- Name of the rental agreement
	"amount" REAL, -- Rental amount
	"deposit" REAL, -- Deposit amount
	"contract" TEXT, -- Contract details
	"startDate" TEXT, -- Start date of the rental agreement
	"endDate" TEXT, -- End date of the rental agreement
	"active" INTEGER, -- Flag indicating if the agreement is active
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the rental agreement is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the rental agreement was created
	"updatedAt" TEXT, -- Timestamp when the rental agreement was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the rental agreement was published
	"deletedAt" TEXT, -- Timestamp when the rental agreement was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_agentId" FOREIGN KEY ("agentId") REFERENCES "property_tenant"("id"), 
	CONSTRAINT "fk_tenantId" FOREIGN KEY ("tenantId") REFERENCES "agent"("id")
);

/* Insert sample data into the property_rental_agreement table */
INSERT INTO "property_rental_agreement" ("name","amount","deposit","contract","startDate","endDate","active","agentId","propertyId","tenantId") VALUES ('dcondo1',6700,194,'','2021-04-04','2022-04-04',0,1,1,1);
INSERT INTO "property_rental_agreement" ("name","amount","deposit","contract","startDate","endDate","active","agentId","propertyId","tenantId") VALUES ('dcondo2',8000,16000,'','2022-08-01','2023-08-01',1,1,1,1);

/* Drop existing property_rental_cost table to avoid conflicts */
DROP TABLE IF EXISTS property_rental_cost;

/* Create property_rental_cost table
   Stores costs associated with property rentals */
CREATE TABLE "property_rental_cost" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each rental cost
	"propertyId" INTEGER, -- Reference to the property the cost is associated with
	"rentalId" INTEGER, -- Reference to the rental agreement the cost is associated with
	"type" TEXT, -- Type of cost (e.g., management, maintenance)
	"name" TEXT  NOT NULL, -- Name/description of the cost
	"amountLocal" REAL, -- Cost amount in local currency
	"amountInternational" REAL, -- Cost amount in international currency
	"datePaid" TEXT, -- Date when the cost was paid
	"paidBy" TEXT DEFAULT 1, -- Who paid the cost
	"BTCExchangeRate" REAL DEFAULT 0, -- Bitcoin exchange rate at the time of payment
	"ETHExchangeRate" REAL DEFAULT 0, -- Ethereum exchange rate at the time of payment
	"BNBExchangeRate" REAL DEFAULT 0, -- Binance Coin exchange rate at the time of payment
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the rental cost record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the rental cost was created
	"updatedAt" TEXT, -- Timestamp when the rental cost was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the rental cost was published
	"deletedAt" TEXT, -- Timestamp when the rental cost was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_rentalId" FOREIGN KEY ("rentalId") REFERENCES "property_rental_agreement"("id")
);

/* Insert sample data into the property_rental_cost table */
-- Insert multiple rows of sample data for demonstration purposes
INSERT INTO "property_rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Management','Management',500,14,'2021-06-06',1,1);
INSERT INTO "property_rental_cost" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('Maintenance','New keycard',200,20,'2021-06-06',1,1);
-- Additional sample data omitted for brevity

/* Drop existing property_rental_payment table to avoid conflicts */
DROP TABLE IF EXISTS property_rental_payment;

/* Create property_rental_payment table
   Stores payments made for property rentals */
CREATE TABLE "property_rental_payment" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each rental payment
	"propertyId" INTEGER, -- Reference to the property the payment is associated with
	"rentalId" INTEGER, -- Reference to the rental agreement the payment is associated with
	"type" TEXT, -- Type of payment (e.g., rental payment)
	"name" TEXT  NOT NULL, -- Name/description of the payment
	"amountLocal" REAL, -- Payment amount in local currency
	"amountInternational" REAL, -- Payment amount in international currency
	"datePaid" TEXT, -- Date when the payment was made
	"paidBy" TEXT DEFAULT 1, -- Who made the payment
	"BTCExchangeRate" REAL DEFAULT 0, -- Bitcoin exchange rate at the time of payment
	"ETHExchangeRate" REAL DEFAULT 0, -- Ethereum exchange rate at the time of payment
	"BNBExchangeRate" REAL DEFAULT 0, -- Binance Coin exchange rate at the time of payment
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the rental payment record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the rental payment was created
	"updatedAt" TEXT, -- Timestamp when the rental payment was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the rental payment was published
	"deletedAt" TEXT, -- Timestamp when the rental payment was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_rentalId" FOREIGN KEY ("rentalId") REFERENCES "property_rental_agreement"("id")
);

/* Insert sample data into the property_rental_payment table */
-- Insert multiple rows of sample data for demonstration purposes
INSERT INTO "property_rental_payment" ("type","name","amountLocal","amountInternational","datePaid","rentalId","propertyId") VALUES ('rental payment','rental payment',6700,194,'2021-04-02',1,1);
-- Additional sample data omitted for brevity

/* Drop existing property_leads table to avoid conflicts */
DROP TABLE IF EXISTS property_leads;

/* Create property_leads table
   Stores leads for properties */
CREATE TABLE "property_leads" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each lead
	"propertyId" INTEGER, -- Reference to the property the lead is associated with
	"email" TEXT, -- Email of the lead
	"tranchesRequested" INTEGER DEFAULT 0, -- Number of tranches requested
	"state" INTEGER DEFAULT 0, -- State of the lead
	"orderId" TEXT, -- Order ID associated with the lead
	"orderUrl" TEXT, -- URL of the order
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the lead record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the lead was created
	"updatedAt" TEXT, -- Timestamp when the lead was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the lead was published
	"deletedAt" TEXT, -- Timestamp when the lead was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")
);

/* Insert sample data into the property_leads table */
INSERT INTO "property_leads" ("propertyId","email","tranchesRequested") VALUES(1, 'info@cjmtrading.xyz',3);

/* END PROPERTY TABLES */

/* START TOKEN TABLES */

/* Drop existing property_token table to avoid conflicts */
DROP TABLE IF EXISTS property_token;

/* Create property_token table
   Stores token information associated with properties */
CREATE TABLE "property_token" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each token
	"propertyId" INTEGER, -- Reference to the property the token is associated with
	"name" TEXT  NOT NULL, -- Name of the token
	"contractAddress" TEXT, -- Contract address of the token
	"blockExplorerUrl" TEXT, -- Block explorer URL for the token
	"mintedAddress" TEXT, -- Address where the token was minted
	"mintedUserId" TEXT, -- User ID of the minter
	"contractSymbol" TEXT, -- Symbol of the token contract
	"totalSupply" REAL, -- Total supply of the token
	"isDeployed" INTEGER DEFAULT 0, -- Flag indicating if the token contract is deployed
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the token record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the token was created
	"updatedAt" TEXT, -- Timestamp when the token was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the token was published
	"deletedAt" TEXT, -- Timestamp when the token was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id")
);

/* Insert sample data into the property_token table */
INSERT INTO "property_token" ("name","contractAddress","blockExplorerUrl","mintedAddress","mintedUserId","contractSymbol","totalSupply","propertyId") VALUES ('dcondo001Token','0x97690a5c72122A6Ae11e5e702368774cf636E0d3','https://testnet.bscscan.com/token/0x97690a5c72122A6Ae11e5e702368774cf636E0d3','0x960f470cE20Bfb519facA30b770474BBCdF78ef8','1','DC1',1800000.00,1);

/* Drop existing token_owner table to avoid conflicts */
DROP TABLE IF EXISTS token_owner;

/* Create token_owner table
   Stores information about token ownerships */
CREATE TABLE "token_owner" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each token owner
	"propertyId" INTEGER, -- Reference to the property the token is associated with
	"propertyTokenId" INTEGER, -- Reference to the property token
	"userId" INTEGER, -- User ID of the token owner
	"tokenAmount" REAL, -- Amount of tokens owned
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the token owner record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the token owner record was created
	"updatedAt" TEXT, -- Timestamp when the token owner record was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the token owner record was published
	"deletedAt" TEXT, -- Timestamp when the token owner record was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_propertyTokenId" FOREIGN KEY ("propertyTokenId") REFERENCES "property_token"("id")
);

/* Insert sample data into the token_owner table */
INSERT INTO "token_owner" ("tokenAmount","propertyTokenId","userId","propertyId") VALUES (1000000,1,1,1);

/* Drop existing property_distribution table to avoid conflicts */
DROP TABLE IF EXISTS property_distribution;

/* Create property_distribution table
   Stores distributions related to properties and token ownerships */
CREATE TABLE "property_distribution" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each distribution
	"propertyId" INTEGER, -- Reference to the property the distribution is associated with
	"tokenOwnerId" INTEGER, -- Reference to the token owner receiving the distribution
	"name" TEXT  NOT NULL, -- Name of the distribution
	"description" TEXT, -- Description of the distribution
	"amountLocal" REAL, -- Distribution amount in local currency
	"amountInternational" REAL, -- Distribution amount in international currency
	"amountCrypto" REAL, -- Distribution amount in cryptocurrency
	"hash" TEXT, -- Transaction hash
	"paidBy" TEXT DEFAULT 1, -- Who made the distribution
	"BTCExchangeRate" REAL DEFAULT 0, -- Bitcoin exchange rate at the time of distribution
	"ETHExchangeRate" REAL DEFAULT 0, -- Ethereum exchange rate at the time of distribution
	"BNBExchnageRate" REAL DEFAULT 0, -- Binance Coin exchange rate at the time of distribution
	"datePaid" TEXT, -- Date when the distribution was made
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the distribution record is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the distribution was created
	"updatedAt" TEXT, -- Timestamp when the distribution was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the distribution was published
	"deletedAt" TEXT, -- Timestamp when the distribution was deleted
	CONSTRAINT "fk_propertyId" FOREIGN KEY ("propertyId") REFERENCES "property"("id"),
	CONSTRAINT "fk_tokenOwnerId" FOREIGN KEY ("tokenOwnerId") REFERENCES "token_owner"("id")
);

/* Insert sample data into the property_distribution table */
INSERT INTO "property_distribution" ("name","description","amountLocal","amountInternational","paidBy","datePaid","propertyId","tokenOwnerId") VALUES ('cryptoskillz','',10000,289,6,'2021-05-05',1,1);


/*
END TOKEN TABLES
*/

/*
END OF CUSTOM TABLES
*/