/*
THESE ARE THE CORE TABLES 
*/


-- Table: _user
-- This table stores user information including contact details, credentials, and status flags.
-- add any extra fields to this table to extend the table
-- TODO add a copy of this to tmp, move this file across and replace it with the default on and then do the commit
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
	"adminId" INTEGER, -- Reference to the admin managing the property
	"name" VARCHAR(255) NOT NULL, -- Name of the property
	"paymentAddress" TEXT, -- Payment address for the property
	"address1" TEXT, -- Address line 1
	"address2" TEXT, -- Address line 2
	"address3" TEXT, -- Address line 3
	"address4" TEXT, -- Address line 4
	"address_5" TEXT, -- Address line 5
	"country" TEXT, -- Country
	"bedrooms" INTEGER CHECK(bedrooms IN (1, 2,3,4,5,7,8)) DEFAULT 1  NOT NULL, -- Number of bedroomsb
	"bathrooms"  INTEGER CHECK(bathrooms IN (1, 2,3,4,5,7,8)) DEFAULT 1  NOT NULL, -- Number of bedrooms
	"size" INTEGER DEFAULT 30, -- Size of the property in SQ
	"priceLocal" REAL,           -- e.g. 150.00 THB
  	"currency" TEXT DEFAULT 'THB', -- to support multi-currency in future
  	"exchangeRateToUSD" REAL,    -- e.g. 0.027 (THB to USD)
	"exchangeRateToBTC" REAL,         -- e.g. 0.00000039 (THB to BTC)
	"taxes" REAL,         -- Taxes
  	"priceUSD" REAL,
	"priceBTC" REAL,
	"suggestedRentalPrice" REAL, -- Suggested rental price in local currency
	"description" TEXT NOT NULL, -- Description of the property
	"map" TEXT NOT NULL, -- Google map of the property
	"propertyType" INTEGER DEFAULT 1, -- Type of the property
	"currentlyRented" BOOLEAN, -- Flag indicating if the property is currently rented
	"tranchePrice" REAL NOT NULL, -- Price per tranche
	"tranches" INTEGER DEFAULT 0, -- Number of tranches available
	"tranchesSold" INTEGER DEFAULT 0, -- Number of tranches sold
	"isDeleted" INTEGER DEFAULT 0, -- Flag indicating if the property is deleted
	"createdAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the property was created
	"updatedAt" TEXT, -- Timestamp when the property was last updated
	"publishedAt" TEXT DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the property was published
	"deletedAt" TEXT, -- Timestamp when the property was deleted
	CONSTRAINT "fk_adminId" FOREIGN KEY ("adminId") REFERENCES "_user"("id") -- Foreign key constraint referencing the _user table
);


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
 
/*
END OF CUSTOM TABLES
*/