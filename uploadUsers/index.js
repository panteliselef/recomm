'use strict';

const fs = require('fs');
const fetch = require('node-fetch');

fs.readFile('../users.json', (err, data) => {
    if (err) throw err;
    let users = JSON.parse(data);

    users.map(async (user)=> {
        const response = await fetch('http://localhost:8080/api/users', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(user) // body data type must match "Content-Type" header
          });
          return response.json();
        // console.log(user.photoUrl);
    })
    // console.log(users);
});

// console.log('This is after the read call');
