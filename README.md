# Spotify record

> **NOTE: This project is under development is not production ready!**

## How it works

This application connects to the user's Spotify account in order for the application to keep track of their play history. By allowing the application to save all the data, it makes it possible to generate more data/status from the user's use of Spotify at any time. As an example, this makes it possible to keep track on how much music the user has been listening to for the last year/month/week/day (depending on when the user first connected/stated to use this application).

---

## Setup

### Spotify application

First step is to create a new spotify application, you can do so from [your dashboard on spotify](https://developer.spotify.com/dashboard/applications)

![Create an Spotify applciation](https://raw.githubusercontent.com/jjmss/spotify-record/master/images/create-spotify-app.png)

When the application is created, you may want to whitelist a callback uri for the application to prevent unwanted access. You can do this by clicking "Edit Settings" and then entering the wanted uri (default http://localhost:3000).
![Set Spotify application redirect uri](https://raw.githubusercontent.com/jjmss/spotify-record/master/images/set-redirect-uri.png)

---

### Environment Variables

To run this project, you will need to add the following environment variables to your .env file

| Variable                | Description                                                                                                |
| :---------------------- | :--------------------------------------------------------------------------------------------------------- |
| `PORT`                  | The port to run the server on                                                                              |
| `SPOTIFY_CLIENT_ID`     | The client id is the id of the spotify application found in your dashboard                                 |
| `SPOTIFY_CLIENT_SECRET` | The secret is displayed after clicking _SHOW CLIENT SECRET_ below the client id on the spotify application |
| `MONGO_URI`             | The mongodb connection uri, this is used to store the the users playhistory                                |

## How to use

### Connect to the application

As of this state of the project, after you have started the appliation you can go to the following path

```http
http://localhost:3000/login
```

### See the status of the users/workers

You should then be able to see the status of the current user/worker by the following path

```http
http://localhost:3000/worker/<userid>
```

### Actions to the user/worker

If needed, you are able to resume or pause the user/worker from running

```http
http://localhost:3000/worker/<userid>/pause
http://localhost:3000/worker/<userid>/resume
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
