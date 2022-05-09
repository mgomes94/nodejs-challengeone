const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (user) {
    next();
    return;
  }

  response.status(404).send({ error: 'User not found!' });
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if (todo) {
    next();
    return;
  }

  response.status(404).send({ error: 'Todo not found!' });
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  var userExists = users.find(user => user.username === username);

  if (userExists)
    return response.status(400).send({ error: "Username already exists!" });

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: new Array()
  };

  users.push(user);

  response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  const user = users.find(user => user.username === username);

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {

  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  todo.done = true;

  response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  const index = user.todos.indexOf(todo);

  user.todos.splice(index, 1);

  response.status(204).send();
});

module.exports = app;