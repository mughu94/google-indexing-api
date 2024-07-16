# Keyword Indexing Script

This script fetches keywords from a remote JSON file, processes them, and submits them to the Google Indexing API. It ensures that each keyword is only submitted once by maintaining a log file.

## Prerequisites

- Node.js installed on your machine.
- Google Cloud project with Indexing API enabled.
- OAuth 2.0 credentials for your Google Cloud project.
- Access to `output.json` containing keywords.

## Setup

1. **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/keyword-indexing-script.git
    cd keyword-indexing-script
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Configure Google Cloud OAuth 2.0 credentials:**
    - Create OAuth 2.0 credentials in your Google Cloud project.
    - Download the `client_secret.json` file and place it in the project root directory.

## Running the Script

1. **Authenticate with Google:**
    The first time you run the script, you'll be prompted to authenticate with Google. Follow the instructions in the terminal to authorize access.

    ```sh
    node index.js
    ```

2. **Subsequent Runs:**
    The script will use the stored token from the first authentication, so you won't need to re-authenticate.

## File Descriptions

- `index.js`: Main script file.
- `client_secret.json`: Google OAuth 2.0 client credentials.
- `token.json`: Stored OAuth 2.0 token for subsequent runs.
- `log.txt`: Log file to track submitted keywords.

## Script Details

### fetchKeywords()

Fetches keywords from `output.json` located at `https://proxy.servyoutube.com/gtrends/output.json`.

### isSubmitted(keyword)

Checks if a keyword has already been submitted by looking in the `log.txt` file.

### authorize(credentials, callback)

Creates an OAuth2 client with the given credentials and executes the provided callback function.

### getAccessToken(oAuth2Client, callback)

Prompts the user to authorize access and stores the retrieved token for future use.

### processKeywords(auth)

Processes keywords and calls the Google Indexing API to submit them. Logs the success or error of each submission.

## Logging

The script logs each keyword submission to `log.txt` with a timestamp and status (success or error).

## Error Handling

If an error occurs during the keyword fetching or submission process, it will be logged to `log.txt`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
