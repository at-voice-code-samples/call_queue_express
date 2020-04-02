# Africa's Talking Call Queueing and Dequeueing Demo

> A Simple demo built on NodeJS (Express) to demonstrate call queueing and dequeueing. 


## Requirements

- Virtual Numbers (2)
    - One for Call Queueing 
    - One for Call Dequeueing

- Redis
    - Temporarily store session info
    - Handle call queue workers


## Flow

```mermaid 
Bob -(Calls Queueing Number)->Prompted to select to speak to agent or mgt(DTMF)->Put into a call Queue

Alice -(Calls Dequeueing Number)->Prompted to dequeue agent or mgt(DTMF)->Dequeues Bob
```

## Configuration (very important)

- Set callback on account for both virtual numbers to `{HOSTNAME}/voice/inbound` . Where `HOSTNAME` is the public URL pointing to your app.

- When running the app, set the env variables `REDIS_CONN_STRING` , `REDIS_HOST` to point to your Redis instance. 

- Also set the variable `HOSTNAME` to point to your app's public URL.

- See [package.json](./package.json) for  more.

- Edit the the [credentials](./src/config/credentials.js) file and add your queueing number (nQnumber) and dequeueing number (dQNumber).


## Fun excercise

- Find out how many calls are in the queue.