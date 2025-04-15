
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
END OF CUSTOM TABLES
*/