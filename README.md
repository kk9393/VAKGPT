# VAKGPT: An Open-Source Alternative to ChatGPT!

VAKGPT is an open-source project aimed at building a conversational AI platform similar to ChatGPT. Our goal is to create a highly scalable, modular, and customizable platform that enables developers to build innovative conversational AI applications.


## Key Features:

Conversational AI Engine: Built using state-of-the-art language models
Modular Architecture: Easily extensible and customizable to suit various use cases
Scalable: Designed to handle large volumes of conversations and user interactions
Open-Source: Community-driven development and maintenance


## Instructions:

1. Clone the repository:
```sh
git clone https://github.com/kk9393/VAKGPT
```


2. Run frontend:
```sh
cd frontend
npm install
npm run dev
```


3. Run backend:
    ```sh
    cd backend
    ```

    - **Install dependencies**
        ```sh
        poetry install
        ```
    - **Set up environment variables**
        Create a .env file and add:
        ``` sh
        DEEPINFRA_API_TOKEN=your_deepinfra_api_key
        MONGODB_CONNECTION_STRING=your_mongodb_connection_string
        CHAT_HISTORY_DATABASE_NAME=your_mongodb_history_db_name
        ```
    - **Run the server**
        ```sh
        poetry run uvicorn app.main:app --reload
        ```   

## Contributions Welcome!

We invite developers, researchers, and enthusiasts to contribute to VAKGPT. Join our community to help shape the future of conversational AI.


## Join Community

[![Join our Discord server!](https://invidget.switchblade.xyz/3CS9a9YHfx)](https://discord.gg/3CS9a9YHfx)


Join our discussion forum to connect with our community. Let's build the future of conversational AI together!
