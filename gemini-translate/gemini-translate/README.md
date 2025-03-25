# Sculptor Translate

Sculptor Translate is a web application that leverages the Gemini API to provide real-time translation between multiple languages.

## Features

-   Real-time translation using the Gemini API.
-   Support for multiple languages: English, Spanish, Chinese, Latin, French, and Swedish.
-   Automatic language detection.
-   User-friendly interface with clear input and output boxes.
-   Character count for input text with near-limit and at-limit indicators.
-   Copy to clipboard functionality for translated text.
-   Responsive design for use on various devices.

## Technologies Used

-   React
-   Gemini API
-   Ant Design Icons
-   CSS

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    cd gemini-translate
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    -   Create a [.env](http://_vscodecontentref_/1) file in the project root directory.
    -   Add your Gemini API key:

        ```
        REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```

    -   *(Optional)* Customize the character limit and translation debounce time:

        ```
        REACT_APP_MAX_CHAR_LIMIT=5000
        REACT_APP_TRANSLATION_DEBOUNCE_MS=800
        ```

4.  **Start the application:**

    ```bash
    npm start
    ```

    The application will be available at `http://localhost:3000`.

## Environment Variables

-   [REACT_APP_GEMINI_API_KEY](http://_vscodecontentref_/2): Your Gemini API key.  **Required.**
-   `REACT_APP_MAX_CHAR_LIMIT`:  Maximum number of characters allowed in the input text.  Defaults to 5000 if not set.
-   `REACT_APP_TRANSLATION_DEBOUNCE_MS`:  Debounce time in milliseconds for the translation function.  Defaults to 800ms if not set.

## Usage

1.  Select the source and target languages from the dropdown menus.  "Detect language" can be selected as the source language to automatically detect the language of the input text.
2.  Enter the text you want to translate in the input text area.
3.  The translated text will appear in the output text area in real-time.
4.  Click the "Copy" button to copy the translated text to your clipboard.
5.  Use the swap button to swap the source and target languages.

## Debugging

The application includes a debug function to test the Gemini API directly.  Open the browser console and call [window.debugGeminiAPI()](http://_vscodecontentref_/3) to run the debug test.  This will check the environment variables and test basic API connectivity.