# AdminJamstack

AdminJamstack is a backend admin control panel built to run on Cloudflare Pages.

### Features

- Builds table management and full API from a `schema.sql` file in a JAM style
- Builds the whole admin as JAM stack, allowing you to easily push to Cloudflare
- Creates an endpoint for each table in the Cloudflare Pages functions directory from the `APIGenerator` file
- Full user management using JWT
- Allows you to write custom code in the `_custom` directory to avoid code mixing

### Usage

1. **Clone the repository**

    ```bash
    git clone https://github.com/OrbitLabsDAO/adminjamstack.git
    ```

2. **Place a SQL file** in the `sql` directory (or use the example one)

3. **Install dependencies**

    ```bash
    npm install
    ```

4. **Initialise the project**

    ```bash
    ./build.sh init
    ```

    This will do the following:
    - Create a folder called `_custom`
    - **Note**: `_custom` contains some example override files for you to use
    - Copy the `_env` file to `.env`
    - Copy the `_wrangler.toml` file to `wrangler.toml`
    - Copy the `_dev.vars` file to `.dev.vars`

5. **Create the database**

    ```bash
    ./build.sh db
    ```

    This will create a database called `adminjackstack` and provide you with an ID. Paste this into the `wrangler.toml` file. If you have created the database already, update the ID and name. If you change the name, make sure to also update it in the `build.sh` script.

6. **Install the database locally**

    ```bash
    ./build.sh dbimport:local
    ```

7. **Start the project**

    ```bash
    ./build.sh start
    ```

### Available Build Commands

- **Reset the core files**

    ```bash
    ./build.sh integrity
    ```

- **Kill Wrangler**

    ```bash
    ./build.sh kill
    ```

- **Create the database**

    ```bash
    ./build.sh db
    ```

- **Build the SQL locally**

    ```bash
    ./build.sh dbimport:local
    ```

- **Build the SQL in production**

    ```bash
    ./build.sh dbimport:prod
    ```

- **Generate the site**

    ```bash
    ./build.sh
    ```

- **Launch a local version of the site**

    ```bash
    ./build.sh start
    ```

### Tests

To run the Jest tests:

```bash
npm test
