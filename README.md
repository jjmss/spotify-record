# Spotify record

## How it works

## Setup

---

### Spotify application

First step is to create a new spotify application, you can do so from [your dashboard on spotify](https://developer.spotify.com/dashboard/applications)

![Create an Spotify applciation](https://raw.githubusercontent.com/jjmss/spotify-record/master/images/create-spotify-app.png)

When the application is created, you may want to whitelist a callback uri for the application to prevent unwanted access. You can do this by clicking "Edit Settings" and then entering the wanted uri (default http://localhost:3000).
![Set Spotify application redirect uri](https://raw.githubusercontent.com/jjmss/spotify-record/master/images/set-redirect-uri.png)

---

### .env file

```env
PORT
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
```

| Variable              | Description                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| PORT                  | The port to run the server on                                                                              |
| SPOTIFY_CLIENT_ID     | The client id is the id of the spotify application found in your dashboard                                 |
| SPOTIFY_CLIENT_SECRET | The secret is displayed after clicking _SHOW CLIENT SECRET_ below the client id on the spotify application |
